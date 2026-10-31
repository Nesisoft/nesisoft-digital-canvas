import crypto from "node:crypto";

/**
 * Admin auth — a single admin account configured via env (ADMIN_USERNAME /
 * ADMIN_PASSWORD), with sessions signed by SESSION_SECRET. Production fails
 * closed: admin login stays disabled until all three are set to real values.
 * Local dev falls back to admin / changeme so `npm run dev` needs no config.
 * TODO: move to a real user store if we ever need more than one admin.
 */

// Shared with app.js (secure cookies, Mongo session store, static serving).
export const isProd =
  process.env.NODE_ENV === "production" || !!process.env.VERCEL;

// Publicly known values (.env.example and the dev fallbacks) — never accepted
// in production.
const PLACEHOLDER_PASSWORDS = ["changeme"];
const PLACEHOLDER_SECRETS = [
  "replace-with-a-long-random-string",
  "dev-insecure-session-secret",
];

// Describes what's wrong with an env var by name only — never its value.
function configProblem(name, placeholders = []) {
  const value = process.env[name];
  if (!value) return `${name} is not set`;
  if (placeholders.includes(value)) return `${name} is a placeholder`;
  return null;
}

const secretProblem = configProblem("SESSION_SECRET", PLACEHOLDER_SECRETS);
const configProblems = [
  configProblem("ADMIN_USERNAME"),
  configProblem("ADMIN_PASSWORD", PLACEHOLDER_PASSWORDS),
  secretProblem,
].filter(Boolean);

export const adminLoginEnabled = !isProd || configProblems.length === 0;

if (configProblems.length > 0) {
  console.warn(
    isProd
      ? `[auth] Admin login disabled: ${configProblems.join(", ")}.`
      : `[auth] Using insecure dev defaults (${configProblems.join(", ")}); production refuses these.`,
  );
}

// The fallbacks only ever apply in dev: production with login enabled has
// both values set.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";

// In production a missing or placeholder secret becomes a random per-process
// one, so session cookies can never be signed with a publicly known string.
export const SESSION_SECRET =
  isProd && secretProblem
    ? crypto.randomBytes(32).toString("hex")
    : process.env.SESSION_SECRET || "dev-insecure-session-secret";

// Hashing first gives timingSafeEqual equal-length buffers, so the comparison
// time doesn't reveal the expected value's length or how much of it matched.
function safeEqual(input, expected) {
  const digest = (value) => crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(digest(input), digest(expected));
}

export function checkCredentials(username, password) {
  if (!adminLoginEnabled) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  // Check both every time so a wrong username isn't rejected any faster.
  const usernameOk = safeEqual(username, ADMIN_USERNAME);
  const passwordOk = safeEqual(password, ADMIN_PASSWORD);
  return usernameOk && passwordOk;
}

/** A session only counts while admin login is enabled. */
export function isAuthed(req) {
  return adminLoginEnabled && !!req.session?.authed;
}

/** Guards admin API routes — returns 401 JSON when there's no session. */
export function requireAuthApi(req, res, next) {
  if (isAuthed(req)) return next();
  return res.status(401).json({ error: "Not authenticated" });
}
