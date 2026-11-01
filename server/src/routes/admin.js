import multer from "multer";
import {
  createPost,
  deletePost,
  findPost,
  listPosts,
  toAdminPost,
  updatePost,
} from "../models/posts.js";
import {
  createMember,
  deleteMember,
  findMember,
  listMembers,
  toAdminMember,
  updateMember,
} from "../models/team.js";
import {
  PROJECT_COLUMNS,
  createProject,
  deleteProject,
  findProject,
  listProjects,
  toAdminProject,
  updateProject,
} from "../models/projects.js";
import { getContent, saveContent } from "../models/content.js";
import { databaseConfigured, isId, query } from "../db.js";
import { MAX_IMAGE_BYTES, uploadImage } from "../storage.js";
import {
  adminLoginEnabled,
  checkCredentials,
  isAuthed,
  requireAuthApi,
} from "../auth.js";
import { loginLimiter } from "../loginLimiter.js";
import { detectImageType } from "../imageTypes.js";
import { asyncRouter } from "./asyncRouter.js";

const router = asyncRouter();

// Images held in memory just long enough to hand to Supabase Storage.
// busboy trips its limit on reaching it, so +1 lets exactly 4 MB through.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES + 1, files: 1 },
});

// Long enough for any real title; keeps the slug's unique index happy.
const MAX_SLUG_LENGTH = 200;

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/g, "");
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

/** A JSON date as a Date; a 400 if it doesn't parse or isn't a calendar year. */
function toDate(value) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  if (Number.isNaN(date.getTime()) || year < 1000 || year > 9999) {
    throw badRequest("Invalid date");
  }
  return date;
}

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Text fields take strings (or numbers); anything else is a client mistake. */
function toText(field, value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  throw badRequest(`${field} must be text`);
}

/** "Published" takes a real boolean (or "true"/"false" from a form post). */
function toBool(field, value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw badRequest(`${field} must be true or false`);
}

/** Display order: any finite number (1.5 slots between 1 and 2); else 0. */
function toOrder(value) {
  const order = Number(value);
  return Number.isFinite(order) ? order : 0;
}

// Copies just the listed text fields that were sent (null counts as not sent).
function pickText(body, fields) {
  const values = {};
  for (const field of fields) {
    if (body[field] !== undefined && body[field] !== null) {
      values[field] = toText(field, body[field]);
    }
  }
  return values;
}

// --- Auth ---
router.post("/login", async (req, res) => {
  // Production refuses every sign-in until real credentials are configured.
  if (!adminLoginEnabled) {
    return res.status(503).json({ error: "Admin login is not configured" });
  }
  // req.ip honours app.js's trust proxy setting (the client, not Vercel).
  const client = req.ip || "unknown";
  const waitMs = loginLimiter.consume(client);
  if (waitMs > 0) {
    const minutes = Math.ceil(waitMs / 60000);
    res.set("Retry-After", String(Math.ceil(waitMs / 1000)));
    return res.status(429).json({
      error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    });
  }
  const { username, password } = req.body || {};
  if (!(await checkCredentials(username, password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  loginLimiter.reset(client);
  if (databaseConfigured) {
    // Sessions aren't pruned in the background on serverless; tidy up here.
    await query("delete from session where expire < now()").catch((err) =>
      console.error("[session] prune failed:", err.message)
    );
  }
  // A fresh session id (no fixation), and "ok" only once it's really stored.
  await new Promise((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve()))
  );
  req.session.authed = true;
  req.session.username = username;
  await new Promise((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve()))
  );
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", (req, res) => {
  res.json({ authed: isAuthed(req), username: req.session?.username });
});

// Everything below requires a session.
router.use(requireAuthApi);

// Ids are UUIDs; anything else can't exist, so answer 404 without a query.
router.param("id", (req, res, next, id) => {
  if (!isId(id)) return res.status(404).json({ error: "Not found" });
  next();
});

// --- Image upload ---
router.post("/images", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  // Store the type the bytes prove, not the one the browser claims.
  const contentType = detectImageType(req.file.buffer);
  if (!contentType) {
    return res
      .status(415)
      .json({ error: "Unsupported image type. Upload a JPEG, PNG, WebP, AVIF or GIF." });
  }
  const image = await uploadImage(req.file.buffer, contentType);
  res.status(201).json({ id: image.path, url: image.url });
});

// --- Site content (single editable document) ---
router.get("/content", async (_req, res) => {
  res.json(await getContent());
});

router.put("/content", async (req, res) => {
  const { hero, about } = req.body || {};
  if ((hero !== undefined && !isPlainObject(hero)) || (about !== undefined && !isPlainObject(about))) {
    throw badRequest("hero and about must be objects");
  }
  res.json(await saveContent({ hero, about }));
});

// --- Blog CRUD ---
const POST_TEXT_FIELDS = ["title", "excerpt", "content", "image", "category", "author"];

router.get("/posts", async (_req, res) => {
  const posts = await listPosts();
  res.json(posts.map(toAdminPost));
});

router.get("/posts/:id", async (req, res) => {
  const post = await findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(toAdminPost(post));
});

