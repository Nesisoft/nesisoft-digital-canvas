/**
 * The raster formats admins may upload, recognised by their magic bytes —
 * never the client-supplied mimetype or filename, which are trivially
 * spoofed. SVG is deliberately absent: it's XML that can carry script.
 */
export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

const ascii = (buffer, start, end) => buffer.toString("latin1", start, end);

// AVIF is an ISO-BMFF file whose leading `ftyp` box names "avif" (still) or
// "avis" (sequence) as its major brand or one of its compatible brands.
function isAvif(buffer) {
  if (buffer.length < 16 || ascii(buffer, 4, 8) !== "ftyp") return false;
  const boxEnd = Math.min(buffer.readUInt32BE(0), buffer.length);
  for (let i = 8; i + 4 <= boxEnd; i += 4) {
    if (i === 12) continue; // minor version, not a brand
    if (["avif", "avis"].includes(ascii(buffer, i, i + 4))) return true;
  }
  return false;
}

/** Returns the image's real mimetype, or null if it isn't an allowed format. */
export function detectImageType(buffer) {
  if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return "image/png";
  if (buffer.subarray(0, 3).equals(JPEG_SIGNATURE)) return "image/jpeg";
  if (["GIF87a", "GIF89a"].includes(ascii(buffer, 0, 6))) return "image/gif";
  if (ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (isAvif(buffer)) return "image/avif";
  return null;
}
