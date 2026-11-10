import crypto from "node:crypto";
import { IMAGE_TYPES } from "./imageTypes.js";
import { DOCUMENT_TYPES, MAX_DOCUMENT_BYTES } from "./documentTypes.js";

/**
 * Images uploaded in /admin live in a public Supabase Storage bucket and are
 * served from Supabase's CDN. Documents attached to the contact form (project
 * briefs) live in a separate private bucket that only the API can read. This
 * talks to the Storage REST API directly (no SDK) with the service-role key,
 * which must only ever be set on the server, never in a VITE_ variable.
 */

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "site-images";
export const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET || "inquiry-files";
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

// --- Documents attached to the contact form (private) ---

const documentsUnavailable = () =>
  storageError(
    "Document storage is not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)",
    503,
    "File storage isn't configured."
  );

const documentUrl = (objectPath) =>
  `${SUPABASE_URL}/storage/v1/object/${DOCUMENTS_BUCKET}/${objectPath}`;

/** Stores one attached document (already checked by its bytes); returns its object path. */
/** Stores a private document under `folder/` (inquiries, applications); returns its path. */
export async function uploadDocument(buffer, contentType, extension, folder = "inquiries") {
  if (!storageConfigured) throw documentsUnavailable();
  const objectPath = `${folder}/${crypto.randomUUID()}.${extension}`;
  const res = await storageFetch(documentUrl(objectPath), {
    method: "POST",
    headers: headers({ "Content-Type": contentType, "x-upsert": "false" }),
    body: buffer,
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw storageError(`Document upload failed (${res.status}): ${detail}`, 502, "File storage rejected the upload.");
  }
  return objectPath;
}

/** Reads a stored document back (the bucket is private, so only with the service key). */
export async function downloadDocument(objectPath) {
  if (!storageConfigured) throw documentsUnavailable();
  const res = await storageFetch(documentUrl(objectPath), { headers: headers() });
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) {
    throw storageError(`Document download failed (${res.status})`, 502, "File storage didn't return the file.");
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Removes a stored document; a missing one counts as removed. */
export async function deleteDocument(objectPath) {
  if (!storageConfigured) return;
  const res = await storageFetch(documentUrl(objectPath), { method: "DELETE", headers: headers() });
  if (!res.ok && res.status !== 400 && res.status !== 404) {
    throw storageError(`Document delete failed (${res.status})`, 502, "File storage didn't delete the file.");
  }
}

// --- Buckets ---

const IMAGES_BUCKET_SETTINGS = {
  public: true,
  file_size_limit: MAX_IMAGE_BYTES,
  allowed_mime_types: IMAGE_TYPES,
};

const DOCUMENTS_BUCKET_SETTINGS = {
  public: false,
  file_size_limit: MAX_DOCUMENT_BYTES,
  allowed_mime_types: Object.values(DOCUMENT_TYPES).map((type) => type.mime),
};

/**
 * Makes sure a bucket exists with the right visibility: creates it, or
 * corrects an existing one (a private image bucket would serve URLs nobody
 * can load; a public documents bucket would expose people's briefs).
 */
async function ensureBucketWith(name, settings) {
  const kind = settings.public ? "public" : "private";
  const bucketUrl = `${SUPABASE_URL}/storage/v1/bucket/${name}`;
  const json = { "Content-Type": "application/json" };

  const existing = await storageFetch(bucketUrl, { headers: headers() });
  if (existing.ok) {
    const bucket = await existing.json().catch(() => ({}));
    if (Boolean(bucket.public) === settings.public) return `bucket "${name}" already exists`;
    const res = await storageFetch(bucketUrl, {
      method: "PUT",
      headers: headers(json),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      throw new Error(`Making bucket "${name}" ${kind} failed (${res.status}): ${detail}`);
    }
    return `bucket "${name}" wasn't ${kind}; made it ${kind}`;
  }

  const res = await storageFetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: headers(json),
    body: JSON.stringify({ id: name, name, ...settings }),
  });
  if (!res.ok) {
    // Another run may have created it meanwhile. Depending on version,
    // Storage answers that with a 409 or a 400 whose body says "Duplicate".
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    if (res.status === 409 || /duplicate|already exists/i.test(detail)) {
      return `bucket "${name}" already exists`;
    }
    throw new Error(`Creating bucket "${name}" failed (${res.status}): ${detail}`);
  }
  return `created ${kind} bucket "${name}"`;
}

/**
 * Makes sure both buckets exist: the public one for images and the private
 * one for contact-form documents. Run by `npm run db:migrate`, `npm run seed`
 * and production deploys (deploy.js, where a failure is only a warning);
 * returns what it did, for the log.
 */
export async function ensureBucket() {
  if (!storageConfigured) return "skipped (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set)";
  const images = await ensureBucketWith(STORAGE_BUCKET, IMAGES_BUCKET_SETTINGS);
  const documents = await ensureBucketWith(DOCUMENTS_BUCKET, DOCUMENTS_BUCKET_SETTINGS);
  return `${images}; ${documents}`;
}
