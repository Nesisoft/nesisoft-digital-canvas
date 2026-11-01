import "./env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { closePool, query } from "./db.js";
import { runMigrations } from "./migrate.js";
import { DEFAULT_CONTENT } from "./models/content.js";
import { PROJECT_COLUMNS } from "./models/projects.js";
import { ensureBucket } from "./storage.js";

/**
 * Fills an empty database from the content the site already ships with: the
 * Markdown posts, src/data/projects.ts and the default homepage copy. Applies
 * pending migrations first and makes sure the image bucket exists (when the
 * Supabase keys are set). Idempotent: anything already there (same slug, or
 * saved homepage copy) is left alone, so it's safe to run again.
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

async function seedBlog() {
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
    const { rowCount } = await query(
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

async function seedProjects() {
  const projects = loadStaticProjects();
  let created = 0;
  for (const [index, project] of projects.entries()) {
    // Same field-to-column map the admin API writes through.
    const values = { slug: project.slug };
    for (const [field, column] of Object.entries(PROJECT_COLUMNS)) {
      if (project[field] !== undefined) values[column] = project[field];
    }
    values.sort_order = index;
    const columns = Object.keys(values);
    const { rowCount } = await query(
      `insert into projects (${columns.join(", ")})
       values (${columns.map((_, i) => `$${i + 1}`).join(", ")})
       on conflict (slug) do nothing`,
      columns.map((column) => values[column])
    );
    created += rowCount;
  }
  console.log(`[seed] projects: imported ${created} new (${projects.length} seen)`);
}

async function seedContent() {
  const { rowCount } = await query(
    `insert into site_content (key, hero, about) values ('main', $1, $2)
     on conflict (key) do nothing`,
    [JSON.stringify(DEFAULT_CONTENT.hero), JSON.stringify(DEFAULT_CONTENT.about)]
  );
  console.log(
    rowCount ? "[seed] content: created default site content" : "[seed] content: already present, skipping"
  );
}

async function run() {
  await runMigrations();
  console.log(`[storage] ${await ensureBucket()}`);
  await seedBlog();
  await seedProjects();
  await seedContent();
  console.log("[seed] done");
}

try {
  await run();
} catch (err) {
  console.error("[seed] failed:", err.message);
  process.exitCode = 1;
} finally {
  await closePool();
}
