/**
 * Admin auth — intentionally simple for now. Credentials are hardcoded here
 * as fallbacks and overridable via env (ADMIN_USERNAME / ADMIN_PASSWORD).
 * TODO: move entirely to env vars / a real user store before production.
 */

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";

export function checkCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

/** Guards admin API routes — returns 401 JSON when there's no session. */
export function requireAuthApi(req, res, next) {
  if (req.session?.authed) return next();
  return res.status(401).json({ error: "Not authenticated" });
}
