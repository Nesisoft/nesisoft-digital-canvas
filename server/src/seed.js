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

async function seedBlog(q) {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("[seed] no blog dir found, skipping posts");
    return;
  }
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  let created = 0;
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, "");
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
    created += rowCount;
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
