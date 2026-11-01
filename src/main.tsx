import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initAnalytics } from './lib/analytics'

initAnalytics();

const container = document.getElementById("root")!;
// Prerendered pages (scripts/prerender-plugin.ts) carry the path they were
// rendered for; the client-only shell (200.html) and the dev server don't.
const prerenderedPath = document.documentElement.dataset.prerendered;
// /blog/ is the same page as /blog (must match the guard in prerender-plugin.ts).
const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";

if (prerenderedPath === currentPath) {
  // #root already holds this page's markup: attach to it, don't re-render.
  hydrateRoot(container, <App />);
} else {
  if (prerenderedPath !== undefined) {
    // A prerendered page served for another URL (a host's catch-all rewrite).
    // Its inline guard is hiding it behind the boot loader; put the loader in
    // its place, as in the shell, and render the right page from scratch.
    const boot = document.getElementById("prerender-boot");
    container.replaceChildren(...Array.from(boot?.childNodes ?? []));
    boot?.remove();
    document.documentElement.removeAttribute("data-prerender-mismatch");
  }
  createRoot(container).render(<App />);
}
