import { findPublishedPost, listPublishedPosts, toPublicPost } from "../models/posts.js";
import {
  findPublishedProject,
  listPublishedProjects,
  toPublicProject,
} from "../models/projects.js";
import { listPublishedMembers, toPublicMember } from "../models/team.js";
import { getContent } from "../models/content.js";
import { getEstimator } from "../models/estimator.js";
import { asyncRouter } from "./asyncRouter.js";

const router = asyncRouter();

// --- Blog ---
router.get("/posts", async (_req, res) => {
  const posts = await listPublishedPosts();
  res.json(posts.map(toPublicPost));
});

router.get("/posts/:slug", async (req, res) => {
  const post = await findPublishedPost(req.params.slug);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(toPublicPost(post));
});

// --- Projects ---
router.get("/projects", async (_req, res) => {
  const projects = await listPublishedProjects();
  res.json(projects.map(toPublicProject));
});

router.get("/projects/:slug", async (req, res) => {
  const project = await findPublishedProject(req.params.slug);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(toPublicProject(project));
});

// --- Site content (editable marketing copy) ---
router.get("/content", async (_req, res) => {
  res.json(await getContent());
});

// --- The cost calculator's price list ---
router.get("/estimator", async (_req, res) => {
  res.json(await getEstimator());
});

// --- Team ---
router.get("/team", async (_req, res) => {
  const members = await listPublishedMembers();
  res.json(members.map(toPublicMember));
});

// Uploaded images are served by Supabase Storage's CDN (see storage.js), so
// there's no image route here any more.

export default router;
