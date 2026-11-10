import { INQUIRY_NOTIFY_EMAIL, SITE_URL, escapeHtml, textToHtml } from "./mailer.js";
import { formatBytes } from "./inquiryMail.js";
import { describeChannel } from "./attribution.js";

/**
 * The alert to the company inbox about a new Trainingship application, with
 * the CV attached. Replying to it from the mailbox goes straight to the
 * applicant (Reply-To). The applicant's own confirmation is in visitorEmail.js.
 */

const FONT = "font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#18181b";

export function applicationNotificationEmail(application, cv) {
  const name = `${application.first_name} ${application.last_name}`.trim();
  const adminLink = `${SITE_URL}/admin?application=${application.id}`;
  const details = [
    ["Name", name],
    ["Email", application.email],
    ["Phone / WhatsApp", application.phone],
    ["Track", application.track],
    ["Currently", application.current_status],
    ["School or organisation", application.school],
    ["Links", application.links.split("\n").filter(Boolean).join("  ")],
    ["Availability", application.availability],
    ["Intake", application.intake],
    ["Found the site via", describeChannel(application.channel, application.channel_source)],
    ["First page they saw", application.landing_page ? `${SITE_URL}${application.landing_page}` : ""],
    ["CV", cv ? `${cv.name} (${formatBytes(cv.size)})` : ""],
  ].filter(([, value]) => value);

  const text = [
    "New Trainingship application from the website:",
    "",
    ...details.map(([label, value]) => `${label}: ${value}`),
    "",
    "Why they want to join:",
    application.motivation,
    "",
    `Open it in the admin: ${adminLink}`,
    `Reply to this email to answer ${application.first_name} directly.`,
  ].join("\n");

  const rows = details
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#71717a;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  const html = `<div style="${FONT}">
<p style="margin:0 0 16px">New Trainingship application from the website:</p>
<table style="border-collapse:collapse;margin:0 0 20px">${rows}</table>
<p style="margin:0 0 6px;color:#71717a">Why they want to join:</p>
<div style="border-left:3px solid #7c3aed;padding:4px 0 4px 14px;margin:0 0 24px">${textToHtml(application.motivation)}</div>
<p style="margin:0 0 8px"><a href="${escapeHtml(adminLink)}" style="background:#7c3aed;color:#ffffff;padding:10px 16px;text-decoration:none;display:inline-block">Open in the admin</a></p>
<p style="margin:16px 0 0;color:#71717a;font-size:13px">Reply to this email to answer ${escapeHtml(application.first_name)} directly.</p>
</div>`;

  return {
    to: INQUIRY_NOTIFY_EMAIL,
    replyTo: { name, address: application.email },
    subject: `New Trainingship application from ${name}: ${application.track}`,
    text,
    html,
    attachments: cv ? [{ filename: cv.name, content: cv.buffer, contentType: cv.type }] : [],
  };
}
