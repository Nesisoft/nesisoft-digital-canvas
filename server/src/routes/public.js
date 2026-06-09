import { BlogPost } from "../models/BlogPost.js";
import { TeamMember } from "../models/TeamMember.js";
import { Image } from "../models/Image.js";
import { SiteContent, DEFAULT_CONTENT } from "../models/SiteContent.js";
import { Project, serializeProject } from "../models/Project.js";
import { asyncRouter } from "./asyncRouter.js";

const router = asyncRouter();

function estimateReadTime(body = "") {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function serializePost(doc) {
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    image: doc.image,
    category: doc.category,
    author: doc.author,
    date: doc.date ? doc.date.toISOString() : "",
    readTime: estimateReadTime(doc.content),
  };
}

function serializeMember(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    role: doc.role,
    bio: doc.bio,
    image: doc.image,
    order: doc.order,
    socials: doc.socials || {},
  };
}

// --- Blog ---
router.get("/posts", async (_req, res) => {
  const posts = await BlogPost.find({ published: true }).sort({ date: -1 });
  res.json(posts.map(serializePost));
});

router.get("/posts/:slug", async (req, res) => {
  const post = await BlogPost.findOne({
    slug: req.params.slug,
    published: true,
  });
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(serializePost(post));
});

// --- Projects ---
router.get("/projects", async (_req, res) => {
  const docs = await Project.find({ published: true }).sort({ order: 1, createdAt: 1 });
  res.json(docs.map(serializeProject));
});

router.get("/projects/:slug", async (req, res) => {
  const doc = await Project.findOne({ slug: req.params.slug, published: true });
  if (!doc) return res.status(404).json({ error: "Project not found" });
  res.json(serializeProject(doc));
});

// --- Site content (editable marketing copy) ---
router.get("/content", async (_req, res) => {
  const doc = await SiteContent.findOne({ key: "main" }).lean();
  res.json(doc ? { hero: doc.hero, about: doc.about } : DEFAULT_CONTENT);
});

// --- Team ---
router.get("/team", async (_req, res) => {
  const members = await TeamMember.find({ published: true }).sort({
    order: 1,
    createdAt: 1,
  });
  res.json(members.map(serializeMember));
});

// --- Images (binary served straight from Mongo) ---
router.get("/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });
    res.set("Content-Type", image.contentType);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(image.data);
  } catch {
    res.status(400).json({ error: "Invalid image id" });
  }
});

export default router;
