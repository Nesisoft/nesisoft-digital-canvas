/**
 * Which channel brought an inquiry in, from what the browser noted on the
 * visitor's first visit (src/lib/attribution.ts): the referring site's host
 * name, the landing page and any campaign tags. Stored with the inquiry
 * (migration 008), shown in /admin and counted in Insights.
 *
 * Channels: campaign (tagged links and Google Ads), search, ai (AI
 * assistants), social, referral (any other site) and direct (no referrer:
 * typed in, bookmarked, or a link shared in WhatsApp, email or an app).
 */

export const CHANNEL_LABELS = {
  campaign: "Campaigns and ads",
  search: "Search engines",
  ai: "AI assistants",
  social: "Social media",
  referral: "Other websites",
  direct: "Direct or shared link",
};

// Host name patterns, checked in this order (Gemini before Google search).
const SOURCES = [
  ["ai", /(^|\.)(chatgpt\.com|chat\.openai\.com)$/, "ChatGPT"],
  ["ai", /(^|\.)perplexity\.ai$/, "Perplexity"],
  ["ai", /(^|\.)claude\.ai$/, "Claude"],
  ["ai", /(^|\.)gemini\.google\.com$/, "Gemini"],
  ["ai", /(^|\.)copilot\.microsoft\.com$/, "Copilot"],
  ["search", /(^|\.)google\.[a-z.]+$/, "Google"],
  ["search", /(^|\.)bing\.com$/, "Bing"],
  ["search", /(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  ["search", /(^|\.)yahoo\.[a-z.]+$/, "Yahoo"],
  ["search", /(^|\.)ecosia\.org$/, "Ecosia"],
  ["search", /(^|\.)yandex\.[a-z.]+$/, "Yandex"],
  ["search", /(^|\.)baidu\.com$/, "Baidu"],
  ["search", /(^|\.)brave\.com$/, "Brave Search"],
  ["social", /(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
  ["social", /(^|\.)instagram\.com$/, "Instagram"],
  ["social", /(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  ["social", /(^|\.)(x\.com|twitter\.com|t\.co)$/, "X (Twitter)"],
  ["social", /(^|\.)tiktok\.com$/, "TikTok"],
  ["social", /(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  ["social", /(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  ["social", /(^|\.)threads\.net$/, "Threads"],
  ["social", /(^|\.)reddit\.com$/, "Reddit"],
  ["social", /(^|\.)pinterest\.[a-z.]+$/, "Pinterest"],
];

const HOST = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;
const PATH = /^\/(?!\/)[^\s<>"'`]{0,199}$/;

/** A tag as text: trimmed, no control characters, at most 100 characters. */
const tag = (value) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100) : "";

/** The channel and the named source within it ("search", "Google"). */
export function classify({ referrer, utmSource, utmMedium, googleAds }) {
  if (utmSource) return { channel: "campaign", source: utmMedium ? `${utmSource} / ${utmMedium}` : utmSource };
  if (googleAds) return { channel: "campaign", source: "Google Ads" };
  if (!referrer) return { channel: "direct", source: "" };
  for (const [channel, pattern, name] of SOURCES) {
    if (pattern.test(referrer)) return { channel, source: name };
  }
  return { channel: "referral", source: referrer.replace(/^www\./, "") };
}

/**
 * The attribution columns for an inquiry, from the form's fields. Anything
 * malformed is dropped rather than refused: it's not worth losing a lead over.
 */
export function readAttribution(body = {}) {
  const referrer = typeof body.referrer === "string" ? body.referrer.trim().toLowerCase() : "";
  const landing = typeof body.landingPage === "string" ? body.landingPage.trim() : "";
  const values = {
    referrer: HOST.test(referrer) && referrer.length <= 200 ? referrer : "",
    landing_page: PATH.test(landing) ? landing : "",
    utm_source: tag(body.utmSource),
    utm_medium: tag(body.utmMedium),
    utm_campaign: tag(body.utmCampaign),
  };
  // Nothing noted (older browsers, storage blocked, or sent before this existed).
  const noted = Object.values(values).some(Boolean) || body.googleAds === "1";
  if (!noted) return { ...values, channel: null, channel_source: "" };
  const { channel, source } = classify({
    referrer: values.referrer,
    utmSource: values.utm_source,
    utmMedium: values.utm_medium,
    googleAds: body.googleAds === "1",
  });
  return { ...values, channel, channel_source: source.slice(0, 200) };
}

/** "Search engines (Google)", "Direct or shared link": how an inquiry is described. */
export function describeChannel(channel, source) {
  if (!channel) return "";
  const label = CHANNEL_LABELS[channel] ?? channel;
  return source ? `${label} (${source})` : label;
}
