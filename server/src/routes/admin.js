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
import { getEstimator, saveEstimator } from "../models/estimator.js";
import {
  ROLES,
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  recordLogin,
  setPassword,
  toAdminUser,
  updateUser,
} from "../models/users.js";
import {
  STATUSES as INQUIRY_STATUSES,
  addReply,
  deleteInquiry,
  findInquiry,
  listInquiries,
  listReplies,
  markRead,
  setStatus as setInquiryStatus,
  toAdminInquiry,
  toAdminReply,
} from "../models/inquiries.js";
import { deleteSignup, listSignups, toAdminSignup } from "../models/waitlist.js";
import { databaseConfigured, isId, query } from "../db.js";
import { MAX_IMAGE_BYTES, deleteDocument, downloadDocument, uploadImage } from "../storage.js";
import { mailConfigured, sendMail } from "../mailer.js";
import { replyEmail } from "../inquiryMail.js";
import {
  adminLoginEnabled,
  allow,
  authenticate,
  currentAdmin,
  passwordMatches,
  requireAdmin,
  requirePasswordChosen,
  signIn,
} from "../auth.js";
import { hashPassword, passwordProblem } from "../password.js";
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
  // Production refuses every sign-in until a real SESSION_SECRET is set, and
  // accounts live in the database.
  if (!adminLoginEnabled) {
    return res.status(503).json({ error: "Admin login is not configured" });
  }
  if (!databaseConfigured) {
    return res.status(503).json({ error: "Admin login needs the database (DATABASE_URL)" });
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
  // "email" from the current UI; "username" from older clients.
  const { email = req.body?.username, password } = req.body || {};
  const user = await authenticate(email, password);
  if (!user) {
    return res.status(401).json({ error: "Wrong email or password" });
  }
  loginLimiter.reset(client);
  // Sessions aren't pruned in the background on serverless; tidy up here.
  await query("delete from session where expire < now()").catch((err) =>
    console.error("[session] prune failed:", err.message)
  );
  await signIn(req, user);
  await recordLogin(user.id);
  res.json({ ok: true, user: toAdminUser(user) });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", async (req, res) => {
  const user = await currentAdmin(req);
  res.json(user ? { authed: true, user: toAdminUser(user) } : { authed: false });
});

// Everything below needs a signed-in account (req.admin).
router.use(requireAdmin);

// Your own password: needs the current one (even a temporary one). Other
// sessions of the account are signed out; this one stays signed in.
router.post("/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!(await passwordMatches(req.admin, currentPassword))) {
    return res.status(400).json({ error: "Your current password is wrong" });
  }
  const problem = passwordProblem(newPassword, req.admin.email);
  if (problem) return res.status(400).json({ error: problem });
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: "Choose a password different from the current one" });
  }
  const user = await setPassword(req.admin.id, await hashPassword(newPassword), {
    mustChange: false,
  });
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  await signIn(req, user);
  res.json({ ok: true, user: toAdminUser(user) });
});

// Someone holding a temporary password can't do anything else yet.
router.use(requirePasswordChosen);

// What each role may reach. Editors write blog posts (and upload their
// images) but don't delete them; admins manage all content; super admins
// also manage accounts.
const CONTENT_ROLES = ["superadmin", "admin"];
router.use(["/content", "/team", "/projects", "/estimator"], allow(...CONTENT_ROLES));
router.use("/posts", (req, res, next) =>
  req.method === "DELETE" ? allow(...CONTENT_ROLES)(req, res, next) : next()
);
router.use("/users", allow("superadmin"));
// Contact-form inquiries hold people's details: admins and super admins only.
router.use("/inquiries", allow(...CONTENT_ROLES));
// Early-access signups (names and emails): admins and super admins only.
router.use("/waitlist", allow(...CONTENT_ROLES));

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

// --- The cost calculator's price list (Pricing tab) ---
router.get("/estimator", async (_req, res) => {
  res.json(await getEstimator());
});

