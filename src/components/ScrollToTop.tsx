import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll on route change (instantly — a smooth scroll on every page
 * load reads as lag), and honours `#hash` targets once the page has rendered.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const firstLoad = useRef(true);

  useEffect(() => {
    const isFirstLoad = firstLoad.current;
    firstLoad.current = false;
    if (!hash) {
      // The first load is where the browser put it: on a prerendered page the
      // visitor may already have scrolled before the app hydrated.
      if (!isFirstLoad) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
    // Lazy routes and async content can mount after this effect; retry briefly.
    let tries = 0;
    const id = window.setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 20) {
        window.clearInterval(id);
        el?.scrollIntoView({ block: "start" });
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [pathname, hash]);

  return null;
}
