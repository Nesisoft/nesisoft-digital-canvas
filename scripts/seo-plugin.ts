import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { getSiteRoutes, readBlogPosts } from "./site-routes";

/**
 * Build-time SEO plugin — generates dist/sitemap.xml and dist/rss.xml from
 * the live content sources (markdown blog posts + services + projects + team data).
 * Adding a post or a service auto-updates both feeds at next build.
 *
 * Why a plugin rather than a static file: any time the content drifts, the
 * old static sitemap.xml became wrong silently. This makes the build the
 * single source of truth.
 */
export function seoPlugin(siteUrl: string): Plugin {
  return {
    name: "nesisoft-seo",
    // Client build only: the prerender's SSR build (prerender-plugin.ts) reuses
    // this config, and has no feeds to write.
    apply: (_, env) => env.command === "build" && !env.isSsrBuild,
    closeBundle() {
      const root = process.cwd();
      const outDir = path.join(root, "dist");
      if (!fs.existsSync(outDir)) return;

      const blogPosts = readBlogPosts(path.join(root, "src", "content", "blog"));
      const today = new Date().toISOString().split("T")[0];

      // ---- sitemap.xml ----
      // The same route list the prerender renders, minus its noindex pages.
      const urls = getSiteRoutes(root).filter((route) => !route.noindex);

      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
          .map(
            (u) =>
              `  <url>\n    <loc>${siteUrl}${u.path}</loc>\n` +
              (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : "") +
              `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
          )
          .join("\n") +
        `\n</urlset>\n`;

      fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);

      // ---- rss.xml ----
      const rss =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
        `  <channel>\n` +
        `    <title>Nesisoft Blog</title>\n` +
        `    <link>${siteUrl}/blog</link>\n` +
        `    <description>Insights on mobile, web, AI and software development across Africa.</description>\n` +
        `    <language>en-us</language>\n` +
        `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n` +
        `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />\n` +
        blogPosts
          .map(
            (post) =>
              `    <item>\n` +
              `      <title>${escapeXml(post.title)}</title>\n` +
              `      <link>${siteUrl}/blog/${post.slug}</link>\n` +
              `      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>\n` +
              `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>\n` +
              `      <description>${escapeXml(post.excerpt)}</description>\n` +
              `      <author>${escapeXml(post.author)}</author>\n` +
              `    </item>`
          )
          .join("\n") +
        `\n  </channel>\n</rss>\n`;

      fs.writeFileSync(path.join(outDir, "rss.xml"), rss);

      // Quick build-log line so you can see the counts at a glance.
      // eslint-disable-next-line no-console
      console.log(
        `\n[seo] sitemap (${urls.length} urls) and rss.xml (${blogPosts.length} posts) — generated for ${siteUrl}\n`
      );

      // Today is unused below, but kept so future per-page lastmod is trivial.
      void today;
    },
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
