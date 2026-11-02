import { Writable } from "node:stream";
import type { ReactNode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { createQueryClient } from "./lib/queryClient";
import { SeoHeadCollector, seoHeadToHtml, type SeoHead } from "./lib/seo-head";

/**
 * Prerender entry — built and run at build time by
 * scripts/prerender-plugin.ts, never shipped to the browser. Renders one URL
 * with the same <App> tree main.tsx hydrates, and returns the markup for
 * #root plus the page's <head> tags.
 */
export async function render(url: string): Promise<{ html: string; head: string }> {
  let head: SeoHead | undefined;
  const queryClient = createQueryClient();
  const Router = ({ children }: { children?: ReactNode }) => (
    <StaticRouter location={url}>{children}</StaticRouter>
  );

  try {
    const html = await renderComplete(
      <SeoHeadCollector.Provider value={(tags) => (head = tags)}>
        <App router={Router} queryClient={queryClient} />
      </SeoHeadCollector.Provider>
    );
    if (!head) throw new Error(`${url} rendered no <Seo>, so its page would have no title`);
    return { html, head: seoHeadToHtml(head) };
  } finally {
    // Nothing fetches on the server, but queries still schedule their cache
    // timers — clear them so the build exits as soon as it's done.
    queryClient.clear();
  }
}

/**
 * Waits for every lazy route and Suspense boundary to resolve (onAllReady),
 * so the markup holds the page itself, not its RouteFallback. An unlimited
 * progressiveChunkSize keeps every boundary inline: no hidden segments that
 * need a script to reveal them.
 */
function renderComplete(element: ReactNode): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const { pipe } = renderToPipeableStream(element, {
      progressiveChunkSize: Number.POSITIVE_INFINITY,
      onAllReady() {
        pipe(
          new Writable({
            write(chunk: Buffer, _encoding, done) {
              chunks.push(chunk);
              done();
            },
            final(done) {
              // Decoded once at the end, so no character is split across chunks.
              resolve(Buffer.concat(chunks).toString("utf8"));
              done();
            },
          })
        );
      },
      // Any error would leave a page half-rendered: fail the build instead.
      onShellError: reject,
      onError: reject,
    });
  });
}
