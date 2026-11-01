import crypto from "node:crypto";
import { parsePasswordHash, verifyPassword } from "./password.js";

/**
 * Admin auth — a single admin account configured via env (ADMIN_USERNAME plus
 * ADMIN_PASSWORD_HASH or a raw ADMIN_PASSWORD), with sessions signed by
 * SESSION_SECRET. Production fails closed: admin login stays disabled until
 * all three are set to real values. Local dev falls back to admin / changeme
 * so `npm run dev` needs no config.
 * TODO: move to a real user store if we ever need more than one admin.
 */

// Shared with app.js (secure cookies, static serving).
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

// A hash (from `npm run hash-password`) takes precedence over a raw password.
// A malformed one counts as a config problem, so production disables login
// rather than falling back to ADMIN_PASSWORD.
const hashSet = !!process.env.ADMIN_PASSWORD_HASH;
const PASSWORD_HASH = hashSet
  ? parsePasswordHash(process.env.ADMIN_PASSWORD_HASH)
  : null;
const passwordProblem = hashSet
  ? !PASSWORD_HASH &&
    "ADMIN_PASSWORD_HASH is malformed (regenerate it with npm run hash-password)"
  : configProblem("ADMIN_PASSWORD", PLACEHOLDER_PASSWORDS);

if (PASSWORD_HASH && process.env.ADMIN_PASSWORD) {
  console.warn(
    "[auth] Both ADMIN_PASSWORD_HASH and ADMIN_PASSWORD are set; using ADMIN_PASSWORD_HASH. Remove ADMIN_PASSWORD.",
  );
}

const secretProblem = configProblem("SESSION_SECRET", PLACEHOLDER_SECRETS);
const configProblems = [
  configProblem("ADMIN_USERNAME"),
  passwordProblem,
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

// The fallbacks only ever apply in dev: production with login enabled has a
// username and a valid hash or password set.
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

// Async because scrypt runs on libuv's thread pool, off the event loop.
export async function checkCredentials(username, password) {
  if (!adminLoginEnabled) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  // Check both every time so a wrong username isn't rejected any faster.
  const usernameOk = safeEqual(username, ADMIN_USERNAME);
  const passwordOk = PASSWORD_HASH
    ? await verifyPassword(password, PASSWORD_HASH)
    : safeEqual(password, ADMIN_PASSWORD);
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
