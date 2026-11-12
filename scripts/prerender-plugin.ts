import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build, type Plugin, type ResolvedConfig } from "vite";
import { getSiteRoutes } from "./site-routes";

/**
 * The files each prerendered route is written to, relative to dist/.
 * Render doesn't document whether it serves /blog from blog/index.html or
 * from blog.html, so for now every route gets both. Once the live host is
 * confirmed, drop the one it doesn't use here.
 */
function outputFilesFor(route: string): string[] {
  if (route === "/") return ["index.html"];
  const file = route.slice(1);
  return [`${file}/index.html`, `${file}.html`];
}

/** Any URL no route matches renders the NotFound page. */
const NOT_FOUND_URL = "/404";

/**
 * Goes in each prerendered page's <head>, so it runs before anything paints.
 * A page carries the path it was rendered for (data-prerendered on <html>);
 * if the host serves it for another URL — say a catch-all rewrite of /admin
 * to /index.html — this hides it behind the boot loader so the wrong page
 * never flashes, and src/main.tsx renders the right one from scratch. A
 * trailing slash (/blog/ for /blog) still counts as the same page.
 */
const MISMATCH_GUARD = `<script>
  if ((location.pathname.replace(/\\/+$/, "") || "/") !== document.documentElement.dataset.prerendered) {
    document.documentElement.setAttribute("data-prerender-mismatch", "");
  }
</script>
<style>
  #prerender-boot { display: none; }
  [data-prerender-mismatch] #root { display: none; }
  [data-prerender-mismatch] #prerender-boot { display: block; }
</style>`;

type Render = (url: string) => Promise<{ html: string; head: string }>;

/**
 * Build-time prerender. After the client build, renders every public page —
 * the sitemap's routes, from site-routes.ts — to static HTML with React's
 * server renderer (src/entry-server.tsx), so crawlers and link previews that
 * don't run JavaScript get the real content and that page's own <head> tags.
 * In the browser, src/main.tsx hydrates the markup.
 *
 * Writes into dist/:
 *  - index.html and every other route's files (see outputFilesFor)
 *  - 404.html: the NotFound page, served with a 404 status for unknown URLs
 *  - 200.html: the untouched client-only shell (boot loader, no content) —
 *    for /admin, and for posts, projects and platforms added in /admin since
 *    the build (server/src/pages.js gives it their head tags)
 *
 * The server bundle is built into a temp dir and deleted afterwards, so none
 * of it ships.
 */
export function prerenderPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "nesisoft-prerender",
    // Not in the SSR build below, which reuses this config file.
    apply: (_, env) => env.command === "build" && !env.isSsrBuild,
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      const started = Date.now();
      const outDir = path.resolve(config.root, config.build.outDir);
      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const ssrDir = fs.mkdtempSync(path.join(os.tmpdir(), "nesisoft-prerender-"));

      try {
        await build({
          configFile: config.configFile,
          mode: config.mode,
          logLevel: "warn",
          build: {
            ssr: path.resolve(config.root, "src/entry-server.tsx"),
            outDir: ssrDir,
            emptyOutDir: true,
            copyPublicDir: false,
            minify: false,
            rollupOptions: {
              // .mjs because the temp dir has no package.json saying "type": "module".
              output: { entryFileNames: "[name].mjs", chunkFileNames: "[name]-[hash].mjs" },
            },
          },
          // One self-contained bundle: Node never has to resolve (or CJS/ESM
          // interop) the app's dependencies from the temp dir.
          ssr: { noExternal: true },
        });
        const entry = pathToFileURL(path.join(ssrDir, "entry-server.mjs")).href;
        const { render } = (await import(entry)) as { render: Render };

        const write = (file: string, html: string) => {
          const target = path.join(outDir, file);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, html);
        };

        // The template is the client-only shell; keep a copy before index.html
        // is overwritten with the prerendered homepage.
        write("200.html", template);

        const routes = getSiteRoutes(config.root).map((route) => route.path);
        for (const route of routes) {
          const page = toPage(template, route, await render(route));
          outputFilesFor(route).forEach((file) => write(file, page));
        }
        write("404.html", toPage(template, NOT_FOUND_URL, await render(NOT_FOUND_URL)));

        const seconds = ((Date.now() - started) / 1000).toFixed(1);
        config.logger.info(
          `\n[prerender] ${routes.length} pages, 404.html and 200.html written in ${seconds}s\n`
        );
      } finally {
        fs.rmSync(ssrDir, { recursive: true, force: true });
      }
    },
  };
}

/**
 * Fills the built index.html with one rendered page: marks <html> with its
 * path, swaps the template's default SEO tags (between the seo markers) for
 * the page's own, and puts the markup in #root — byte for byte what React
 * hydrates, so the boot loader moves out to #prerender-boot.
 */
function toPage(template: string, route: string, { html, head }: { html: string; head: string }) {
  let page = replace(template, /<html([^>]*)>/, (_, attrs) => `<html${attrs} data-prerendered="${route}">`);
  page = replace(page, /( *)<!-- seo -->[\s\S]*?<!-- \/seo -->/, (_, indent: string) =>
    `${head}\n${MISMATCH_GUARD}`.replace(/^/gm, indent)
  );
  page = replace(
    page,
    /<div id="root">([\s\S]*)<\/div>(\s*<\/body>)/,
    (_, boot, end) => `<div id="root">${html}</div>\n    <div id="prerender-boot">${boot}</div>${end}`
  );
  return page;
}

/** String.replace that fails loudly when index.html no longer has what it expects. */
function replace(source: string, pattern: RegExp, replacer: (...groups: string[]) => string) {
  if (!pattern.test(source)) {
    throw new Error(`[prerender] index.html no longer matches ${pattern}`);
  }
  return source.replace(pattern, replacer);
}
