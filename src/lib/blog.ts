/**
 * File-based blog CMS. Each post is a Markdown file in `src/content/blog/`
 * with a small frontmatter block. New post = new `.md` file (drop one in and
 * it appears) — no code changes, no database. The AI Blog Studio (dev-only)
 * produces files in exactly this shape.
 *
 * Frontmatter keys: title, excerpt, image, category, author, date (ISO).
 * The slug is the filename; readTime is computed from word count.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Raw GitHub-flavored Markdown body. */
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
}

/** Minimal frontmatter parser — avoids pulling in Node-only `gray-matter`. */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Strip matching surrounding quotes if present.
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

function estimateReadTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

// Eagerly load every Markdown file as a raw string at build time.
const files = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const posts: BlogPost[] = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data, body } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title ?? slug,
      excerpt: data.excerpt ?? "",
      content: body.trim(),
      image: data.image ?? "",
      category: data.category ?? "Uncategorized",
      author: data.author ?? "Nesisoft Team",
      date: data.date ?? "",
      readTime: estimateReadTime(body),
    };
  })
  // Newest first.
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string | undefined): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * "15 Jan 2025". A fixed locale and UTC (ISO dates parse as UTC midnight), so
 * the prerendered HTML and every visitor's browser show the same day.
 */
export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getCategories(): string[] {
  return ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
}
