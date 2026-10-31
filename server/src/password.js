import crypto from "node:crypto";
import { promisify } from "node:util";

/**
 * scrypt password hashes for ADMIN_PASSWORD_HASH, using only Node's built-in
 * crypto. The format is self-describing — `scrypt$N$r$p$<salt>$<hash>`, salt
 * and hash in base64 — so the cost can be raised later without breaking
 * hashes already in use. Generate one with `npm run hash-password`.
 */

const scrypt = promisify(crypto.scrypt);

// OWASP's recommended scrypt cost: 128 MiB and roughly half a second per hash.
const DEFAULT_COST = { N: 2 ** 17, r: 8, p: 1 };
const SALT_BYTES = 16;
const KEY_BYTES = 32;

// Bounds a stored hash must fall within. Anything weaker, or hungrier than
// 256 MiB (scrypt needs about 128·N·r bytes), is treated as malformed so a
// typo can't quietly weaken the hash or exhaust the server's memory.
const MIN_N = 2 ** 14;
const MAX_MEMORY = 256 * 1024 * 1024;

// OpenSSL refuses to run past maxmem (32 MiB by default), so allow double
// what the parameters need.
const scryptOptions = ({ N, r, p }) => ({ N, r, p, maxmem: 2 * 128 * N * r });

const INTEGER = /^[1-9]\d{0,9}$/;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

// Strict base64 — Buffer.from silently skips invalid characters.
function decodeBase64(value) {
  if (!BASE64.test(value)) return null;
  const buffer = Buffer.from(value, "base64");
  return buffer.toString("base64") === value ? buffer : null;
}

/** Hashes a password with a fresh random salt at the default cost. */
export async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = await scrypt(password, salt, KEY_BYTES, scryptOptions(DEFAULT_COST));
  const { N, r, p } = DEFAULT_COST;
  return ["scrypt", N, r, p, salt.toString("base64"), hash.toString("base64")].join("$");
}

/** Parses a stored hash, or returns null when it's malformed or out of bounds. */
export function parsePasswordHash(value) {
  const parts = String(value).split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  if (!parts.slice(1, 4).every((part) => INTEGER.test(part))) return null;

  const [N, r, p] = parts.slice(1, 4).map(Number);
  const isPowerOfTwo = (N & (N - 1)) === 0;
  if (!isPowerOfTwo || N < MIN_N || r > 32 || p > 16) return null;
  // scrypt itself requires N < 2^(16·r).
  if (128 * N * r > MAX_MEMORY || N >= 2 ** (16 * r)) return null;

  const salt = decodeBase64(parts[4]);
  const hash = decodeBase64(parts[5]);
  if (!salt || salt.length < SALT_BYTES) return null;
  if (!hash || hash.length < KEY_BYTES || hash.length > 64) return null;

  return { N, r, p, salt, hash };
}

/** Re-derives with the stored parameters and compares in constant time. */
export async function verifyPassword(password, { N, r, p, salt, hash }) {
  const derived = await scrypt(password, salt, hash.length, scryptOptions({ N, r, p }));
  return crypto.timingSafeEqual(derived, hash);
}
