import { deleteRow, insertRow, query, rethrowAsClientError, updateRow } from "../db.js";

/** Blog posts (table blog_posts). Content is GitHub-flavoured Markdown. */

const DUPLICATE = { 23505: "A post with that slug already exists" };

function estimateReadTime(body = "") {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** Shape the public site reads (BlogPost in src/lib/api.ts). */
export function toPublicPost(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    category: row.category,
    author: row.author,
    date: row.date.toISOString(),
    readTime: estimateReadTime(row.content),
  };
}

/** Shape /admin reads (AdminPost in src/lib/adminApi.ts); `_id` keeps its old name. */
export function toAdminPost(row) {
  return {
    _id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    category: row.category,
    author: row.author,
    date: row.date.toISOString(),
    published: row.published,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listPublishedPosts() {
  const { rows } = await query(
    "select * from blog_posts where published order by date desc"
  );
  return rows;
}

export async function findPublishedPost(slug) {
  const { rows } = await query(
    "select * from blog_posts where slug = $1 and published",
    [slug]
  );
  return rows[0] ?? null;
}

export async function listPosts() {
  const { rows } = await query("select * from blog_posts order by date desc");
  return rows;
}

export async function findPost(id) {
  const { rows } = await query("select * from blog_posts where id = $1", [id]);
  return rows[0] ?? null;
}

export function createPost(values) {
  return insertRow("blog_posts", values).catch((err) => rethrowAsClientError(err, DUPLICATE));
}

export function updatePost(id, values) {
  return updateRow("blog_posts", id, values).catch((err) => rethrowAsClientError(err, DUPLICATE));
}

export const deletePost = (id) => deleteRow("blog_posts", id);
