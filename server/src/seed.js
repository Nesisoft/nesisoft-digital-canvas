import "./env.js";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { closePool, query, withClient } from "./db.js";
import { MIGRATION_LOCK_ID, runMigrations } from "./migrate.js";
import { DEFAULT_CONTENT } from "./models/content.js";
import { PROJECT_COLUMNS, PROJECT_JSON_FIELDS } from "./models/projects.js";
import { ensureBucket } from "./storage.js";

/**
 * Fills an empty database from the content the site already ships with: the
 * Markdown posts, src/data/projects.ts and the default homepage copy. Applies
 * pending migrations first and makes sure the image bucket exists (when the
 * Supabase keys are set). Anything already there (same slug, or saved
 * homepage copy) is left alone, so running it again never duplicates, but it
 * does re-add any bundled post or project deleted in /admin since. Production
 * deploys on Vercel fill a new, empty database by themselves, once, and never
 * re-add anything (see deploy.js), so running this by hand is only needed
 * elsewhere.
 *
 * Team members aren't seeded: add the real people in /admin.
 *
 *   npm run seed
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, "..", "..", "src", "content", "blog");
const PROJECTS_TS = path.join(__dirname, "..", "..", "src", "data", "projects.ts");

function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data = {};
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
    if (key) data[key] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

const blogFiles = () => fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
const md5 = (text) => createHash("md5").update(text).digest("hex");

// The fields a Markdown post sets, in a fixed order (see postHash).
const POST_FIELDS = ["title", "excerpt", "content", "image", "category", "author", "date"];

/** One Markdown post: its slug, the hash of the file, and its column values. */
function readBundledPost(file) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, body } = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, "");
  return {
    slug,
    fileHash: md5(raw),
    values: {
      title: data.title || slug,
      excerpt: data.excerpt || "",
      content: body.trim(),
      image: data.image || "",
      category: data.category || "Uncategorized",
      author: data.author || "Nesisoft Team",
      date: data.date ? new Date(data.date) : new Date(),
    },
  };
}

/**
 * A fingerprint of a post's content: a blog_posts row, or a file's values.
 * Recorded when a file is copied in, to tell later whether /admin has changed
 * the post since. Migration 010 stores some, so keep the recipe as it is.
 */
export function postHash(post) {
  return md5(
    JSON.stringify(
      POST_FIELDS.map((field) => (field === "date" ? new Date(post.date).toISOString() : post[field]))
    )
  );
}

/** Adds one post unless its slug is taken; the new row, or null. */
async function insertPost(q, post) {
  const { rows } = await q(
    `insert into blog_posts (slug, ${POST_FIELDS.join(", ")})
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (slug) do nothing
     returning *`,
    [post.slug, ...POST_FIELDS.map((field) => post.values[field])]
  );
  return rows[0] ?? null;
}

async function seedBlog(q) {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("[seed] no blog dir found, skipping posts");
    return;
  }
  const files = blogFiles();
  let created = 0;
  for (const file of files) {
    if (await insertPost(q, readBundledPost(file))) created += 1;
  }
  console.log(`[seed] blog: imported ${created} new post(s) (${files.length} files seen)`);
}

/**
 * Read the projects straight out of the frontend's `src/data/projects.ts`. The
 * exported array is a plain JS object literal (no TS types inside it), so we
 * extract it and evaluate it — no duplicated data to keep in sync.
 */
function loadStaticProjects() {
  const text = fs.readFileSync(PROJECTS_TS, "utf8");
  // Capture from the opening "[" up to the top-level "\n];" terminator.
  const match = /export const projects[^=]*=\s*(\[[\s\S]*?\n\]);/.exec(text);
  if (!match) throw new Error("Could not locate projects array in projects.ts");
  // eslint-disable-next-line no-new-func
  return new Function(`return ${match[1]}`)();
}