router.put("/estimator", async (req, res) => {
  res.json(await saveEstimator(req.body, req.admin.id));
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

// Product-page fields (internal platforms). These can be cleared: an empty
// string means "none", unlike the case-study text fields.
const PROJECT_LINK_FIELDS = ["logo", "websiteUrl", "appStoreUrl", "playStoreUrl"];
const PROJECT_ITEM_SPECS = {
  // field: max items; per key, max length, or [max entries, max length] for a list
  audiences: { max: 4, keys: { role: 40, title: 80, description: 300, points: [8, 200] } },
  steps: { max: 6, keys: { title: 80, description: 300 } },
  faqs: { max: 12, keys: { question: 200, answer: 1500 } },
};

/** A link: https:// (or, for the logo, a file on this site), or "" for none. */
function toLink(field, value) {
  const link = toText(field, value).trim();
  if (link.length > 500) throw badRequest(`${field} is too long`);
  const ok = !link || /^https?:\/\/\S+$/i.test(link) || (field === "logo" && /^\/[^/]/.test(link));
  if (!ok) throw badRequest(`${field} must be a link starting with https://`);
  return link;
}

/** A list of small objects (audiences, steps, FAQs), checked and trimmed; empty rows dropped. */
function toItems(field, value, { max, keys }) {
  if (!Array.isArray(value)) throw badRequest(`${field} must be a list`);
  const items = value.map((item, i) => {
    if (!isPlainObject(item)) throw badRequest(`${field}[${i}] must be an object`);
    const out = {};
    for (const [key, limit] of Object.entries(keys)) {
      if (Array.isArray(limit)) {
        const [maxEntries, maxLength] = limit;
        const list = item[key] ?? [];
        if (!Array.isArray(list)) throw badRequest(`${field}[${i}].${key} must be a list`);
        out[key] = list.map((entry) => toText(`${field}.${key}`, entry).trim()).filter(Boolean);
        if (out[key].length > maxEntries) throw badRequest(`${field}: at most ${maxEntries} ${key} each`);
        if (out[key].some((entry) => entry.length > maxLength)) throw badRequest(`${field}: a ${key} entry is too long`);
      } else {
        out[key] = toText(`${field}.${key}`, item[key] ?? "").trim();
        if (out[key].length > limit) throw badRequest(`${field}: ${key} is too long`);
      }
    }
    return out;
  });
  const kept = items.filter((item) => Object.values(item).some((v) => (Array.isArray(v) ? v.length : v)));
  if (kept.length > max) throw badRequest(`${field}: at most ${max}`);
  return kept;
}

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
    else if (PROJECT_ITEM_SPECS[field]) {
      values[column] = JSON.stringify(toItems(field, value, PROJECT_ITEM_SPECS[field]));
    } else if (PROJECT_LINK_FIELDS.includes(field)) values[column] = toLink(field, value);
    else if (field === "tagline") {
      values[column] = toText(field, value).trim();
      if (values[column].length > 160) throw badRequest("The tagline is too long");
    } else if (field === "order") values[column] = toOrder(value);
    else if (field === "published" || field === "nda") values[column] = toBool(field, value);
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

// --- Accounts (super admins only; see the guards above) ---
// Changing your own role, disabling or deleting yourself is refused, so
// nobody locks themselves out by accident; your own password goes through
// POST /password.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toEmail(value) {
  const email = toText("email", value ?? "").trim();
  if (!EMAIL.test(email) || email.length > 254) throw badRequest("Enter a valid email address");
  return email;
}

function toRole(value) {
  if (!ROLES.includes(value)) throw badRequest(`Role must be one of: ${ROLES.join(", ")}`);
  return value;
}

function toName(value) {
  const name = toText("name", value).trim();
  if (name.length > 120) throw badRequest("Name is too long");
  return name;
}

function notYourself(req) {
  if (req.params.id === req.admin.id) {
    const err = new Error(
      "You can't change your own role, disable or delete yourself: ask another super admin"
    );
    err.status = 409;
    throw err;
  }
}

router.get("/users", async (_req, res) => {
  res.json((await listUsers()).map(toAdminUser));
});

// New accounts get a temporary password their owner must replace at first
// sign-in.
router.post("/users", async (req, res) => {
  const body = req.body || {};
  const email = toEmail(body.email);
  const problem = passwordProblem(body.password, email);
  if (problem) throw badRequest(problem);
  const user = await createUser({
    email,
    name: body.name == null ? "" : toName(body.name),
    role: toRole(body.role),
    passwordHash: await hashPassword(body.password),
    mustChangePassword: true,
    createdBy: req.admin.id,
  });
  res.status(201).json(toAdminUser(user));
});

router.put("/users/:id", async (req, res) => {
  const body = req.body || {};
  const changes = {};
  if (body.name != null) changes.name = toName(body.name);
  if (body.role != null) changes.role = toRole(body.role);
  if (body.active != null) changes.active = toBool("active", body.active);
  if (changes.role !== undefined || changes.active !== undefined) notYourself(req);
  const user = Object.keys(changes).length
    ? await updateUser(req.params.id, changes)
    : await findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "Account not found" });
  res.json(toAdminUser(user));
});

