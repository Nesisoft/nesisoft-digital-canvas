import "./env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import { connectDB } from "./db.js";
import { BlogPost } from "./models/BlogPost.js";
import { TeamMember } from "./models/TeamMember.js";
import { SiteContent, DEFAULT_CONTENT } from "./models/SiteContent.js";
import { Project } from "./models/Project.js";

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
    const slug = file.replace(/\.md$/, "");
    if (await BlogPost.findOne({ slug })) continue; // idempotent
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    await BlogPost.create({
      slug,
      title: data.title || slug,
      excerpt: data.excerpt || "",
      content: body.trim(),
      image: data.image || "",
      category: data.category || "Uncategorized",
      author: data.author || "Nesisoft Team",
      date: data.date ? new Date(data.date) : new Date(),
      published: true,
    });
    created++;
  }
  console.log(`[seed] blog: imported ${created} new post(s) (${files.length} files seen)`);
}

const PLACEHOLDER_TEAM = [
  {
    name: "Ada Founder",
    role: "Founder & CEO",
    bio: "Sets the vision and keeps the studio pointed at problems worth solving.",
    order: 1,
    socials: { linkedin: "#", twitter: "#", github: "" },
  },
  {
    name: "Kwame Engineer",
    role: "Head of Engineering",
    bio: "Owns delivery and the technical bar across web, mobile, and AI work.",
    order: 2,
    socials: { linkedin: "#", twitter: "", github: "#" },
  },
  {
    name: "Zara Designer",
    role: "Lead Product Designer",
    bio: "Turns rough ideas into interfaces people actually want to use.",
    order: 3,
    socials: { linkedin: "#", twitter: "#", github: "" },
  },
  {
    name: "Tunde Strategist",
    role: "Product Strategist",
    bio: "Bridges business goals and the roadmap so the right things ship first.",
    order: 4,
    socials: { linkedin: "#", twitter: "", github: "" },
  },
];

async function seedTeam() {
  let created = 0;
  for (const member of PLACEHOLDER_TEAM) {
    if (await TeamMember.findOne({ name: member.name })) continue; // idempotent
    await TeamMember.create({ ...member, image: "", published: true });
    created++;
  }
  console.log(`[seed] team: created ${created} placeholder member(s)`);
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
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (await Project.findOne({ slug: p.slug })) continue; // idempotent
    await Project.create({ ...p, order: i, published: true });
    created++;
  }
  console.log(`[seed] projects: imported ${created} new (${projects.length} seen)`);
}

async function seedContent() {
  const existing = await SiteContent.findOne({ key: "main" });
  if (existing) {
    console.log("[seed] content: already present, skipping");
    return;
  }
  await SiteContent.create({ key: "main", ...DEFAULT_CONTENT });
  console.log("[seed] content: created default site content");
}

async function run() {
  await connectDB();
  await seedBlog();
  await seedTeam();
  await seedProjects();
  await seedContent();
  await mongoose.disconnect();
  console.log("[seed] done");
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