async function seedProjects(q) {
  const projects = loadStaticProjects();
  let created = 0;
  for (const [index, project] of projects.entries()) {
    // Same field-to-column map the admin API writes through.
    const values = { slug: project.slug };
    for (const [field, column] of Object.entries(PROJECT_COLUMNS)) {
      if (project[field] === undefined) continue;
      values[column] = PROJECT_JSON_FIELDS.includes(field)
        ? JSON.stringify(project[field])
        : project[field];
    }
    values.sort_order = index;
    const columns = Object.keys(values);
    const { rowCount } = await q(
      `insert into projects (${columns.join(", ")})
       values (${columns.map((_, i) => `$${i + 1}`).join(", ")})
       on conflict (slug) do nothing`,
      columns.map((column) => values[column])
    );
    created += rowCount;
  }
  console.log(`[seed] projects: imported ${created} new (${projects.length} seen)`);
}

async function seedContent(q) {
  const { rowCount } = await q(
    `insert into site_content (key, hero, about) values ('main', $1, $2)
     on conflict (key) do nothing`,
    [JSON.stringify(DEFAULT_CONTENT.hero), JSON.stringify(DEFAULT_CONTENT.about)]
  );
  console.log(
    rowCount ? "[seed] content: created default site content" : "[seed] content: already present, skipping"
  );
}

// Recorded in schema_migrations (which can't clash with a migration: those
// end in .sql) once the bundled content has been imported, so deploys only
// ever fill the database the first time.
const INITIAL_CONTENT = "seed:initial-content";

const markImported = (q) =>
  q("insert into schema_migrations (name) values ($1) on conflict (name) do nothing", [
    INITIAL_CONTENT,
  ]);

/**
 * Imports the bundled posts, projects and homepage copy, skipping anything
 * already there, and records the import. `q` runs each statement: the pool by
 * default, or one client's transaction.
 */
async function importBundledContent(q = query) {
  await seedBlog(q);
  await seedProjects(q);
  await seedContent(q);
  await markImported(q);
}

/**
 * The deploy-time import (see deploy.js): fills the database from the bundled
 * content only when it's brand new. Once the import is recorded, or as soon as
 * the database holds any content (seeded by hand or written in /admin), it's
 * left alone, so nothing deleted in /admin ever comes back. One transaction,
 * under the migrations' lock: two deploys at once take turns, and an import
 * that fails part-way leaves nothing behind, so the next deploy starts over.
 * Returns what it did, for the log.
 */
export function importBundledContentOnce() {
  return withClient(async (client) => {
    const q = (text, params) => client.query(text, params);
    await q("begin");
    try {
      await q("select pg_advisory_xact_lock($1)", [MIGRATION_LOCK_ID]);
      const result = await importIfNew(q);
      await q("commit");
      return result;
    } catch (err) {
      await q("rollback").catch(() => {});
      throw err;
    }
  });
}

async function importIfNew(q) {
  // The marker first: once it's recorded, the content tables aren't even
  // looked at, so a later migration is free to rename or drop them.
  const marked = await q("select 1 from schema_migrations where name = $1", [INITIAL_CONTENT]);
  if (marked.rowCount > 0) return "already imported, skipping";

  const { rows } = await q(
    `select exists (select 1 from blog_posts)
         or exists (select 1 from projects)
         or exists (select 1 from team_members)
         or exists (select 1 from site_content) as has_content`
  );
  if (rows[0].has_content) {
    await markImported(q);
    return "the database already has content, skipping";
  }
  await importBundledContent(q);
  return "imported the bundled posts, projects and homepage copy";
}

/** Records the version of a file copied in, and of the post it made. */
const recordSync = (q, slug, fileHash, postHashValue) =>
  q(
    `insert into bundled_posts (slug, file_hash, post_hash, synced_at)
     values ($1, $2, $3, now())
     on conflict (slug) do update
       set file_hash = excluded.file_hash, post_hash = excluded.post_hash, synced_at = now()`,
    [slug, fileHash, postHashValue]
  );

// post_hash for a post that's left to /admin: no real fingerprint matches it.
const LEFT_TO_ADMIN = "";

