import { INQUIRY_NOTIFY_EMAIL, SITE_URL, escapeHtml, textToHtml } from "./mailer.js";
import { formatRange, formatWeeks } from "../../shared/estimator.js";
import { describeChannel } from "./attribution.js";

/** The two emails about an inquiry: the alert to the company and a reply to its sender. */

const fullName = (inquiry) => `${inquiry.first_name} ${inquiry.last_name}`.trim();

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const formatDate = (date) =>
  new Date(date).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Accra",
  });

const FONT = "font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#18181b";

/**
 * The alert to the company inbox about a new inquiry, with the attachment.
 * Replying to it from the mailbox goes straight to the sender (Reply-To).
 */
/** A quote request's answers and estimate, as [label, value] rows. */
function estimateDetails(estimate) {
  const other = estimate.currency === "USD" ? "GHS" : "USD";
  return [
    ["Project", estimate.type.label],
    ["Size", estimate.size.label],
    ["Features", estimate.features.map((f) => f.label).join(", ") || "None added"],
    ["Design", estimate.design.label],
    // Quote requests from before the approach question have none.
    ["Approach", estimate.approach?.label],
    ["Pace", estimate.pace.label],
    ["Estimate", `${formatRange(estimate, estimate.currency)} (${formatRange(estimate, other)})`],
    ["Timeline", formatWeeks(estimate)],
  ];
}

export function notificationEmail(inquiry, attachment) {
  const name = fullName(inquiry);
  const { estimate } = inquiry;
  const topic = !inquiry.service || inquiry.service === "Not sure yet" ? "General" : inquiry.service;
  const company = inquiry.company ? ` (${inquiry.company})` : "";
  const subject = estimate
    ? // In cedis, the currency of the price list, whatever the visitor viewed.
      `New quote request from ${name}${company}: ${estimate.type.label}, ${formatRange(estimate, "GHS")}`
    : `New ${topic} enquiry from ${name}${company}`;
  const adminLink = `${SITE_URL}/admin?inquiry=${inquiry.id}`;
  const details = [
    ["Name", name],
    ["Email", inquiry.email],
    ["Phone / WhatsApp", inquiry.phone],
    ["Company", inquiry.company],
    ...(estimate
      ? estimateDetails(estimate)
      : [
          ["Service", inquiry.service],
          ["Budget", inquiry.budget],
          ["Timeline", inquiry.timeline],
        ]),
    ["Heard about us via", inquiry.source],
    ["Found the site via", describeChannel(inquiry.channel, inquiry.channel_source)],
    ["First page they saw", inquiry.landing_page ? `${SITE_URL}${inquiry.landing_page}` : ""],
    ["Campaign", [inquiry.utm_source, inquiry.utm_medium, inquiry.utm_campaign].filter(Boolean).join(" / ")],
    ["Sent from", inquiry.page ? `${SITE_URL}${inquiry.page}` : ""],
    ["Attachment", attachment ? `${attachment.name} (${formatBytes(attachment.size)})` : ""],
  ].filter(([, value]) => value);
  const intro = estimate
    ? "New quote request from the cost calculator:"
    : "New enquiry from the website:";

  const text = [
    intro,
    "",
    ...details.map(([label, value]) => `${label}: ${value}`),
    "",
    inquiry.message,
    "",
    `Open it in the admin: ${adminLink}`,
    `Reply to this email to answer ${inquiry.first_name} directly.`,
  ].join("\n");

  const rows = details
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#71717a;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  const html = `<div style="${FONT}">
<p style="margin:0 0 16px">${escapeHtml(intro)}</p>
<table style="border-collapse:collapse;margin:0 0 20px">${rows}</table>
<div style="border-left:3px solid #7c3aed;padding:4px 0 4px 14px;margin:0 0 24px">${textToHtml(inquiry.message)}</div>
<p style="margin:0 0 8px"><a href="${escapeHtml(adminLink)}" style="background:#7c3aed;color:#ffffff;padding:10px 16px;text-decoration:none;display:inline-block">Open in the admin</a></p>
<p style="margin:16px 0 0;color:#71717a;font-size:13px">Reply to this email to answer ${escapeHtml(inquiry.first_name)} directly.</p>
</div>`;

  return {
    to: INQUIRY_NOTIFY_EMAIL,
    replyTo: { name, address: inquiry.email },
    subject,
    text,
    html,
    attachments: attachment
      ? [{ filename: attachment.name, content: attachment.buffer, contentType: attachment.type }]
      : [],
  };
}

/**
 * A reply to the inquiry's sender, signed by the admin, with their original
 * message quoted underneath. Their answer comes back to the company inbox
 * (Reply-To), and earlier replies' Message-IDs keep it in one thread.
 */
export function replyEmail({ inquiry, subject, body, signedBy, previousMessageIds = [] }) {
  const name = fullName(inquiry);
  const signature = [signedBy, "Nesisoft", SITE_URL.replace(/^https?:\/\//, "")]
    .filter(Boolean)
    .join("\n");
  const intro = `On ${formatDate(inquiry.created_at)}, ${name} wrote:`;
  const quoted = inquiry.message
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  const text = `${body.trim()}\n\n${signature}\n\n${intro}\n${quoted}\n`;
  const html = `<div style="${FONT}">
${textToHtml(body.trim())}
<p style="margin:16px 0 0">${escapeHtml(signature).replace(/\n/g, "<br>")}</p>
<p style="margin:24px 0 8px;color:#71717a;font-size:13px">${escapeHtml(intro)}</p>
<blockquote style="margin:0;border-left:3px solid #d4d4d8;padding:0 0 0 12px;color:#52525b">${textToHtml(inquiry.message)}</blockquote>
</div>`;

  const threading = previousMessageIds.length
    ? { inReplyTo: previousMessageIds.at(-1), references: previousMessageIds }
    : {};
  return {
    to: { name, address: inquiry.email },
    replyTo: INQUIRY_NOTIFY_EMAIL,
    subject,
    text,
    html,
    ...threading,
  };
}
