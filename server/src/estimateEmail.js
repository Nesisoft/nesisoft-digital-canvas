import { INQUIRY_NOTIFY_EMAIL, SITE_URL, escapeHtml } from "./mailer.js";
import { estimatePath, formatRange, formatWeeks } from "../../shared/estimator.js";

/**
 * The email a visitor gets after asking for a quote from the cost
 * calculator: a copy of their estimate, what happens next, and how to reach
 * us. Often the first thing they receive from Nesisoft, so it's a designed
 * HTML email (table layout and inline styles, which every mail app renders)
 * with a plain-text version.
 *
 * It goes to an address typed into a public form, so it only echoes what
 * came from our own price list, plus a first name that looks like a name:
 * never their notes, company or anything else they typed.
 */

// Kept in step with src/config/site.ts.
const COMPANY = {
  phone: { display: "+233 553 140 807", href: "tel:+233553140807" },
  location: "Accra, Ghana",
};

const C = {
  page: "#f2f2f5",
  card: "#ffffff",
  dark: "#0f0f12",
  ink: "#18181b",
  body: "#3f3f46",
  muted: "#71717a",
  line: "#e6e6ec",
  soft: "#f7f6fb",
  violet: "#6d28d9",
  gold: "#e3b55b",
  onDark: "#f4f4f5",
  onDarkMuted: "#a1a1aa",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const STEPS = [
  ["We read your request", "A member of our team looks over your answers and any notes you sent."],
  ["We reply within one business day", "With a detailed quote, or a few questions if we need more detail."],
  ["We plan it together", "Once the scope is agreed, we set milestones and get building."],
];

const DISCLAIMER =
  "This is an indicative range, not a quote. Running costs such as hosting, app store accounts, SMS and payment fees are paid to those providers and aren't included.";
const SPEC_FIRST =
  "AI-native builds work from a specification agreed before work starts, so changes after sign-off are quoted separately.";

/** A first name to greet them by, if it looks like one (it's typed into a public form). */
export function greetingName(firstName) {
  const name = String(firstName ?? "").trim();
  return /^\p{L}[\p{L}\p{M}'’. -]{0,29}$/u.test(name) ? name : "";
}

/** The estimate in the currency they chose, and in the other one. */
function ranges(estimate) {
  const other = estimate.currency === "USD" ? "GHS" : "USD";
  return { main: formatRange(estimate, estimate.currency), other: formatRange(estimate, other) };
}

/** The subject line, also used to thread replies sent from /admin. */
export function estimateCopySubject(estimate) {
  return `Your estimate from Nesisoft: ${estimate.type.label}, ${ranges(estimate).main}`;
}

/** The link back to the calculator with their answers filled in. */
function estimateUrl(estimate) {
  return `${SITE_URL}${estimatePath(
    {
      type: estimate.type.id,
      size: estimate.size.id,
      design: estimate.design.id,
      approach: estimate.approach?.id ?? "",
      pace: estimate.pace.id,
      features: estimate.features.map((f) => f.id),
    },
    estimate.currency
  )}`;
}

function answerRows(estimate) {
  return [
    ["Project", [estimate.type.label]],
    ["Size", [estimate.size.label]],
    ["Features", estimate.features.length ? estimate.features.map((f) => f.label) : ["None added"]],
    ["Design", [estimate.design.label]],
    ...(estimate.approach ? [["Approach", [estimate.approach.label]]] : []),
    ["Pace", [estimate.pace.label]],
  ];
}

function textVersion({ name, estimate, url }) {
  const { main, other } = ranges(estimate);
  return [
    `Hi ${name || "there"},`,
    "",
    "Thanks for using our cost calculator. Here's a copy of your estimate. We'll reply within one business day with a detailed quote, or a few questions if we need more detail.",
    "",
    "YOUR ESTIMATE",
    `${main} (about ${other})`,
    `${formatWeeks(estimate)} to launch`,
    "",
    ...answerRows(estimate).map(([label, values]) => `${label}: ${values.join(", ")}`),
    ...(estimate.approach?.id === "ai-native" ? ["", SPEC_FIRST] : []),
    "",
    `View or adjust your estimate: ${url}`,
    "",
    "WHAT HAPPENS NEXT",
    ...STEPS.map(([title, detail], i) => `${i + 1}. ${title}. ${detail}`),
    "",
    DISCLAIMER,
    "",
    `Questions in the meantime? Reply to this email or call us on ${COMPANY.phone.display}.`,
    "",
    "The Nesisoft team",
    SITE_URL,
    "",
    "--",
    `Nesisoft, software and app development, ${COMPANY.location}.`,
    "You're getting this because someone asked for an estimate at nesisoft.com with this email address. If that wasn't you, please ignore it.",
  ].join("\n");
}

function htmlVersion({ name, estimate, url, preheader }) {
  const { main, other } = ranges(estimate);
  const site = SITE_URL.replace(/^https?:\/\//, "");
  const e = escapeHtml;

  const rows = answerRows(estimate)
    .map(
      ([label, values], i, all) => `
            <tr>
              <td valign="top" style="padding:12px 16px 12px 0;width:96px;font-size:13px;color:${C.muted};${i < all.length - 1 ? `border-bottom:1px solid ${C.line};` : ""}">${e(label)}</td>
              <td valign="top" style="padding:12px 0;font-size:15px;line-height:22px;color:${C.ink};${i < all.length - 1 ? `border-bottom:1px solid ${C.line};` : ""}">${
                values.length > 1
                  ? // A bullet cell beside each item, so wrapped lines hang clear of it.
                    `<table role="presentation" cellpadding="0" cellspacing="0" border="0">${values
                      .map(
                        (value) =>
                          `<tr><td valign="top" style="padding:8px 10px 0 0;width:6px"><div style="width:6px;height:6px;background:${C.violet};font-size:0;line-height:0">&nbsp;</div></td><td style="padding:1px 0;font-size:15px;line-height:22px;color:${C.ink}">${e(value)}</td></tr>`
                      )
                      .join("")}</table>`
                  : e(values[0])
              }</td>
            </tr>`
    )
    .join("");

  const steps = STEPS.map(
    ([title, detail], i) => `
            <tr>
              <td valign="top" style="padding:0 14px 18px 0;width:28px">
                <div style="width:28px;height:28px;line-height:28px;text-align:center;background:${C.soft};border:1px solid ${C.line};color:${C.violet};font-size:13px;font-weight:700">${i + 1}</div>
              </td>
              <td valign="top" style="padding:3px 0 18px">
                <div style="font-size:15px;font-weight:600;color:${C.ink}">${e(title)}</div>
                <div style="margin-top:3px;font-size:14px;line-height:21px;color:${C.body}">${e(detail)}</div>
              </td>
            </tr>`
  ).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${e(estimateCopySubject(estimate))}</title>
<style>
  @media (max-width: 620px) {
    .px { padding-left: 24px !important; padding-right: 24px !important; }
    .range { font-size: 30px !important; line-height: 36px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${e(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page}">
  <tr>
    <td align="center" style="padding:32px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:${FONT}">

        <!-- Brand and the estimate -->
        <tr>
          <td class="px" style="background:${C.dark};padding:28px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="width:40px"><img src="${e(SITE_URL)}/brand/nesisoft-logo-512.png" width="36" height="36" alt="" style="display:block;border:0;width:36px;height:36px"></td>
                <td valign="middle" style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Nesisoft</td>
                <td valign="middle" align="right" style="font-size:12px;color:${C.onDarkMuted}">Cost estimate</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" style="background:${C.dark};padding:36px 40px 36px">
            <div style="font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.gold}">Your estimate</div>
            <div class="range" style="margin-top:10px;font-size:36px;line-height:42px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">${e(main)}</div>
            <div style="margin-top:8px;font-size:15px;line-height:22px;color:${C.onDarkMuted}"><span style="white-space:nowrap">About ${e(other)}</span> &nbsp;·&nbsp; <span style="white-space:nowrap">${e(formatWeeks(estimate))} to launch</span></div>
          </td>
        </tr>
        <tr><td style="background:${C.gold};height:3px;line-height:3px;font-size:0">&nbsp;</td></tr>

        <!-- The letter -->
        <tr>
          <td class="px" style="background:${C.card};padding:36px 40px 8px">
            <p style="margin:0 0 14px;font-size:17px;font-weight:600;color:${C.ink}">Hi ${e(name || "there")},</p>
            <p style="margin:0 0 28px;font-size:15px;line-height:24px;color:${C.body}">Thanks for using our cost calculator. Here's a copy of your estimate for your records. We'll reply within one business day with a detailed quote, or a few questions if we need more detail.</p>

            <div style="font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted}">What you asked for</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px">${rows}
            </table>
            ${
              estimate.approach?.id === "ai-native"
                ? `<p style="margin:14px 0 0;font-size:13px;line-height:20px;color:${C.muted}">${e(SPEC_FIRST)}</p>`
                : ""
            }

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 36px">
              <tr>
                <td style="background:${C.violet}">
                  <a href="${e(url)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">View or adjust your estimate &rarr;</a>
                </td>
              </tr>
            </table>

            <div style="font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};margin-bottom:16px">What happens next</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps}
            </table>

            <div style="margin:10px 0 28px;padding:14px 16px;background:${C.soft};border-left:3px solid ${C.gold};font-size:13px;line-height:20px;color:${C.body}">${e(DISCLAIMER)}</div>

            <p style="margin:0 0 6px;font-size:15px;line-height:24px;color:${C.body}">Questions in the meantime? Reply to this email or call us on <a href="${COMPANY.phone.href}" style="color:${C.violet};text-decoration:none;font-weight:600;white-space:nowrap">${e(COMPANY.phone.display)}</a>.</p>
            <p style="margin:20px 0 32px;font-size:15px;line-height:24px;color:${C.ink}">The Nesisoft team</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="px" style="padding:24px 40px 8px;font-size:12px;line-height:19px;color:${C.muted}">
            <a href="${e(SITE_URL)}" style="color:${C.ink};font-weight:600;text-decoration:none">Nesisoft</a> &nbsp;·&nbsp; Software and app development &nbsp;·&nbsp; ${e(COMPANY.location)}<br>
            <a href="${e(SITE_URL)}/services" style="color:${C.muted}">Services</a> &nbsp;·&nbsp;
            <a href="${e(SITE_URL)}/projects" style="color:${C.muted}">Our work</a> &nbsp;·&nbsp;
            <a href="${e(SITE_URL)}" style="color:${C.muted}">${e(site)}</a>
            <p style="margin:14px 0 0;color:#a1a1aa">You're getting this because someone asked for an estimate at nesisoft.com with this email address. If that wasn't you, please ignore it.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * The visitor's copy of a quote request: to their address, replies to the
 * company inbox, marked as automatic so out-of-office replies stay away.
 */
export function estimateCopyEmail(inquiry) {
  const { estimate } = inquiry;
  const name = greetingName(inquiry.first_name);
  const url = estimateUrl(estimate);
  const preheader = `${ranges(estimate).main} over ${formatWeeks(estimate)}. We'll reply within one business day with a detailed quote.`;
  return {
    to: name ? { name, address: inquiry.email } : inquiry.email,
    replyTo: INQUIRY_NOTIFY_EMAIL,
    subject: estimateCopySubject(estimate),
    text: textVersion({ name, estimate, url }),
    html: htmlVersion({ name, estimate, url, preheader }),
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "OOF, AutoReply",
    },
  };
}
