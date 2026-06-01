/**
 * Lightweight, privacy-friendly analytics scaffold (Plausible).
 *
 * Activated only when VITE_PLAUSIBLE_DOMAIN is set, so dev builds and
 * unconfigured deploys stay clean. Swap the provider here without touching
 * call sites — components just call `trackEvent(...)`.
 */

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as
  | string
  | undefined;

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

export function initAnalytics() {
  if (!PLAUSIBLE_DOMAIN || typeof document === "undefined") return;
  if (document.querySelector('script[data-domain]')) return;

  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.src = "https://plausible.io/js/script.js";
  document.head.appendChild(script);
}

export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  window.plausible?.(event, props ? { props } : undefined);
}
