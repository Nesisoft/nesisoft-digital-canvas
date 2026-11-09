/**
 * Privacy-friendly analytics, cookie-free on both counts:
 *
 *  - Vercel Web Analytics: page views, top pages, referrers and countries.
 *    Its script is served by Vercel at /_vercel/insights/script.js once
 *    Analytics is enabled for the project (Vercel → the project → Analytics),
 *    so it's only loaded on the deployed site, never on localhost.
 *  - Plausible (optional): only when VITE_PLAUSIBLE_DOMAIN is set.
 *
 * Components call trackEvent(...) for key actions (quote requests, contact
 * messages, signups); each provider that's on receives it. Vercel records
 * these custom events on its Pro plan; on Hobby it counts page views only.
 */

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProps }) => void;
    /** Vercel Web Analytics' command queue (set up below, drained by its script). */
    va?: (command: string, payload?: unknown) => void;
    vaq?: unknown[][];
  }
}

const isLocal = (host: string) => host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".local");

function loadScript(src: string, attributes: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = src;
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (typeof document === "undefined") return;

  if (import.meta.env.PROD && !isLocal(window.location.hostname)) {
    // Calls made before the script arrives wait in this queue.
    window.va ??= (...args: unknown[]) => {
      (window.vaq ??= []).push(args);
    };
    loadScript("/_vercel/insights/script.js");
  }

  if (PLAUSIBLE_DOMAIN) {
    loadScript("https://plausible.io/js/script.js", { "data-domain": PLAUSIBLE_DOMAIN });
  }
}

export function trackEvent(event: string, props?: EventProps) {
  window.plausible?.(event, props ? { props } : undefined);
  window.va?.("event", { name: event, data: props });
}
