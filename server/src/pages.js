import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { databaseConfigured } from "./db.js";
import { SITE_URL, escapeHtml } from "./mailer.js";
import { findPublishedPost } from "./models/posts.js";
import { findPublishedPlatform, findPublishedProject } from "./models/projects.js";

/**
 * Pages that have no prerendered file. Everything the site knows about at
 * build time is prerendered (scripts/prerender-plugin.ts) and served as a
 * file; an unknown address gets the NotFound page with a real 404 status, so
 * search engines don't take it for a page. Posts, projects and platforms
 * can also be added in /admin after the build, so for those three sections
 * the database decides:
 *
 *   - published in the database: the app's shell (200.html), with the item's
 *     own title, description, canonical URL and image in its <head>, so the
 *     HTML a crawler first sees describes the right page;
 *   - not there: the NotFound page (404.html) with a 404 status;
 *   - database unreachable: the shell, without the homepage's canonical URL
 *     (fail open: a real page shouldn't go missing because of an outage).
 *
 * On Vercel, vercel.json rewrites /blog/<slug>, /projects/<slug> and
 * /platforms/<slug> to this function when no prerendered file matches, and
 * includes dist/200.html and dist/404.html in it. `npm start` serves the
 * whole built site through app.js.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const distDir = path.resolve(__dirname, "../../dist");

export const DYNAMIC_PAGES = ["/blog/:slug", "/projects/:slug", "/platforms/:slug"];

/** The prerendered file for a path, or null (dist/index.html for "/"). */
export function prerenderedFile(urlPath) {
  let clean;
  try {
    clean = decodeURIComponent(urlPath).replace(/\/+$/, "");
  } catch {
    return null; // malformed %-escape
  }
  const candidates = clean ? [`${clean}.html`, `${clean}/index.html`] : ["index.html"];
  for (const candidate of candidates) {
    const file = path.join(distDir, candidate);
    // path.join resolves "..", so this keeps every lookup inside dist/.
    if (file.startsWith(distDir + path.sep) && fs.existsSync(file)) return file;
  }
  return null;
}

// 200.html and 404.html, read once per instance. If the files weren't
// bundled with the function, they're fetched from the site itself (the CDN
// serves them as /200 and /404).
const templates = new Map();

async function template(name, req) {
  if (templates.has(name)) return templates.get(name);
  let html = null;
  try {
    html = fs.readFileSync(path.join(distDir, `${name}.html`), "utf8");
  } catch {
    try {
      const response = await fetch(`https://${req.get("host")}/${name}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) html = await response.text();
    } catch (err) {
      console.error(`[pages] couldn't load ${name}.html:`, err.message);
    }
  }
  if (html) templates.set(name, html);
  return html;
}

/** What the <head> should say about a post, project or platform. */
function describe(section, row) {
  if (section === "blog") {
    return { title: row.title, description: row.excerpt, image: row.image };
  }
  if (section === "projects") {
    return { title: `${row.name} Case Study`, description: row.description, image: row.image };
  }
  const tagline = (row.tagline ?? "").replace(/[.!]$/, "");
  return {
    title: tagline ? `${row.name}: ${tagline}` : row.name,
    description: row.full_description || row.description,
    image: row.image,
  };
}

const LOOKUPS = { blog: findPublishedPost, projects: findPublishedProject, platforms: findPublishedPlatform };

/**
 * The shell with one page's head tags in place of the homepage's: the title,
 * description, canonical URL and their Open Graph and Twitter twins. With no
 * page, only the canonical URL and og:url go, so the shell never claims to be
 * the homepage.
 */
export function shellFor(html, page, url) {
  if (!page) {
    return html
      .replace(/\s*<link rel="canonical"[^>]*>/, "")
      .replace(/\s*<meta property="og:url"[^>]*>/, "");
  }
  const title = escapeHtml(`${page.title} | Nesisoft`);
  const description = escapeHtml(page.description || "");
  const set = (attr, key, value) => (out) =>
    out.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${value}$2`);
  const steps = [
    (out) => out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`),
    (out) => out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(url)}$2`),
    set("name", "description", description),
    set("property", "og:title", title),
    set("property", "og:description", description),
    set("property", "og:url", escapeHtml(url)),
    set("name", "twitter:title", title),
    set("name", "twitter:description", description),
  ];
  if (page.image && /^https?:\/\//.test(page.image)) {
    steps.push(set("property", "og:image", escapeHtml(page.image)), set("name", "twitter:image", escapeHtml(page.image)));
  }
  return steps.reduce((out, step) => step(out), html);
}

/** Sends the NotFound page with a 404 status. */
export async function sendNotFound(req, res) {
  const html = await template("404", req);
  res.status(404).set("Cache-Control", "public, max-age=0, must-revalidate");
  if (html) return res.type("html").send(html);
  return res.type("text").send("Not found");
}

/** Express handler for DYNAMIC_PAGES. */
export async function sendDynamicPage(req, res) {
  const file = prerenderedFile(req.path);
  if (file) return res.sendFile(file); // npm start: a bundled post, project or platform

  const [section] = req.path.split("/").filter(Boolean);
  const slug = req.params.slug;
  let row = null;
  let lookupFailed = !databaseConfigured;
  if (!lookupFailed) {
    try {
      row = await LOOKUPS[section](slug);
    } catch (err) {
      console.error(`[pages] looking up ${req.path} failed:`, err.message);
      lookupFailed = true;
    }
  }
  if (!row && !lookupFailed) return sendNotFound(req, res);

  const html = await template("200", req);
  if (!html) return res.status(503).set("Retry-After", "30").type("text").send("Temporarily unavailable");
  const page = row ? describe(section, row) : null;
  res.set("Cache-Control", "public, max-age=0, must-revalidate");
  return res.type("html").send(shellFor(html, page, `${SITE_URL}/${section}/${encodeURIComponent(slug)}`));
}
