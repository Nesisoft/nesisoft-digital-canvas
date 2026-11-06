import nodemailer from "nodemailer";

/**
 * Outgoing email through the company mailbox's SMTP server (Hostinger:
 * smtp.hostinger.com, port 465 with TLS). Used to tell the company inbox
 * about new contact-form submissions and to send replies from /admin.
 *
 *   SMTP_USER / SMTP_PASSWORD  the mailbox's address and password (required)
 *   SMTP_HOST / SMTP_PORT      default smtp.hostinger.com / 465
 *   MAIL_FROM                  default "Nesisoft <SMTP_USER>"
 *   INQUIRY_NOTIFY_EMAIL       where new submissions go (default SMTP_USER)
 */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
// Port 465 is TLS from the first byte; others (587, 2525) upgrade with STARTTLS.
const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;

export const mailConfigured = Boolean(SMTP_USER && SMTP_PASSWORD);
export const MAIL_FROM = process.env.MAIL_FROM || (SMTP_USER ? `"Nesisoft" <${SMTP_USER}>` : "");
export const INQUIRY_NOTIFY_EMAIL = process.env.INQUIRY_NOTIFY_EMAIL || SMTP_USER;

/** The public site's address, for links in emails (e.g. to /admin). */
export const SITE_URL = (process.env.SITE_URL || "https://www.nesisoft.com").replace(/\/+$/, "");

if (!mailConfigured) {
  console.warn(
    "[mail] SMTP_USER / SMTP_PASSWORD aren't set: contact-form submissions are saved but " +
      "nobody is emailed, and replies from /admin are disabled."
  );
}

let transport;
function getTransport() {
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    // Give up rather than hold a serverless function open.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

function mailError(message, status, publicMessage) {
  const err = new Error(message);
  err.status = status;
  err.publicMessage = publicMessage;
  return err;
}

/**
 * Sends one message from MAIL_FROM. Returns nodemailer's info (messageId…).
 * The SMTP password never appears in errors: nodemailer doesn't echo it.
 */
export async function sendMail(message) {
  if (!mailConfigured) {
    throw mailError(
      "Email isn't configured (set SMTP_USER and SMTP_PASSWORD)",
      503,
      "Email isn't set up yet: add the SMTP settings to the server's environment."
    );
  }
  try {
    return await getTransport().sendMail({ from: MAIL_FROM, ...message });
  } catch (err) {
    throw mailError(
      `Sending email failed: ${err.message}`,
      502,
      "The mail server didn't accept the message. Please try again in a moment."
    );
  }
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Text safe to put inside HTML. */
export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Plain text as HTML paragraphs, keeping line breaks. */
export function textToHtml(text) {
  return String(text ?? "")
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 12px">${escapeHtml(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
