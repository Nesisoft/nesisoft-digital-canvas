import fs from "node:fs";
import path from "node:path";

/**
 * The site's public pages, read from the same content sources the app renders:
 * Markdown posts in src/content/blog plus the slugs in src/data/services.ts
 * and src/data/projects.ts. The sitemap (seo-plugin.ts) and the prerender
 * (prerender-plugin.ts) are both built from this one list, so a new post or
 * service shows up in both at the next build. /admin and /studio are
 * deliberately absent.
 */
export interface SiteRoute {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
  /** Prerendered, but kept out of the sitemap — mirrors the page's own <Seo noindex>. */
  noindex?: boolean;
}

export function getSiteRoutes(root: string): SiteRoute[] {
  const blogPosts = readBlogPosts(path.join(root, "src", "content", "blog"));
  const serviceSlugs = extractSlugs(path.join(root, "src", "data", "services.ts"));
  const projectSlugs = extractSlugs(path.join(root, "src", "data", "projects.ts"));

  return [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    // The team itself loads from the API (managed in /admin).
    { path: "/team", priority: "0.7", changefreq: "monthly" },
    { path: "/contact", priority: "0.8", changefreq: "monthly" },
    { path: "/blog", priority: "0.7", changefreq: "weekly", lastmod: blogPosts[0]?.date },
    { path: "/privacy", priority: "0.3", changefreq: "yearly" },
    ...serviceSlugs.map((slug) => ({
      path: `/services/${slug}`,
      priority: "0.6",
      changefreq: "monthly",
    })),
    ...projectSlugs.map((slug) => ({
      path: `/projects/${slug}`,
      priority: "0.5",
      changefreq: "monthly",
    })),
    ...blogPosts.map((post) => ({
      path: `/blog/${post.slug}`,
      priority: "0.6",
      changefreq: "monthly",
      lastmod: post.date,
    })),
  ];
}

export interface BlogEntry {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
}

export function readBlogPosts(dir: string): BlogEntry[] {
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
