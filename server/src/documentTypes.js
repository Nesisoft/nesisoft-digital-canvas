/**
 * Documents the contact form accepts: PDF and Word (.docx), told apart by
 * their bytes, not by the name or type the browser claims.
 */

export const DOCUMENT_TYPES = {
  pdf: { mime: "application/pdf", label: "PDF" },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word document",
  },
};

/**
 * Largest attachment. Vercel caps a function's request body at 4.5 MB, so
 * this leaves room for the form's other fields and multipart overhead.
 */
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

const ZIP_LOCAL_HEADER = 0x04034b50;
const has = (buffer, text) => buffer.includes(Buffer.from(text, "latin1"));

/**
 * "pdf" or "docx" when the bytes are one, else null. A .docx is a ZIP whose
 * entries include [Content_Types].xml and word/document.xml (entry names are
 * stored uncompressed). Macro-enabled Word files (.docm, which carry
 * word/vbaProject.bin) are refused even when renamed.
 */
export function detectDocumentType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) return null;
  if (buffer.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  if (
    buffer.readUInt32LE(0) === ZIP_LOCAL_HEADER &&
    has(buffer, "[Content_Types].xml") &&
    has(buffer, "word/document.xml") &&
    !has(buffer, "vbaProject.bin")
  ) {
    return "docx";
  }
  return null;
}

/**
 * The visitor's file name, made safe to store, show and use in a
 * Content-Disposition header: no folders or control characters, a sane
 * length, and the extension that matches what the file really is.
 */
export function cleanFileName(original, type) {
  const base = String(original || "")
    .split(/[\\/]/)
    .pop()
    .replace(/[\u0000-\u001f\u007f"<>|:*?]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.(pdf|docx?)$/i, "")
    .slice(0, 120)
    .trim();
  return `${base || "attachment"}.${type}`;
}
