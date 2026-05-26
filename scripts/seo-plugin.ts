import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Build-time SEO plugin — generates dist/sitemap.xml and dist/rss.xml from
 * the live content sources (markdown blog posts + services + projects data).
 * Adding a post or a service auto-updates both feeds at next build.
 *
 * Why a plugin rather than a static file: any time the content drifts, the
 * old static sitemap.xml became wrong silently. This makes the build the
 * single source of truth.
 */
export function seoPlugin(siteUrl: string): Plugin {
  return {
    name: "nesisoft-seo",
    apply: "build",
    closeBundle() {
      const root = process.cwd();
      const outDir = path.join(root, "dist");
      if (!fs.existsSync(outDir)) return;

      const blogDir = path.join(root, "src", "content", "blog");
      const servicesFile = path.join(root, "src", "data", "services.ts");
      const projectsFile = path.join(root, "src", "data", "projects.ts");

      const blogPosts = readBlogPosts(blogDir);
      const serviceSlugs = extractSlugs(servicesFile);
      const projectSlugs = extractSlugs(projectsFile);
      const today = new Date().toISOString().split("T")[0];

      // ---- sitemap.xml ----
      const urls: Array<{ loc: string; lastmod?: string; priority: string; changefreq: string }> = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/contact", priority: "0.8", changefreq: "monthly" },
        { loc: "/blog", priority: "0.7", changefreq: "weekly", lastmod: blogPosts[0]?.date },
        ...serviceSlugs.map((slug) => ({
          loc: `/services/${slug}`,
          priority: "0.6",
          changefreq: "monthly",
        })),
        ...projectSlugs.map((slug) => ({
          loc: `/projects/${slug}`,
          priority: "0.5",
          changefreq: "monthly",
        })),
        ...blogPosts.map((post) => ({
          loc: `/blog/${post.slug}`,
          priority: "0.6",
          changefreq: "monthly",
          lastmod: post.date,
        })),
      ];

      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
          .map(
            (u) =>
              `  <url>\n    <loc>${siteUrl}${u.loc}</loc>\n` +
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

interface BlogEntry {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
}

function readBlogPosts(dir: string): BlogEntry[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const meta = parseFrontmatter(raw);
      return {
        slug: name.replace(/\.md$/, ""),
        title: meta.title ?? name,
        excerpt: meta.excerpt ?? "",
        author: meta.author ?? "Nesisoft Team",
        date: meta.date ?? "1970-01-01",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function parseFrontmatter(raw: string): Record<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) return {};
  const out: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

/** Pull every `slug: "..."` value out of a TS data file. */
function extractSlugs(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  const src = fs.readFileSync(filePath, "utf8");
  return Array.from(src.matchAll(/slug:\s*["']([^"']+)["']/g)).map((m) => m[1]);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