router.post("/posts", async (req, res) => {
  const body = req.body || {};
  const slug = slugify(toText("slug", body.slug || body.title || ""));
  if (!slug) return res.status(400).json({ error: "Title or slug required" });
  const text = pickText(body, POST_TEXT_FIELDS);
  const post = await createPost({
    slug,
    title: text.title || slug,
    excerpt: text.excerpt || "",
    content: text.content || "",
    image: text.image || "",
    category: text.category || "Uncategorized",
    author: text.author || "Nesisoft Team",
    date: body.date ? toDate(body.date) : new Date(),
    published: body.published === undefined ? true : toBool("published", body.published),
  });
  res.status(201).json(toAdminPost(post));
});

router.put("/posts/:id", async (req, res) => {
  const body = req.body || {};
  // Only patch what was sent.
  const values = pickText(body, POST_TEXT_FIELDS);
  if (body.published !== undefined) values.published = toBool("published", body.published);
  if (body.slug) {
    values.slug = slugify(toText("slug", body.slug));
    if (!values.slug) throw badRequest("Slug must contain letters or numbers");
  }
  if (body.date) values.date = toDate(body.date);

  const post = Object.keys(values).length
    ? await updatePost(req.params.id, values)
    : await findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(toAdminPost(post));
});

router.delete("/posts/:id", async (req, res) => {
  if (!(await deletePost(req.params.id))) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json({ ok: true });
});

// --- Team CRUD ---
function toSocials(socials) {
  const links = isPlainObject(socials) ? socials : {};
  return {
    linkedin: links.linkedin ? toText("socials.linkedin", links.linkedin) : "",
    twitter: links.twitter ? toText("socials.twitter", links.twitter) : "",
    github: links.github ? toText("socials.github", links.github) : "",
  };
}

router.get("/team", async (_req, res) => {
  const members = await listMembers();
  res.json(members.map(toAdminMember));
});

router.get("/team/:id", async (req, res) => {
  const member = await findMember(req.params.id);
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(toAdminMember(member));
});

router.post("/team", async (req, res) => {
  const body = req.body || {};
  const text = pickText(body, ["name", "role", "bio", "image"]);
  if (!text.name?.trim()) return res.status(400).json({ error: "Name required" });
  const member = await createMember({
    name: text.name,
    role: text.role || "",
    bio: text.bio || "",
    image: text.image || "",
    sort_order: toOrder(body.order),
    socials: JSON.stringify(toSocials(body.socials)),
    published: body.published === undefined ? true : toBool("published", body.published),
  });
  res.status(201).json(toAdminMember(member));
});

router.put("/team/:id", async (req, res) => {
  const body = req.body || {};
  const values = pickText(body, ["name", "role", "bio", "image"]);
  if (values.name !== undefined && !values.name.trim()) throw badRequest("Name required");
  if (body.published !== undefined) values.published = toBool("published", body.published);
  if (body.order !== undefined) values.sort_order = toOrder(body.order);
  if (isPlainObject(body.socials)) values.socials = JSON.stringify(toSocials(body.socials));

  const member = Object.keys(values).length
    ? await updateMember(req.params.id, values)
    : await findMember(req.params.id);
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(toAdminMember(member));
});

router.delete("/team/:id", async (req, res) => {
  if (!(await deleteMember(req.params.id))) {
    return res.status(404).json({ error: "Member not found" });
  }
  res.json({ ok: true });
});

// --- Projects CRUD ---
const PROJECT_ARRAY_FIELDS = ["gallery", "technologies", "features"];

function toArray(field, value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(field, item).trim()).filter(Boolean);
}

// Only copy fields that were actually sent. Omitted fields fall back to the
// column defaults on create (important for the `status`/`type` checks) and
// are left untouched on update. Empty strings count as "not sent".
function buildProjectValues(body) {
  const values = {};
  for (const [field, column] of Object.entries(PROJECT_COLUMNS)) {
    const value = body[field];
    if (value === undefined || value === null) continue;
    if (PROJECT_ARRAY_FIELDS.includes(field)) values[column] = toArray(field, value);
    else if (field === "order") values[column] = toOrder(value);
    else if (field === "published") values[column] = toBool(field, value);
    else if (value !== "") values[column] = toText(field, value);
  }
  return values;
}

router.get("/projects", async (_req, res) => {
  const projects = await listProjects();
  res.json(projects.map(toAdminProject));
});

router.get("/projects/:id", async (req, res) => {
  const project = await findProject(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(toAdminProject(project));
});

router.post("/projects", async (req, res) => {
  const body = req.body || {};
  const slug = slugify(toText("slug", body.slug || body.name || ""));
  if (!slug) return res.status(400).json({ error: "Name or slug required" });
  const values = buildProjectValues(body);
  const project = await createProject({ slug, ...values, name: values.name || slug });
  res.status(201).json(toAdminProject(project));
});

router.put("/projects/:id", async (req, res) => {
  const body = req.body || {};
  const values = buildProjectValues(body);
  if (body.slug) {
    values.slug = slugify(toText("slug", body.slug));
    if (!values.slug) throw badRequest("Slug must contain letters or numbers");
  }
  const project = Object.keys(values).length
    ? await updateProject(req.params.id, values)
    : await findProject(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(toAdminProject(project));
});

router.delete("/projects/:id", async (req, res) => {
  if (!(await deleteProject(req.params.id))) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json({ ok: true });
});

export default router;
