/**
 * How a visitor found the site, so an inquiry can say which channel brought
 * it in (shown in /admin and counted in Insights). On a visitor's first page
 * view we note, in this browser only:
 *
 *  - the referring site's host name (google.com, l.facebook.com…), never
 *    the full address, which can carry search terms;
 *  - the page they landed on (path only);
 *  - any campaign tags in the link (utm_source, utm_medium, utm_campaign),
 *    and whether it was a Google Ads click (gclid).
 *
 * It's kept for 30 days in localStorage (not a cookie) and only leaves the
 * browser inside a form the visitor chooses to send. The server works out
 * the channel from it (server/src/attribution.js).
 */

const KEY = "nesisoft:first-visit";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface FirstVisit {
  referrer: string;
  landing: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  googleAds: boolean;
  at: number;
}

const clip = (value: string | null, max = 100) => (value ?? "").trim().slice(0, max);

function read(): FirstVisit | null {
  try {
    const visit = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as FirstVisit | null;
    return visit && Date.now() - visit.at < MAX_AGE_MS ? visit : null;
  } catch {
    return null;
  }
}

/** The external site that sent them here, as a host name; "" for none or our own site. */
function referringHost(): string {
  try {
    if (!document.referrer) return "";
    const url = new URL(document.referrer);
    return url.host === window.location.host ? "" : url.hostname.toLowerCase().slice(0, 200);
  } catch {
    return "";
  }
}

/** Notes how this visitor arrived, unless a visit from the last 30 days is already noted. */
export function recordFirstVisit() {
  if (typeof window === "undefined" || read()) return;
  const params = new URLSearchParams(window.location.search);
  const visit: FirstVisit = {
    referrer: referringHost(),
    landing: window.location.pathname.slice(0, 200),
    utmSource: clip(params.get("utm_source")),
    utmMedium: clip(params.get("utm_medium")),
    utmCampaign: clip(params.get("utm_campaign")),
    googleAds: params.has("gclid"),
    at: Date.now(),
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(visit));
  } catch {
    // Private mode or storage blocked: the inquiry just won't say.
  }
}

/** The noted visit as form fields, for POST /api/inquiries; none if nothing was noted. */
export function attributionFields(): Record<string, string> {
  const visit = read();
  if (!visit) return {};
  return {
    referrer: visit.referrer,
    landingPage: visit.landing,
    utmSource: visit.utmSource,
    utmMedium: visit.utmMedium,
    utmCampaign: visit.utmCampaign,
    googleAds: visit.googleAds ? "1" : "",
  };
}
