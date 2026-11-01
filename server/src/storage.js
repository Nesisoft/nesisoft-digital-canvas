import crypto from "node:crypto";
import { IMAGE_TYPES } from "./imageTypes.js";

/**
 * Images uploaded in /admin live in a public Supabase Storage bucket and are
 * served from Supabase's CDN. This talks to the Storage REST API directly
 * (no SDK) with the service-role key, which must only ever be set on the
 * server, never in a VITE_ variable.
 */

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "site-images";
export const storageConfigured = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

/**
 * Largest upload the API accepts. Vercel caps a function's request body at
 * 4.5 MB, so this stays under it (multipart overhead included).
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

function headers(extra = {}) {
  return { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, apikey: SERVICE_ROLE_KEY, ...extra };
}

// Storage calls give up after this long rather than holding the request
// (and the serverless function) open.
const TIMEOUT_MS = 15_000;

/**
 * `message` is logged; `publicMessage` is safe to show the admin even in
 * production, where other 5xx details are hidden.
 */
function storageError(message, status, publicMessage) {
  const err = new Error(message);
  err.status = status;
  err.publicMessage = publicMessage;
  return err;
}

/** fetch with a timeout; network failures become a 502/504 storage error. */
async function storageFetch(url, options = {}) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    const timedOut = err.name === "TimeoutError";
    throw storageError(
      `Supabase Storage ${timedOut ? "timed out" : `unreachable: ${err.message}`}`,
      timedOut ? 504 : 502,
      "Image storage didn't respond. Please try again."
    );
  }
}

/**
 * Stores one image (already verified by its bytes) and returns its public
 * URL. Names are random, so uploads never collide or overwrite each other.
 */
export async function uploadImage(buffer, contentType) {
  if (!storageConfigured) {
    throw storageError(
      "Image storage is not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)",
      503,
      "Image uploads aren't configured yet."
    );
  }
  const objectPath = `uploads/${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
  const res = await storageFetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: headers({
      "Content-Type": contentType,
      // A path is never reused, so browsers and the CDN can keep it a year.
      "Cache-Control": "max-age=31536000",
      "x-upsert": "false",
    }),
    body: buffer,
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw storageError(
      `Image upload failed (${res.status}): ${detail}`,
      502,
      "Image storage rejected the upload. Check the Supabase bucket and keys."
    );
  }
  return {
    path: objectPath,
    url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`,
  };
}

const BUCKET_SETTINGS = {
  public: true,
  file_size_limit: MAX_IMAGE_BYTES,
  allowed_mime_types: IMAGE_TYPES,
};

async function failIfNotOk(res, action) {
  if (res.ok) return;
  const detail = (await res.text().catch(() => "")).slice(0, 300);
  throw new Error(`${action} bucket "${STORAGE_BUCKET}" failed (${res.status}): ${detail}`);
}

/**
 * Makes sure the bucket exists and is public, limited to the image types and
 * size the API accepts: creates it, or fixes an existing one that isn't
 * public (uploads would otherwise get URLs nobody can load). Run by
 * `npm run db:migrate` and `npm run seed`; returns what it did, for the log.
 */
export async function ensureBucket() {
  if (!storageConfigured) return "skipped (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set)";
  const bucketUrl = `${SUPABASE_URL}/storage/v1/bucket/${STORAGE_BUCKET}`;
  const json = { "Content-Type": "application/json" };

  const existing = await storageFetch(bucketUrl, { headers: headers() });
  if (existing.ok) {
    const bucket = await existing.json().catch(() => ({}));
    if (bucket.public) return `bucket "${STORAGE_BUCKET}" already exists`;
    const res = await storageFetch(bucketUrl, {
      method: "PUT",
      headers: headers(json),
      body: JSON.stringify(BUCKET_SETTINGS),
    });
    await failIfNotOk(res, "Making public");
    return `bucket "${STORAGE_BUCKET}" existed but was private; made it public`;
  }

  const res = await storageFetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: headers(json),
    body: JSON.stringify({ id: STORAGE_BUCKET, name: STORAGE_BUCKET, ...BUCKET_SETTINGS }),
  });
  if (!res.ok) {
    // Another run may have created it meanwhile. Depending on version,
    // Storage answers that with a 409 or a 400 whose body says "Duplicate".
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    if (res.status === 409 || /duplicate|already exists/i.test(detail)) {
      return `bucket "${STORAGE_BUCKET}" already exists`;
    }
    throw new Error(`Creating bucket "${STORAGE_BUCKET}" failed (${res.status}): ${detail}`);
  }
  return `created public bucket "${STORAGE_BUCKET}"`;
}