/**
 * Brings one bundled post into the database; what happened ("added",
 * "updated" or "left"), or null when there was nothing to do. `tracked` is
 * its bundled_posts row, if it has one (migration 010 explains the columns).
 */
async function syncPost(q, post, tracked) {
  if (tracked?.post_hash === LEFT_TO_ADMIN) return null;
  if (tracked?.post_hash && tracked.file_hash === post.fileHash) return null; // the file hasn't changed

  const { rows } = await q("select * from blog_posts where slug = $1", [post.slug]);
  const row = rows[0];
  if (!row) {
    // Copied in before and deleted in /admin since: it stays deleted.
    if (tracked) {
      await recordSync(q, post.slug, post.fileHash, LEFT_TO_ADMIN);
      return "left";
    }
    const added = await insertPost(q, post);
    await recordSync(q, post.slug, post.fileHash, postHash(added));
    return "added";
  }

  // Is the post still as it was copied in? With a recorded fingerprint,
  // compare with it; without one (a slug the database had before it was
  // tracked), go by whether it has ever been saved in /admin.
  const untouched = tracked?.post_hash
    ? postHash(row) === tracked.post_hash
    : row.updated_at.getTime() === row.created_at.getTime();
  if (!untouched) {
    await recordSync(q, post.slug, post.fileHash, LEFT_TO_ADMIN);
    return "left";
  }
  if (postHash(row) === postHash(post.values)) {
    await recordSync(q, post.slug, post.fileHash, postHash(row));
    return null;
  }
  const { rows: updated } = await q(
    `update blog_posts
     set ${POST_FIELDS.map((field, i) => `${field} = $${i + 2}`).join(", ")}, updated_at = now()
     where slug = $1
     returning *`,
    [post.slug, ...POST_FIELDS.map((field) => post.values[field])]
  );
  await recordSync(q, post.slug, post.fileHash, postHash(updated[0]));
  return "updated";
}

/**
 * The deploy-time sync of the Markdown posts (see deploy.js). The live blog is
 * read from the database, so each production deploy brings it in line with
 * src/content/blog:
 *
 *   - a new file is copied in, once;
 *   - a changed file updates its post, as long as the post hasn't been edited
 *     in /admin since it was copied in;
 *   - a post edited or deleted in /admin is left to /admin from then on: its
 *     file is never copied over it again, and a deleted post isn't re-added.
 *
 * Same transaction and lock as the initial import. Returns what it did, for
 * the log.
 */
export function syncBundledPosts() {
  if (!fs.existsSync(BLOG_DIR)) return Promise.resolve("no blog folder");
  return withClient(async (client) => {
    const q = (text, params) => client.query(text, params);
    await q("begin");
    try {
      await q("select pg_advisory_xact_lock($1)", [MIGRATION_LOCK_ID]);
      const { rows } = await q("select slug, file_hash, post_hash from bundled_posts");
      const tracked = new Map(rows.map((row) => [row.slug, row]));
      const done = { added: [], updated: [], left: [] };
      for (const file of blogFiles()) {
        const post = readBundledPost(file);
        const outcome = await syncPost(q, post, tracked.get(post.slug));
        if (outcome) done[outcome].push(post.slug);
      }
      await q("commit");
      const parts = [
        done.added.length && `added ${done.added.join(", ")}`,
        done.updated.length && `updated ${done.updated.join(", ")}`,
        done.left.length && `left to /admin (edited or deleted there): ${done.left.join(", ")}`,
      ].filter(Boolean);
      return parts.length ? parts.join("; ") : "up to date";
    } catch (err) {
      await q("rollback").catch(() => {});
      throw err;
    }
  });
}

async function run() {
  await runMigrations();
  console.log(`[storage] ${await ensureBucket()}`);
  await importBundledContent();
  console.log("[seed] done");
}

// Run directly (npm run seed): migrate, then import whatever's missing.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await run();
  } catch (err) {
    console.error("[seed] failed:", err.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}
