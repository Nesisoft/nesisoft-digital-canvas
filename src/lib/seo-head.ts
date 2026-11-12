import { createContext } from "react";

/** Everything <Seo> puts in <head> for one page. */
export interface SeoHead {
  title: string;
  /** [attribute, key, content]; an empty content means the tag is left out. */
  meta: Array<["name" | "property", string, string | undefined]>;
  /** Empty for a page that isn't to be indexed: it names no canonical URL. */
  canonical: string;
  jsonLd: Array<Record<string, unknown>>;
}

/**
 * Only provided by the prerender (src/entry-server.tsx): <Seo> hands it the
 * page's tags during the server render. In the browser there's no provider
 * and <Seo> writes the tags into the document instead.
 */
export const SeoHeadCollector = createContext<((head: SeoHead) => void) | null>(null);

/**
 * The tags as static markup for a prerendered page. Same elements and
 * attributes <Seo> looks up in the browser — meta[name|property=…],
 * link[rel=canonical], script[data-seo-jsonld] — so it updates these in place
 * rather than adding duplicates.
 */
export function seoHeadToHtml(head: SeoHead): string {
  return [
    `<title>${escapeHtml(head.title)}</title>`,
    ...head.meta
      .filter(([, , content]) => content)
      .map(([attr, key, content]) => `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`),
    ...(head.canonical ? [`<link rel="canonical" href="${escapeHtml(head.canonical)}" />`] : []),
    // "<" escaped so nothing in the data can close the script early.
    ...head.jsonLd.map(
      (block) =>
        `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(block).replace(/</g, "\\u003c")}</script>`
    ),
  ].join("\n");
}

// Newlines too, so every tag stays on one line (the prerender indents them).
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "&#10;");
}