// A new temporary password: signs the account out and makes its owner choose
// a new one at next sign-in.
router.post("/users/:id/password", async (req, res) => {
  notYourself(req);
  const existing = await findUserById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Account not found" });
  const problem = passwordProblem(req.body?.password, existing.email);
  if (problem) throw badRequest(problem);
  const user = await setPassword(existing.id, await hashPassword(req.body.password), {
    mustChange: true,
  });
  if (!user) return res.status(404).json({ error: "Account not found" });
  res.json(toAdminUser(user));
});

router.delete("/users/:id", async (req, res) => {
  notYourself(req);
  if (!(await deleteUser(req.params.id))) {
    return res.status(404).json({ error: "Account not found" });
  }
  res.json({ ok: true });
});

// --- Early-access signups (the platforms' pages) ---

// A platform's slug (it also names the CSV file), or null for all.
const platformFilter = (value) =>
  typeof value === "string" && /^[a-z0-9-]{1,200}$/.test(value) ? value : null;

router.get("/waitlist", async (req, res) => {
  res.json({ items: (await listSignups(platformFilter(req.query.platform))).map(toAdminSignup) });
});

/**
 * A spreadsheet-safe CSV cell: quoted, with quotes doubled, and a leading
 * = + - @ neutralised so the file can't run a formula when opened.
 */
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

