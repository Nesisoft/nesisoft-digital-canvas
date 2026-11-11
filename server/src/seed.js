import "./env.js";
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
const slugOf = (file) => file.replace(/\.md$/, "");

/** Adds one Markdown post unless its slug is taken; true if it was added. */
async function insertPost(q, file) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, body } = parseFrontmatter(raw);
  const slug = slugOf(file);
  const { rowCount } = await q(
    `insert into blog_posts (slug, title, excerpt, content, image, category, author, date)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (slug) do nothing`,
    [
      slug,
      data.title || slug,
      data.excerpt || "",
      body.trim(),
      data.image || "",
      data.category || "Uncategorized",
      data.author || "Nesisoft Team",
      data.date ? new Date(data.date) : new Date(),
    ]
  );
  return rowCount > 0;
}

async function seedBlog(q) {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("[seed] no blog dir found, skipping posts");
    return;
  }
  const files = blogFiles();
  let created = 0;
  for (const file of files) {
    if (await insertPost(q, file)) created += 1;
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

// The posts bundled before new posts were imported one by one (below). The
// initial import, or the admin, has already dealt with them, so they're never
// imported again: one deleted in /admin stays deleted.
const POSTS_BEFORE_TRACKING = [
  "ai-integration-in-african-business",
  "building-scalable-web-applications",
  "future-of-mobile-app-development-in-africa",
  "progressive-web-apps-for-african-markets",
  "react-native-vs-native-development",
  "rise-of-ecommerce-in-africa",
];

// Recorded in schema_migrations, like INITIAL_CONTENT, once a post is imported.
const postMarker = (slug) => `seed:post:${slug}`;

/**
 * The deploy-time import of new posts (see deploy.js). The live blog is read
 * from the database, so each Markdown post added to src/content/blog is copied
 * in once, by the first production deploy that has it; from then on it's
 * edited (or unpublished, or deleted) in /admin like any other post, and the
 * file is never read again. A post whose slug is already taken in the
 * database is left as it is. Same transaction and lock as the initial import.
 * Returns what it did, for the log.
 */
export function importNewBundledPosts() {
  if (!fs.existsSync(BLOG_DIR)) return Promise.resolve("no blog folder");
  return withClient(async (client) => {
    const q = (text, params) => client.query(text, params);
    await q("begin");
    try {
      await q("select pg_advisory_xact_lock($1)", [MIGRATION_LOCK_ID]);
      const { rows } = await q("select name from schema_migrations where name like 'seed:post:%'");
      const imported = new Set(rows.map((row) => row.name));
      const added = [];
      for (const file of blogFiles()) {
        const slug = slugOf(file);
        if (POSTS_BEFORE_TRACKING.includes(slug) || imported.has(postMarker(slug))) continue;
        if (await insertPost(q, file)) added.push(slug);
        await q("insert into schema_migrations (name) values ($1) on conflict (name) do nothing", [
          postMarker(slug),
        ]);
      }
      await q("commit");
      return added.length ? `imported ${added.length}: ${added.join(", ")}` : "none to import";
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
