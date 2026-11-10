import multer from "multer";
import { asyncRouter } from "./asyncRouter.js";
import { databaseConfigured } from "../db.js";
import {
  createApplication,
  getTrainingships,
  recordApplicationEmails,
} from "../models/trainingships.js";
import { DOCUMENT_TYPES, MAX_DOCUMENT_BYTES, cleanFileName, detectDocumentType } from "../documentTypes.js";
import { storageConfigured, uploadDocument } from "../storage.js";
import { sendMail } from "../mailer.js";
import { applicationNotificationEmail } from "../applicationMail.js";
import { applicationCopyEmail } from "../visitorEmail.js";
import { createLoginLimiter } from "../loginLimiter.js";
import { EMAIL_PATTERN as EMAIL } from "../emailAddress.js";
import { readAttribution } from "../attribution.js";
import { CURRENT_STATUSES } from "../../../shared/trainingships.js";

/**
 * /api/trainingships: the Trainingships page's content (GET) and its
 * application form (POST /applications). An application is saved for
 * /admin → Trainingships, its CV (PDF or .docx, optional) stored privately,
 * the company inbox emailed with the CV, and the applicant emailed a
 * confirmation. A mail failure doesn't lose the application.
 */

const router = asyncRouter();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_BYTES + 1, files: 1, fields: 30, fieldSize: 20_000, parts: 35 },
});

// Per IP: 5 applications per 15 minutes; 40 overall.
const limiter = createLoginLimiter({ maxPerClient: 5, maxTotal: 40 });

function badRequest(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

router.get("/", async (_req, res) => {
  res.json(await getTrainingships());
});

function rateLimit(req, res, next) {
  const waitMs = limiter.consume(req.ip || "unknown");
  if (waitMs <= 0) return next();
  const minutes = Math.ceil(waitMs / 60000);
  res.set("Retry-After", String(Math.ceil(waitMs / 1000)));
  return res.status(429).json({
    error: `Too many applications from your connection. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
  });
}

function receiveFile(req, res, next) {
  upload.single("cv")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "That file is too large: attach a CV up to 4 MB." });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "Attach a single PDF or Word (.docx) file." });
    }
    next(err);
  });
}

const URL_PATTERN = /^https?:\/\/[^\s<>"'`]{3,300}$/i;

/** The form's fields, checked, as columns; `tracks` are the page's current tracks. */
function readApplication(body, tracks) {
  const field = (name, label, max, required = false) => {
    const raw = body[name];
    if (raw != null && typeof raw !== "string") throw badRequest(`${label} must be text`);
    const value = (raw ?? "").trim();
    if (required && !value) throw badRequest(`${label} is required`);
    if (value.length > max) throw badRequest(`${label} is too long`);
    return value;
  };
  const values = {
    first_name: field("firstName", "First name", 100, true),
    last_name: field("lastName", "Last name", 100, true),
    email: field("email", "Email", 254, true),
    phone: field("phone", "Phone", 40),
    current_status: field("currentStatus", "What you're doing now", 60, true),
    school: field("school", "School or organisation", 150),
    motivation: field("motivation", "Why you want to join", 3000, true),
    availability: field("availability", "Availability", 300),
  };
  if (!EMAIL.test(values.email)) throw badRequest("Enter a valid email");
  if (!/^[\d\s()+-]*$/.test(values.phone)) throw badRequest("Phone: use digits, spaces, +, - and brackets only");
  if (!CURRENT_STATUSES.includes(values.current_status)) throw badRequest("Choose what you're doing now");
  if (values.motivation.length < 50) throw badRequest("Tell us a bit more about why you want to join (at least 50 characters)");

  const track = tracks.find((t) => t.id === body.track);
  if (!track) throw badRequest("Choose a track");
  values.track_id = track.id;
  values.track = track.name;

  // Up to three links (portfolio, GitHub, LinkedIn), each a web address.
  const links = field("links", "Links", 1000).split(/\s+/).filter(Boolean);
  if (links.length > 3) throw badRequest("Add up to three links");
  for (const link of links) {
    if (!URL_PATTERN.test(link)) throw badRequest("Links must be web addresses starting with https://");
  }
  values.links = links.join("\n");

  const page = typeof body.page === "string" ? body.page.trim() : "";
  values.page = /^\/(?!\/)[^\s]{0,199}$/.test(page) ? page : "";
  return values;
}

router.post("/applications", rateLimit, receiveFile, async (req, res) => {
  const body = req.body || {};
  // Honeypot: only bots fill it. They're told it worked; nothing is kept or sent.
  if (body.botcheck) return res.status(201).json({ ok: true });
  if (!databaseConfigured) {
    return res.status(503).json({ error: "We couldn't send that right now. Please email us instead." });
  }

  const page = await getTrainingships();
  if (!page.open) throw badRequest("Applications are closed at the moment.", 409);
  const values = { ...readApplication(body, page.tracks), ...readAttribution(body), intake: page.intake };

  let cv = null;
  if (req.file) {
    const type = detectDocumentType(req.file.buffer);
    if (!type) throw badRequest("Attach your CV as a PDF or Word (.docx) document.", 415);
    cv = {
      name: cleanFileName(req.file.originalname, type),
      type: DOCUMENT_TYPES[type].mime,
      size: req.file.size,
      buffer: req.file.buffer,
    };
    values.cv_name = cv.name;
    values.cv_type = cv.type;
    values.cv_size = cv.size;
    if (storageConfigured) {
      try {
        values.cv_path = await uploadDocument(req.file.buffer, cv.type, type, "applications");
      } catch (err) {
        console.error("[applications] storing the CV failed:", err.message);
      }
    }
  }

  const application = await createApplication(values);

  const [notified, copied] = await Promise.allSettled([
    sendMail(applicationNotificationEmail(application, cv)),
    sendMail(applicationCopyEmail(application, { cvReceived: Boolean(values.cv_path) })),
  ]);
  const notifyError = notified.status === "rejected" ? notified.reason.message : null;
  const copyError = copied.status === "rejected" ? copied.reason.message : null;
  if (notifyError) console.error("[applications] emailing the inbox failed:", notifyError);
  if (copyError) console.error("[applications] emailing the applicant failed:", copyError);
  await recordApplicationEmails(application.id, { notifyError, copyError }).catch((err) =>
    console.error("[applications] recording the emails failed:", err.message)
  );

  // Tell them if their CV neither got stored nor went out by email.
  const fileReceived = !cv || Boolean(values.cv_path) || !notifyError;
  res.status(201).json({ ok: true, fileReceived, copySent: !copyError });
});

export default router;