router.get("/waitlist/export.csv", async (req, res) => {
  const slug = platformFilter(req.query.platform);
  const rows = await listSignups(slug);
  const lines = [
    ["Platform", "Name", "Email", "Role", "Signed up"],
    ...rows.map((r) => [r.platform_name, r.name, r.email, r.role, r.created_at.toISOString()]),
  ].map((cells) => cells.map(csvCell).join(","));
  const day = new Date().toISOString().slice(0, 10);
  res.set({
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="waitlist-${slug ?? "all"}-${day}.csv"`.replace(/[^\x20-\x7e]/g, "_"),
    "Cache-Control": "private, no-store",
  });
  // A byte-order mark so Excel reads the names as UTF-8.
  res.send(`\ufeff${lines.join("\r\n")}\r\n`);
});

router.delete("/waitlist/:id", async (req, res) => {
  if (!(await deleteSignup(req.params.id))) return res.status(404).json({ error: "Signup not found" });
  res.json({ ok: true });
});

// --- Inquiries (the website's contact form) ---

const notFoundInquiry = (res) => res.status(404).json({ error: "Inquiry not found" });

/** A download header that keeps any file name (RFC 6266), with a plain fallback. */
function attachmentDisposition(name) {
  const fallback = name.replace(/[^\x20-\x7e]|["\\]/g, "_");
  // RFC 5987 also wants ' ( ) * escaped, which encodeURIComponent leaves.
  const encoded = encodeURIComponent(name).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

router.get("/inquiries", async (_req, res) => {
  res.json({ items: (await listInquiries()).map(toAdminInquiry), mailConfigured });
});

// Opening one marks it read.
router.get("/inquiries/:id", async (req, res) => {
  let inquiry = await findInquiry(req.params.id);
  if (!inquiry) return notFoundInquiry(res);
  if (inquiry.status === "new") {
    await markRead(inquiry.id);
    inquiry = { ...inquiry, status: "read" };
  }
  const replies = await listReplies(inquiry.id);
  res.json({ inquiry: toAdminInquiry(inquiry), replies: replies.map(toAdminReply), mailConfigured });
});

router.put("/inquiries/:id", async (req, res) => {
  const status = req.body?.status;
  if (!INQUIRY_STATUSES.includes(status)) {
    throw badRequest(`Status must be one of: ${INQUIRY_STATUSES.join(", ")}`);
  }
  if (!(await setInquiryStatus(req.params.id, status))) return notFoundInquiry(res);
  res.json(toAdminInquiry(await findInquiry(req.params.id)));
});

// The attached brief, from the private bucket, as a download.
router.get("/inquiries/:id/attachment", async (req, res) => {
  const inquiry = await findInquiry(req.params.id);
  if (!inquiry) return notFoundInquiry(res);
  const file = inquiry.attachment_path ? await downloadDocument(inquiry.attachment_path) : null;
  if (!file) {
    return res.status(404).json({
      error: inquiry.notify_error
        ? "This file couldn't be stored or emailed. Ask the sender to send it again."
        : "This file wasn't stored. It was attached to the email sent to the company inbox.",
    });
  }
  res.set({
    "Content-Type": inquiry.attachment_type,
    "Content-Disposition": attachmentDisposition(inquiry.attachment_name),
    "Cache-Control": "private, no-store",
  });
  res.send(file);
});

// Emails a reply to the person who wrote in, from the company address, and
// keeps it with the inquiry (which becomes "responded").
router.post("/inquiries/:id/replies", async (req, res) => {
  const inquiry = await findInquiry(req.params.id);
  if (!inquiry) return notFoundInquiry(res);
  const body = req.body || {};
  const subject = toText("subject", body.subject ?? "").trim();
  const message = toText("message", body.message ?? "").trim();
  if (!subject) throw badRequest("Add a subject");
  if (subject.length > 200) throw badRequest("The subject is too long");
  if (!message) throw badRequest("Write a reply first");
  if (message.length > 10_000) throw badRequest("The reply is too long");

  const earlier = await listReplies(inquiry.id);
  const info = await sendMail(
    replyEmail({
      inquiry,
      subject,
      body: message,
      signedBy: req.admin.name,
      // The estimate copy they were sent (if any) starts the thread.
      previousMessageIds: [inquiry.copy_message_id, ...earlier.map((reply) => reply.message_id)].filter(Boolean),
    })
  );
  const reply = await addReply({
    inquiryId: inquiry.id,
    subject,
    body: message,
    sentBy: req.admin.id,
    sentByName: req.admin.name || req.admin.email,
    messageId: info.messageId,
  });
  res.status(201).json({
    reply: toAdminReply(reply),
    inquiry: toAdminInquiry(await findInquiry(inquiry.id)),
  });
});

router.delete("/inquiries/:id", async (req, res) => {
  const deleted = await deleteInquiry(req.params.id);
  if (!deleted) return notFoundInquiry(res);
  if (deleted.attachmentPath) {
    await deleteDocument(deleted.attachmentPath).catch((err) =>
      console.error("[inquiries] deleting the stored file failed:", err.message)
    );
  }
  res.json({ ok: true });
});

export default router;
