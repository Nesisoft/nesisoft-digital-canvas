import crypto from "node:crypto";
import { databaseConfigured, isId } from "./db.js";
import { hashPassword, parsePasswordHash, verifyPassword } from "./password.js";
import {
  bootstrapSuperadmin,
  findUserByEmail,
  findUserById,
  hasActiveSuperadmin,
} from "./models/users.js";

/**
 * Admin auth. Accounts live in the users table (migration 002): an email, a
 * scrypt password hash and a role (superadmin, admin or editor). A session
 * remembers its account and that account's session_version, both re-checked
 * on every request, so disabling an account or resetting its password signs
 * it out at once and a role change applies to the next request.
 *
 * ADMIN_USERNAME plus ADMIN_PASSWORD_HASH (or a raw ADMIN_PASSWORD) only
 * count while there's no active super admin: signing in with them then
 * creates that super admin (or restores it) and asks for a new password.
 * That's how the first account is made, and how a site that has lost its
 * last super admin gets one back. Local dev falls back to admin / changeme.
 *
 * Production fails closed: sign-in stays disabled until SESSION_SECRET is a
 * real value.
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

const secretProblem = configProblem("SESSION_SECRET", PLACEHOLDER_SECRETS);

export const adminLoginEnabled = !isProd || !secretProblem;

if (secretProblem) {
  console.warn(
    isProd
      ? `[auth] Admin login disabled: ${secretProblem}.`
      : `[auth] Using an insecure dev session secret (${secretProblem}); production refuses it.`,
  );
}

// In production a missing or placeholder secret becomes a random per-process
// one, so session cookies can never be signed with a publicly known string.
export const SESSION_SECRET =
  isProd && secretProblem
    ? crypto.randomBytes(32).toString("hex")
    : process.env.SESSION_SECRET || "dev-insecure-session-secret";

// --- The env credentials that can create the first super admin ---

// A hash (from `npm run hash-password`) takes precedence over a raw password.
const hashSet = !!process.env.ADMIN_PASSWORD_HASH;
const ENV_PASSWORD_HASH = hashSet ? parsePasswordHash(process.env.ADMIN_PASSWORD_HASH) : null;
const envProblems = [
  configProblem("ADMIN_USERNAME"),
  hashSet
    ? !ENV_PASSWORD_HASH &&
      "ADMIN_PASSWORD_HASH is malformed (regenerate it with npm run hash-password)"
    : configProblem("ADMIN_PASSWORD", PLACEHOLDER_PASSWORDS),
].filter(Boolean);
// Dev falls back to admin / changeme; production needs real values.
const envBootstrapEnabled = !isProd || envProblems.length === 0;
const ENV_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ENV_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";

// Hashing first gives timingSafeEqual equal-length buffers, so the comparison
// time doesn't reveal the expected value's length or how much of it matched.
function safeEqual(input, expected) {
  const digest = (value) => crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(digest(input), digest(expected));
}

async function envCredentialsMatch(email, password) {
  if (!envBootstrapEnabled) return false;
  const emailOk = safeEqual(email.toLowerCase(), ENV_USERNAME.trim().toLowerCase());
  const passwordOk = ENV_PASSWORD_HASH
    ? await verifyPassword(password, ENV_PASSWORD_HASH)
    : safeEqual(password, ENV_PASSWORD);
  return emailOk && passwordOk;
}

// --- Passwords ---

export const MIN_PASSWORD_LENGTH = 10;
// Generous for any passphrase; keeps scrypt's input (and request bodies) sane.
const MAX_PASSWORD_LENGTH = 200;

/** Why a new password isn't acceptable, or null when it's fine. */
export function passwordProblem(password, email) {
  if (typeof password !== "string") return "Password must be text";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Use at most ${MAX_PASSWORD_LENGTH} characters`;
  }
  if (email && password.trim().toLowerCase() === String(email).trim().toLowerCase()) {
    return "The password can't be the email address";
  }
  return null;
}

/** Checks a password against an account's stored hash. */
export async function passwordMatches(user, password) {
  const stored = parsePasswordHash(user.password_hash);
  return !!stored && typeof password === "string" && (await verifyPassword(password, stored));
}

// Checked against when there's no such account, so a wrong email takes as
// long to refuse as a wrong password. It's the hash of a random string.
const DUMMY_HASH = parsePasswordHash(
  "scrypt$131072$8$1$NbddVend/A3VCteWgiItXA==$NU1Sp5j2G4tAIpZqSxyh97qj50VpoZ+aOh/nErdBeKw=",
);

/**
 * The active account these credentials sign in to, or null. With no active
 * super admin in the database, the env credentials create one.
 */
export async function authenticate(email, password) {
  if (!adminLoginEnabled) return null;
  if (typeof email !== "string" || typeof password !== "string") return null;
  email = email.trim();
  if (!email || !password || password.length > MAX_PASSWORD_LENGTH) return null;

  const user = await findUserByEmail(email);
  const stored = user && parsePasswordHash(user.password_hash);
  const ok = await verifyPassword(password, stored || DUMMY_HASH);
  if (user && stored && ok && user.active) return user;

  if (!(await hasActiveSuperadmin()) && (await envCredentialsMatch(email, password))) {
    const created = await bootstrapSuperadmin(email, await hashPassword(password));
    if (created) {
      console.warn(`[auth] No active super admin: made ${created.email} one from ADMIN_USERNAME.`);
    }
    return created;
  }
  return null;
}

/** The signed-in account behind this request, or null. */
export async function currentAdmin(req) {
  if (!adminLoginEnabled || !databaseConfigured) return null;
  const { userId, sessionVersion } = req.session ?? {};
  if (!isId(userId)) return null;
  const user = await findUserById(userId);
  if (!user || !user.active || user.session_version !== sessionVersion) return null;
  return user;
}

/** Starts a fresh session (new id, so no fixation) for this account. */
export async function signIn(req, user) {
  await new Promise((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve())),
  );
  req.session.userId = user.id;
  req.session.sessionVersion = user.session_version;
  // "ok" only once the session is really stored.
  await new Promise((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve())),
  );
}

// --- Route guards ---

/** 401 without a signed-in account; otherwise sets req.admin. */
export function requireAdmin(req, res, next) {
  currentAdmin(req).then((user) => {
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    req.admin = user;
    next();
  }, next);
}

/** Until a temporary password is replaced, only the password change is open. */
export function requirePasswordChosen(req, res, next) {
  if (!req.admin.must_change_password) return next();
  return res
    .status(403)
    .json({ error: "Choose a new password first", mustChangePassword: true });
}

/** Lets only these roles through. */
export const allow =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.admin?.role)
      ? next()
      : res.status(403).json({ error: "Your role doesn't allow that" });
