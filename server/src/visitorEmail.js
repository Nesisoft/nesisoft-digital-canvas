import { INQUIRY_NOTIFY_EMAIL, SITE_URL, escapeHtml } from "./mailer.js";
import { CALCULATOR_PATH, estimatePath, formatRange, formatWeeks } from "../../shared/estimator.js";

/**
 * The emails sent to someone who contacts us through the website, often the
 * first thing they receive from Nesisoft:
 *
 *  - estimateCopyEmail: after a quote request from the cost calculator, a
 *    copy of their estimate;
 *  - contactCopyEmail: after a message from the contact form, a
 *    confirmation that it arrived;
 *  - applicationCopyEmail: after a Trainingship application, a
 *    confirmation and what happens next.
 *
 * Both share one design: HTML in a table layout with inline styles (which
 * every mail app renders), 600px wide and phone-friendly, with a plain-text
 * version. Replies go to the company inbox.
 *
 * They go to an address typed into a public form, so they only repeat what
 * came from us (the price list, a reference, the date) and a first name
 * that looks like a name: never their message, company, file name or
 * anything else they typed, which would let anyone send our email to anyone
 * with their own words in it.
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
  onDarkMuted: "#a1a1aa",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const e = escapeHtml;

const DISCLAIMER =
  "This is an indicative range, not a quote. Running costs such as hosting, app store accounts, SMS and payment fees are paid to those providers and aren't included.";
const SPEC_FIRST =
  "AI-native builds work from a specification agreed before work starts, so changes after sign-off are quoted separately.";
const PLAN_STEP = ["We plan it together", "Once the scope is agreed, we set milestones and get building."];

/** A first name to greet them by, if it looks like one (it's typed into a public form). */
export function greetingName(firstName) {
  const name = String(firstName ?? "").trim();
  return /^\p{L}[\p{L}\p{M}'’. -]{0,29}$/u.test(name) ? name : "";
}

/** A short reference for an inquiry ("3F2A1B9C"), from its id; /admin shows the same. */
export function inquiryRef(id) {
  return String(id).replace(/-/g, "").slice(0, 8).toUpperCase();
}

const receivedAt = (date) =>
  new Date(date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" });

/* ---------------- The shared design ---------------- */

const sectionLabel = (text, bottom = 6) =>
  `<div style="font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};margin-bottom:${bottom}px">${e(text)}</div>`;

const paragraph = (html, bottom = 28) =>
  `<p style="margin:0 0 ${bottom}px;font-size:15px;line-height:24px;color:${C.body}">${html}</p>`;

const button = (url, label) => `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px">
              <tr>
                <td style="background:${C.violet}">
                  <a href="${e(url)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${e(label)} &rarr;</a>
                </td>
              </tr>
            </table>`;

function stepsTable(steps) {
  const rows = steps
    .map(
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
    )
    .join("");
  return `${sectionLabel("What happens next", 16)}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}
            </table>`;
}

const contactLine = (lead) =>
  paragraph(
    `${e(lead)} <a href="${COMPANY.phone.href}" style="color:${C.violet};text-decoration:none;font-weight:600;white-space:nowrap">${e(COMPANY.phone.display)}</a>.`,
    6
  );

/**
 * A whole email: the dark header (logo, reference, eyebrow, headline,
 * subline), the white letter (`letter`, HTML) and the footer.
 */
function layout({ title, preheader, ref, eyebrow, headline, headlineSize = 36, subline, name, letter, footerNote }) {
  const site = SITE_URL.replace(/^https?:\/\//, "");
  const lineHeight = headlineSize + 6;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${e(title)}</title>
<style>
  @media (max-width: 620px) {
    .px { padding-left: 24px !important; padding-right: 24px !important; }
    .headline { font-size: ${Math.min(headlineSize, 30)}px !important; line-height: ${Math.min(headlineSize, 30) + 6}px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${e(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page}">
  <tr>
    <td align="center" style="padding:32px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:${FONT}">

        <!-- Brand -->
        <tr>
          <td class="px" style="background:${C.dark};padding:28px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="width:40px"><img src="${e(SITE_URL)}/brand/nesisoft-logo-512.png" width="36" height="36" alt="" style="display:block;border:0;width:36px;height:36px"></td>
                <td valign="middle" style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Nesisoft</td>
                <td valign="middle" align="right" style="font-size:12px;color:${C.onDarkMuted};white-space:nowrap">Ref. ${e(ref)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" style="background:${C.dark};padding:36px 40px 36px">
            <div style="font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.gold}">${e(eyebrow)}</div>
            <div class="headline" style="margin-top:10px;font-size:${headlineSize}px;line-height:${lineHeight}px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">${e(headline)}</div>
            <div style="margin-top:8px;font-size:15px;line-height:22px;color:${C.onDarkMuted}">${subline}</div>
          </td>
        </tr>
        <tr><td style="background:${C.gold};height:3px;line-height:3px;font-size:0">&nbsp;</td></tr>

        <!-- The letter -->
        <tr>
          <td class="px" style="background:${C.card};padding:36px 40px 8px">
            <p style="margin:0 0 14px;font-size:17px;font-weight:600;color:${C.ink}">Hi ${e(name || "there")},</p>
            ${letter}
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
            <p style="margin:14px 0 0;color:#a1a1aa">${e(footerNote)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** The plain-text version's shared ending. */
const textEnding = (footerNote) => [
  "The Nesisoft team",
  SITE_URL,
  "",
  "--",
  `Nesisoft, software and app development, ${COMPANY.location}.`,
  footerNote,
];

/** Addressed by name when we have one; replies come to the company inbox; marked automatic. */
function envelope(inquiry, name, subject) {
  return {
    to: name ? { name, address: inquiry.email } : inquiry.email,
    replyTo: INQUIRY_NOTIFY_EMAIL,
    subject,
    // So out-of-office and other auto-replies don't answer it.
    headers: { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "OOF, AutoReply" },
  };
}

/* ---------------- A copy of their estimate ---------------- */

const ESTIMATE_STEPS = [
  ["We read your request", "A member of our team looks over your answers and any notes you sent."],
  ["We reply within one business day", "With a detailed quote, or a few questions if we need more detail."],
  PLAN_STEP,
];
const ESTIMATE_FOOTER =
  "You're getting this because someone asked for an estimate at nesisoft.com with this email address. If that wasn't you, please ignore it.";

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

function answersTable(estimate, bottom = 28) {
  const rows = answerRows(estimate)
    .map(([label, values], i, all) => {
      const rule = i < all.length - 1 ? `border-bottom:1px solid ${C.line};` : "";
      const value =
        values.length > 1
          ? // A bullet cell beside each item, so wrapped lines hang clear of it.
            `<table role="presentation" cellpadding="0" cellspacing="0" border="0">${values
              .map(
                (item) =>
                  `<tr><td valign="top" style="padding:8px 10px 0 0;width:6px"><div style="width:6px;height:6px;background:${C.violet};font-size:0;line-height:0">&nbsp;</div></td><td style="padding:1px 0;font-size:15px;line-height:22px;color:${C.ink}">${e(item)}</td></tr>`
              )
              .join("")}</table>`
          : e(values[0]);
      return `
              <tr>
                <td valign="top" style="padding:12px 16px 12px 0;width:96px;font-size:13px;color:${C.muted};${rule}">${e(label)}</td>
                <td valign="top" style="padding:12px 0;font-size:15px;line-height:22px;color:${C.ink};${rule}">${value}</td>
              </tr>`;
    })
    .join("");
  return `${sectionLabel("What you asked for")}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${bottom}px">${rows}
            </table>`;
}

/** After a quote request from the cost calculator: a copy of their estimate. */
export function estimateCopyEmail(inquiry) {
  const { estimate } = inquiry;
  const name = greetingName(inquiry.first_name);
  const url = estimateUrl(estimate);
  const { main, other } = ranges(estimate);
  const subject = estimateCopySubject(estimate);
  const intro =
    "Thanks for using our cost calculator. Here's a copy of your estimate for your records. We'll reply within one business day with a detailed quote, or a few questions if we need more detail.";
  const specFirst = estimate.approach?.id === "ai-native";

  const letter = [
    paragraph(e(intro)),
    answersTable(estimate, specFirst ? 14 : 28),
    specFirst ? `<p style="margin:0 0 28px;font-size:13px;line-height:20px;color:${C.muted}">${e(SPEC_FIRST)}</p>` : "",
    button(url, "View or adjust your estimate"),
    stepsTable(ESTIMATE_STEPS),
    `<div style="margin:10px 0 28px;padding:14px 16px;background:${C.soft};border-left:3px solid ${C.gold};font-size:13px;line-height:20px;color:${C.body}">${e(DISCLAIMER)}</div>`,
    contactLine("Questions in the meantime? Reply to this email or call us on"),
  ].join("\n            ");

  const text = [
    `Hi ${name || "there"},`,
    "",
    "Thanks for using our cost calculator. Here's a copy of your estimate. We'll reply within one business day with a detailed quote, or a few questions if we need more detail.",
    "",
    "YOUR ESTIMATE",
    `${main} (about ${other})`,
    `${formatWeeks(estimate)} to launch`,
    "",
    ...answerRows(estimate).map(([label, values]) => `${label}: ${values.join(", ")}`),
    ...(specFirst ? ["", SPEC_FIRST] : []),
    "",
    `View or adjust your estimate: ${url}`,
    "",
    "WHAT HAPPENS NEXT",
    ...ESTIMATE_STEPS.map(([title, detail], i) => `${i + 1}. ${title}. ${detail}`),
    "",
    DISCLAIMER,
    "",
    `Questions in the meantime? Reply to this email or call us on ${COMPANY.phone.display}.`,
    "",
    ...textEnding(ESTIMATE_FOOTER),
  ].join("\n");

  return {
    ...envelope(inquiry, name, subject),
    text,
    html: layout({
      title: subject,
      preheader: `${main} over ${formatWeeks(estimate)}. We'll reply within one business day with a detailed quote.`,
      ref: inquiryRef(inquiry.id),
      eyebrow: "Your estimate",
      headline: main,
      subline: `<span style="white-space:nowrap">About ${e(other)}</span> &nbsp;·&nbsp; <span style="white-space:nowrap">${e(formatWeeks(estimate))} to launch</span>`,
      name,
      letter,
      footerNote: ESTIMATE_FOOTER,
    }),
  };
}

/* ---------------- A confirmation of their message ---------------- */

const CONTACT_STEPS = [
  ["We read your message", "A member of our team reads it, and any brief you attached, and works out the right next step."],
  ["We reply within one business day", "With answers, a few questions, or a suggestion for a short call."],
  PLAN_STEP,
];
const CONTACT_FOOTER =
  "You're getting this because someone sent a message from nesisoft.com with this email address. If that wasn't you, please ignore it.";

/** The subject line, also used to thread replies sent from /admin. */
export function contactCopySubject(inquiry) {
  return `Your enquiry to Nesisoft (ref. ${inquiryRef(inquiry.id)})`;
}

/**
 * After a message from the contact form: that it arrived, what happens
 * next, and somewhere useful to go meanwhile. `attachmentReceived` says
 * whether their file was stored, so we only mention it when we have it.
 */
export function contactCopyEmail(inquiry, { attachmentReceived = false } = {}) {
  const name = greetingName(inquiry.first_name);
  const subject = contactCopySubject(inquiry);
  const ref = inquiryRef(inquiry.id);
  const received = receivedAt(inquiry.created_at);
  const calculator = `${SITE_URL}${CALCULATOR_PATH}`;
  const work = `${SITE_URL}/projects`;
  const intro = `Thanks for getting in touch with Nesisoft. We've received your message${
    attachmentReceived ? " and the document you attached" : ""
  }, and a member of our team will reply within one business day.`;
  const meanwhile =
    "Get a feel for the budget and timeline with our cost calculator, or browse what we've built for other clients.";

  const letter = [
    paragraph(e(intro)),
    stepsTable(CONTACT_STEPS),
    `<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>`,
    sectionLabel("While you wait", 10),
    paragraph(e(meanwhile), 18),
    button(calculator, "Estimate your project's cost").replace("margin:0 0 36px", "margin:0 0 14px"),
    paragraph(
      `<a href="${e(work)}" style="color:${C.violet};font-weight:600;text-decoration:none">See our work &rarr;</a>`,
      32
    ),
    contactLine("Need to add something? Reply to this email, which reaches the same team, or call us on"),
  ].join("\n            ");

  const text = [
    `Hi ${name || "there"},`,
    "",
    intro,
    "",
    `Reference: ${ref}`,
    `Received: ${received} (Accra time)`,
    "",
    "WHAT HAPPENS NEXT",
    ...CONTACT_STEPS.map(([title, detail], i) => `${i + 1}. ${title}. ${detail}`),
    "",
    "WHILE YOU WAIT",
    meanwhile,
    `Estimate your project's cost: ${calculator}`,
    `See our work: ${work}`,
    "",
    `Need to add something? Reply to this email, which reaches the same team, or call us on ${COMPANY.phone.display}.`,
    "",
    ...textEnding(CONTACT_FOOTER),
  ].join("\n");

  return {
    ...envelope(inquiry, name, subject),
    text,
    html: layout({
      title: subject,
      preheader: "Thanks for getting in touch. We'll reply within one business day.",
      ref,
      eyebrow: "Message received",
      headline: "We'll reply within one business day",
      headlineSize: 30,
      subline: `Received ${e(received)} (Accra time)`,
      name,
      letter,
      footerNote: CONTACT_FOOTER,
    }),
  };
}

/* ---------------- A confirmation of a Trainingship application ---------------- */

const APPLICATION_STEPS = [
  ["We read your application", "A member of our team reads every application, along with any CV and links you sent."],
  ["Shortlisted applicants hear from us", "If you're shortlisted, we'll invite you to talk with our team about your goals and your track."],
  ["Trainingships begin", "Successful applicants join the next intake and start work with our team."],
];
const APPLICATION_FOOTER =
  "You're getting this because someone applied for a Trainingship at nesisoft.com with this email address. If that wasn't you, please ignore it.";

/** The subject line, also used if the team replies from the mailbox. */
export function applicationCopySubject(application) {
  return `Your Trainingship application to Nesisoft (ref. ${inquiryRef(application.id)})`;
}

/**
 * After a Trainingship application. The track and intake come from our own
 * page content (the API only accepts tracks that exist), and `cvReceived`
 * says whether their CV was stored, so we only mention it when we have it.
 */
export function applicationCopyEmail(application, { cvReceived = false } = {}) {
  const name = greetingName(application.first_name);
  const subject = applicationCopySubject(application);
  const ref = inquiryRef(application.id);
  const work = `${SITE_URL}/projects`;
  const page = `${SITE_URL}/trainingships`;
  const intro = `Thanks for applying for a Nesisoft Trainingship${
    application.intake ? ` (${application.intake})` : ""
  }. We've received your application${cvReceived ? " and your CV" : ""}.`;
  const track = `Track: ${application.track}`;

  const letter = [
    paragraph(e(intro), 18),
    `<div style="margin:0 0 28px;padding:14px 16px;background:${C.soft};border-left:3px solid ${C.gold};font-size:15px;line-height:22px;color:${C.ink}">${e(track)}</div>`,
    stepsTable(APPLICATION_STEPS),
    `<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>`,
    sectionLabel("While you wait", 10),
    paragraph(e("Have a look at what our team builds, or read the programme details again."), 18),
    button(work, "See our work").replace("margin:0 0 36px", "margin:0 0 14px"),
    paragraph(
      `<a href="${e(page)}" style="color:${C.violet};font-weight:600;text-decoration:none">Trainingship details &rarr;</a>`,
      32
    ),
    contactLine("Need to add something? Reply to this email, which reaches our team, or call us on"),
  ].join("\n            ");

  const text = [
    `Hi ${name || "there"},`,
    "",
    intro,
    track,
    "",
    `Reference: ${ref}`,
    "",
    "WHAT HAPPENS NEXT",
    ...APPLICATION_STEPS.map(([title, detail], i) => `${i + 1}. ${title}. ${detail}`),
    "",
    `See our work: ${work}`,
    `Trainingship details: ${page}`,
    "",
    `Need to add something? Reply to this email, which reaches our team, or call us on ${COMPANY.phone.display}.`,
    "",
    ...textEnding(APPLICATION_FOOTER),
  ].join("\n");

  return {
    ...envelope(application, name, subject),
    text,
    html: layout({
      title: subject,
      preheader: "Thanks for applying. Here's what happens next.",
      ref,
      eyebrow: "Application received",
      headline: "Thanks for applying",
      headlineSize: 30,
      subline: e(application.track),
      name,
      letter,
      footerNote: APPLICATION_FOOTER,
    }),
  };
}

