import multer from "multer";
import { asyncRouter } from "./asyncRouter.js";
import { databaseConfigured } from "../db.js";
import { createInquiry, recordNotification } from "../models/inquiries.js";
import {
  DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  cleanFileName,
  detectDocumentType,
} from "../documentTypes.js";
import { storageConfigured, uploadDocument } from "../storage.js";
import { sendMail } from "../mailer.js";
import { notificationEmail } from "../inquiryMail.js";
import { createLoginLimiter } from "../loginLimiter.js";
import { EMAIL_PATTERN as EMAIL } from "../emailAddress.js";
import { estimateRecord, getEstimator } from "../models/estimator.js";
import { formatRange, formatWeeks } from "../../../shared/estimator.js";

/**
 * POST /api/inquiries: the website's contact form (homepage and /contact)
 * and quote requests from the cost calculator (/app-cost-calculator).
 * Saves the inquiry for /admin, stores an attached PDF or .docx privately,
 * and emails the company inbox (INQUIRY_NOTIFY_EMAIL) with the attachment.
 * A mail failure doesn't lose the inquiry: it's still in /admin, flagged.
 *
 * A quote request sends `estimate`: the calculator's answers as JSON
 * ({type, size, design, pace, features, currency}). The estimate is worked
 * out again here from the current price list, and fills in the service,
 * budget and timeline; the message is optional.
 */

const router = asyncRouter();

const upload = multer({
  storage: multer.memoryStorage(),
  // busboy trips its limit on reaching it, so +1 lets exactly 4 MB through.
  limits: { fileSize: MAX_DOCUMENT_BYTES + 1, files: 1, fields: 20, fieldSize: 20_000, parts: 25 },
});

// Per IP: 6 submissions per 15 minutes; 60 overall stops a flood from many.
const limiter = createLoginLimiter({ maxPerClient: 6, maxTotal: 60 });



// Form field → column, its limit, and the message when a required one is blank.
const FIELDS = {
  firstName: { column: "first_name", label: "First name", max: 100, required: true },
  lastName: { column: "last_name", label: "Last name", max: 100, required: true },
  email: { column: "email", label: "Email", max: 254, required: true },
  phone: { column: "phone", label: "Phone", max: 40 },
  company: { column: "company", label: "Company", max: 150 },
  service: { column: "service", label: "Service", max: 100, required: true },
  budget: { column: "budget", label: "Budget", max: 80 },
  timeline: { column: "timeline", label: "Timeline", max: 80 },
  source: { column: "source", label: "How you heard about us", max: 80 },
  message: { column: "message", label: "Message", max: 5000, required: true },
  page: { column: "page", label: "Page", max: 200 },
};

function badRequest(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const ESTIMATE_MESSAGE = "Asked for a detailed quote from the cost calculator.";

/** The calculator's answers (a JSON field), as the estimate to keep; null for the contact form. */
async function readEstimate(body) {
  const raw = body.estimate;
  if (raw == null || raw === "") return null;
  let input;
  try {
    input = typeof raw === "string" ? JSON.parse(raw) : null;
  } catch {
    input = null;
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw badRequest("Your estimate didn't come through. Please refresh the page and try again.");
  }
  const record = estimateRecord(await getEstimator(), input);
  if (!record) throw badRequest("Choose what you're building to get an estimate.");
  return record;
}

/** The fields a quote request doesn't ask for, from its estimate. */
function estimateFields(estimate, message) {
  return {
    service: estimate.type.label,
    budget: `${formatRange(estimate, estimate.currency)} (estimate)`,
    timeline: `${formatWeeks(estimate)} (${estimate.pace.label})`,
    message: typeof message === "string" && message.trim() ? message : ESTIMATE_MESSAGE,
  };
}

function readFields(input, estimate) {
  const body = estimate ? { ...input, ...estimateFields(estimate, input.message) } : input;
  const values = {};
  for (const [field, rule] of Object.entries(FIELDS)) {
    const raw = body[field];
    if (raw != null && typeof raw !== "string") throw badRequest(`${rule.label} must be text`);
    const value = (raw ?? "").trim();
    if (rule.required && !value) throw badRequest(`${rule.label} is required`);
    if (value.length > rule.max) throw badRequest(`${rule.label} is too long`);
    values[rule.column] = value;
  }
  if (!EMAIL.test(values.email)) throw badRequest("Enter a valid email");
  if (!/^[\d\s()+-]*$/.test(values.phone)) {
    throw badRequest("Phone: use digits, spaces, +, - and brackets only");
  }
  // A quote request's notes are optional; its estimate says what it's about.
  if (!estimate && values.message.length < 10) {
    throw badRequest("Please tell us a bit more (min 10 characters)");
  }
  // Only ever a path on this site.
  if (!/^\/[^/]/.test(values.page) && values.page !== "/") values.page = "";
  return values;
}

// Before reading a body of up to 4 MB.
function rateLimit(req, res, next) {
  const waitMs = limiter.consume(req.ip || "unknown");
  if (waitMs <= 0) return next();
  const minutes = Math.ceil(waitMs / 60000);
  res.set("Retry-After", String(Math.ceil(waitMs / 1000)));
  return res.status(429).json({
    error: `Too many messages from your connection. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
  });
}

// multer's errors in the form's own words.
function receiveFile(req, res, next) {
  upload.single("attachment")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "That file is too large: attach one up to 4 MB." });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "Attach a single PDF or Word (.docx) file." });
    }
    next(err);
  });
}

router.post("/", rateLimit, receiveFile, async (req, res) => {
  const body = req.body || {};
  // Honeypot: hidden from people, so only bots fill it. They're told it
  // worked, but nothing is kept or sent.
  if (body.botcheck) return res.status(201).json({ ok: true });
  if (!databaseConfigured) {
    return res.status(503).json({ error: "We couldn't send that right now. Please email us instead." });
  }

  const estimate = await readEstimate(body);
  const values = readFields(body, estimate);
  if (estimate) values.estimate = JSON.stringify(estimate);

  let attachment = null;
  if (req.file) {
    const type = detectDocumentType(req.file.buffer);
    if (!type) throw badRequest("Attach a PDF or Word (.docx) document.", 415);
    attachment = {
      name: cleanFileName(req.file.originalname, type),
      type: DOCUMENT_TYPES[type].mime,
      size: req.file.size,
      buffer: req.file.buffer,
    };
    values.attachment_name = attachment.name;
    values.attachment_type = attachment.type;
    values.attachment_size = attachment.size;
    if (storageConfigured) {
      try {
        values.attachment_path = await uploadDocument(req.file.buffer, attachment.type, type);
      } catch (err) {
        // The file still goes out with the email below.
        console.error("[inquiries] storing the attachment failed:", err.message);
      }
    }
  }

  const inquiry = await createInquiry(values);

  let notifyError = null;
  try {
    await sendMail(notificationEmail(inquiry, attachment));
  } catch (err) {
    notifyError = err.message;
    console.error("[inquiries] emailing the inbox failed:", err.message);
  }
  await recordNotification(inquiry.id, notifyError).catch((err) =>
    console.error("[inquiries] recording the notification failed:", err.message)
  );

  // The message is in; tell them if their file neither got stored nor
  // went out by email, so they can send it another way.
  const fileReceived = !attachment || Boolean(values.attachment_path) || !notifyError;
  res.status(201).json({ ok: true, fileReceived });
});

export default router;
