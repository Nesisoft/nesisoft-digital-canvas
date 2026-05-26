/**
 * Groq-powered blog drafting — used ONLY by the dev-only Blog Studio.
 *
 * SECURITY: VITE_ env vars are embedded in the client bundle, so this key must
 * never ship to production. `generateBlogPost` therefore hard-refuses unless
 * `import.meta.env.DEV` is true, and the request goes through the Vite dev
 * proxy (`/groq-api`, configured in vite.config.ts) which avoids browser CORS
 * issues and keeps the call same-origin. Workflow: run `npm run dev`, draft,
 * download the `.md`, commit it, deploy the static content — not the key.
 */

import { siteConfig } from "@/config/site";

export type BlogLength = "short" | "medium" | "long";

export interface BlogPromptOptions {
  topic: string;
  length: BlogLength;
  category?: string;
  /** Defaults to a professional-yet-approachable voice. */
  tone?: string;
  /** Defaults to African businesses, founders and developers. */
  audience?: string;
}

export interface GeneratedPost {
  title: string;
  excerpt: string;
  /** GitHub-flavored Markdown body (no H1 — the title renders separately). */
  body: string;
}

const LENGTH_WORDS: Record<BlogLength, number> = {
  short: 450,
  medium: 850,
  long: 1500,
};

/**
 * THE PROMPT BUILDER. Turns a few inputs into a structured system+user prompt
 * that yields on-brand, well-formatted Markdown as reliable JSON. Tweak the
 * voice/structure here once and every generated post inherits it.
 */
export function buildBlogPrompt(opts: BlogPromptOptions): {
  system: string;
  user: string;
} {
  const words = LENGTH_WORDS[opts.length];
  const tone = opts.tone?.trim() || "professional yet approachable, concrete and jargon-light";
  const audience =
    opts.audience?.trim() || "African businesses, founders, and developers";

  const system = [
    `You are a senior content writer for ${siteConfig.name}, a full-cycle software development company based in ${siteConfig.contact.location}, serving Africa and beyond.`,
    `Voice: ${tone}. Audience: ${audience}.`,
    `Write substantive, accurate, engaging content. Prefer real examples relevant to African markets. Avoid fluff, clichés, and hallucinated statistics.`,
    `Respond with ONLY a valid JSON object — no markdown fences, no commentary — with exactly these keys:`,
    `  "title": a compelling, specific headline (no markdown).`,
    `  "excerpt": a one-sentence summary, max 160 characters.`,
    `  "body": the article in GitHub-flavored Markdown. Use "##" for section headings (never a top-level "#" — the title is shown separately). Use short paragraphs and bullet lists where they aid clarity. Do not repeat the title inside the body.`,
  ].join("\n");

  const user = [
    `Write a blog post of approximately ${words} words.`,
    `Topic: "${opts.topic}".`,
    opts.category ? `Category: ${opts.category}.` : "",
    `Open with an engaging hook, develop 3–5 clearly-headed sections, and finish with a brief conclusion.`,
  ]
    .filter(Boolean)
    .join(" ");

  return { system, user };
}

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function generateBlogPost(
  opts: BlogPromptOptions
): Promise<GeneratedPost> {
  if (!import.meta.env.DEV) {
    throw new Error("The Blog Studio only runs in local development.");
  }
  if (!GROQ_KEY) {
    throw new Error(
      "Missing VITE_GROQ_API_KEY. Add it to .env.local and restart `npm run dev`."
    );
  }

  const { system, user } = buildBlogPrompt(opts);

  const res = await fetch("/groq-api/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq request failed (${res.status}). ${detail}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");

  let parsed: GeneratedPost;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Could not parse the model's JSON output. Try again.");
  }
  if (!parsed.title || !parsed.body) {
    throw new Error("The generated post is missing a title or body.");
  }
  return parsed;
}

/** kebab-cases a title into a filename-safe slug. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Assembles a ready-to-commit Markdown file (frontmatter + body). */
export function assembleMarkdown(post: {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  author: string;
  image: string;
  date: string;
}): string {
  // Quote values that contain frontmatter-significant characters.
  const fm = (v: string) => (/[:#]/.test(v) ? `"${v.replace(/"/g, "'")}"` : v);
  return [
    "---",
    `title: ${fm(post.title)}`,
    `excerpt: ${fm(post.excerpt)}`,
    `image: ${post.image}`,
    `category: ${fm(post.category)}`,
    `author: ${fm(post.author)}`,
    `date: ${post.date}`,
    "---",
    "",
    post.body.trim(),
    "",
  ].join("\n");
}
