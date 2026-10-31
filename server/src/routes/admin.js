import multer from "multer";
import { BlogPost } from "../models/BlogPost.js";
import { TeamMember } from "../models/TeamMember.js";
import { Image } from "../models/Image.js";
import { SiteContent, DEFAULT_CONTENT } from "../models/SiteContent.js";
import { Project } from "../models/Project.js";
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

// Images held in memory just long enough to persist into Mongo.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  req.session.authed = true;
  req.session.username = username;
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
  const image = await Image.create({
    filename: req.file.originalname,
    contentType,
    data: req.file.buffer,
    size: req.file.size,
  });
  res.status(201).json({ id: image._id.toString(), url: `/api/images/${image._id}` });
});

// --- Site content (single editable document) ---
router.get("/content", async (_req, res) => {
  const doc = await SiteContent.findOne({ key: "main" }).lean();
  res.json(doc ? { hero: doc.hero, about: doc.about } : DEFAULT_CONTENT);
});

router.put("/content", async (req, res) => {
  const { hero, about } = req.body || {};
  const doc = await SiteContent.findOneAndUpdate(
    { key: "main" },
    { $set: { hero, about } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  res.json({ hero: doc.hero, about: doc.about });
});

// --- Blog CRUD ---
router.get("/posts", async (_req, res) => {
  const posts = await BlogPost.find().sort({ date: -1 });
  res.json(posts);
});

router.get("/posts/:id", async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

router.post("/posts", async (req, res) => {
  const body = req.body || {};
  const slug = slugify(body.slug || body.title || "");
  if (!slug) return res.status(400).json({ error: "Title or slug required" });
  if (await BlogPost.findOne({ slug })) {
    return res.status(409).json({ error: "A post with that slug already exists" });
  }
  const post = await BlogPost.create({
    slug,
    title: body.title || slug,
    excerpt: body.excerpt || "",
    content: body.content || "",
    image: body.image || "",
    category: body.category || "Uncategorized",
    author: body.author || "Nesisoft Team",
    date: body.date ? new Date(body.date) : new Date(),
    published: body.published !== false,
  });
  res.status(201).json(post);
});

router.put("/posts/:id", async (req, res) => {
  const body = req.body || {};
  const update = {
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    image: body.image,
    category: body.category,
    author: body.author,
    published: body.published,
  };
  if (body.slug) update.slug = slugify(body.slug);
  if (body.date) update.date = new Date(body.date);
  // Drop undefined keys so we only patch what was sent.
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const post = await BlogPost.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

router.delete("/posts/:id", async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ ok: true });
});

// --- Team CRUD ---
router.get("/team", async (_req, res) => {
  const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
  res.json(members);
});

router.get("/team/:id", async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

router.post("/team", async (req, res) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: "Name required" });
  const member = await TeamMember.create({
    name: body.name,
    role: body.role || "",
    bio: body.bio || "",
    image: body.image || "",
    order: Number(body.order) || 0,
    socials: {
      linkedin: body.socials?.linkedin || "",
      twitter: body.socials?.twitter || "",
      github: body.socials?.github || "",
    },
    published: body.published !== false,
  });
  res.status(201).json(member);
});

router.put("/team/:id", async (req, res) => {
  const body = req.body || {};
  const update = {
    name: body.name,
    role: body.role,
    bio: body.bio,
    image: body.image,
    published: body.published,
  };
  if (body.order !== undefined) update.order = Number(body.order) || 0;
  if (body.socials) {
    update.socials = {
      linkedin: body.socials.linkedin || "",
      twitter: body.socials.twitter || "",
      github: body.socials.github || "",
    };
  }
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const member = await TeamMember.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

router.delete("/team/:id", async (req, res) => {
  const member = await TeamMember.findByIdAndDelete(req.params.id);
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json({ ok: true });
});

// --- Projects CRUD ---
const PROJECT_STRING_FIELDS = [
  "name", "category", "type", "description", "fullDescription", "image",
  "timeline", "teamSize", "status", "challenge", "solution", "result",
];
const PROJECT_ARRAY_FIELDS = ["gallery", "technologies", "features"];

function toArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return [];
}

// Only copy fields that were actually sent. Omitted fields fall back to the
// schema defaults on create (important for the `status`/`type` enums) and are
// left untouched on update.
function buildProjectUpdate(body) {
  const update = {};
  for (const key of PROJECT_STRING_FIELDS) {
    if (body[key] !== undefined && body[key] !== "") update[key] = body[key];
  }
  for (const key of PROJECT_ARRAY_FIELDS) {
    if (body[key] !== undefined) update[key] = toArray(body[key]);
  }
  if (body.order !== undefined) update.order = Number(body.order) || 0;
  if (body.published !== undefined) update.published = body.published !== false;
  return update;
}

router.get("/projects", async (_req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: 1 });
  res.json(projects);
});

router.get("/projects/:id", async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

router.post("/projects", async (req, res) => {
  const body = req.body || {};
  const slug = slugify(body.slug || body.name || "");
  if (!slug) return res.status(400).json({ error: "Name or slug required" });
  if (await Project.findOne({ slug })) {
    return res.status(409).json({ error: "A project with that slug already exists" });
  }
  const project = await Project.create({
    slug,
    name: body.name || slug,
    ...buildProjectUpdate(body),
  });
  res.status(201).json(project);
});

router.put("/projects/:id", async (req, res) => {
  const body = req.body || {};
  const update = buildProjectUpdate(body);
  if (body.slug) update.slug = slugify(body.slug);
  const project = await Project.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

router.delete("/projects/:id", async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ ok: true });
});

export default router;
