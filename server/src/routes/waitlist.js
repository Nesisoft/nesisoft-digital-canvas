import { asyncRouter } from "./asyncRouter.js";
import { databaseConfigured } from "../db.js";
import { findPublishedPlatform } from "../models/projects.js";
import { addSignup } from "../models/waitlist.js";
import { createLoginLimiter } from "../loginLimiter.js";
import { EMAIL_PATTERN } from "../emailAddress.js";

/**
 * POST /api/waitlist: "Get early access" on a platform's page. Body (JSON):
 * { platform: slug, name, email, role, page }. Signing up twice for the same
 * platform is fine (the first signup is kept), and the answer is the same
 * either way, so the form can't be used to check who signed up.
 */

const router = asyncRouter();

// Per IP: 10 signups per 15 minutes; 100 overall.
const limiter = createLoginLimiter({ maxPerClient: 10, maxTotal: 100 });

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

const text = (value) => (typeof value === "string" ? value.trim() : "");

router.post("/", async (req, res) => {
  const waitMs = limiter.consume(req.ip || "unknown");
  if (waitMs > 0) {
    const minutes = Math.ceil(waitMs / 60000);
    res.set("Retry-After", String(Math.ceil(waitMs / 1000)));
    return res.status(429).json({
      error: `Too many signups from your connection. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    });
  }
  const body = req.body || {};
  // Honeypot: only bots fill it. They're told it worked.
  if (body.botcheck) return res.status(201).json({ ok: true });
  if (!databaseConfigured) {
    return res.status(503).json({ error: "Signups aren't available right now. Please try again later." });
  }

  const name = text(body.name);
  const email = text(body.email);
  const role = text(body.role);
  let page = text(body.page);
  if (!name) throw badRequest("Your name is required");
  if (name.length > 100) throw badRequest("Your name is too long");
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw badRequest("Enter a valid email");
  if (!/^\/[^/]/.test(page) || page.length > 200) page = "";

  const platform = await findPublishedPlatform(text(body.platform));
  if (!platform) return res.status(404).json({ error: "That platform wasn't found" });
  // A role, if given, must be one of the platform's audiences.
  const roles = (platform.audiences ?? []).map((a) => a.role).filter(Boolean);
  if (role && !roles.includes(role)) throw badRequest(`Choose one of: ${roles.join(", ")}`);

  await addSignup({ projectId: platform.id, name, email, role, page });
  res.status(201).json({ ok: true });
});

export default router;
