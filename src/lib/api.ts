/**
 * Client for the Express + MongoDB backend (see `server/`). Blog posts and the
 * team are now managed in the /admin panel and served live from this API.
 *
 * Base URL: empty in dev (Vite proxies "/api" to the server — see vite.config),
 * set via VITE_API_URL for production where the API lives on another origin.
 */

import type { Project } from "@/data/projects";

export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type { Project };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
}

export interface SiteContent {
  hero: { titleLead: string; subtitle: string };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    missionTitle: string;
    missionBody: string;
    whyTitle: string;
    benefits: string[];
    stats: { number: string; label: string }[];
  };
}

/** Mirrors the server's DEFAULT_CONTENT — used as instant, offline-safe data. */
export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    titleLead: "We build software that moves",
    subtitle:
      "Nesisoft is a full-cycle development studio. We design and ship web, mobile and custom software — and build our own platforms like Agoo, Sua, Adesuapa and Jua.",
  },
  about: {
    eyebrow: "About",
    title: "A studio built for Africa's digital growth",
    description:
      "We turn ideas into practical software — tailored to how businesses across Africa actually operate, and built to last.",
    missionTitle: "Our mission",
    missionBody:
      "We help clients innovate, grow and thrive in the digital economy. Beyond delivering software, we create jobs, widen digital inclusion and build lasting economic value on the continent.\n\nThrough ventures like Agoo, Sua, Adesuapa and Jua, we build scalable platforms that solve regional problems — alongside our client work.",
    whyTitle: "Why work with us",
    benefits: [
      "Full-cycle development, from concept to deployment",
      "A senior team with a proven track record",
      "Deep understanding of African markets",
      "Practical solutions to real-world problems",
    ],
    stats: [
      { number: "10+", label: "Projects delivered" },
      { number: "5+", label: "Clients served" },
      { number: "5+", label: "Years building" },
      { number: "2+", label: "Countries served" },
    ],
  },
};

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  order: number;
  socials: { linkedin?: string; twitter?: string; github?: string };
}

/**
 * Resolve an image reference to a fully-qualified URL. Images stored in Mongo
 * come back as relative paths like "/api/images/:id" — prefix those with the
 * API origin. External URLs (http...) are returned untouched.
 */
export function resolveImage(src: string | undefined): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${API_BASE}${src}`;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchPosts(): Promise<BlogPost[]> {
  return getJSON<BlogPost[]>("/api/posts");
}

export function fetchPost(slug: string): Promise<BlogPost> {
  return getJSON<BlogPost>(`/api/posts/${slug}`);
}

export function fetchTeam(): Promise<TeamMember[]> {
  return getJSON<TeamMember[]>("/api/team");
}

export function fetchContent(): Promise<SiteContent> {
  return getJSON<SiteContent>("/api/content");
}

export function fetchProjects(): Promise<Project[]> {
  return getJSON<Project[]>("/api/projects");
}

export function fetchProject(slug: string): Promise<Project> {
  return getJSON<Project>(`/api/projects/${slug}`);
}
