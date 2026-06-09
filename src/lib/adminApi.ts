/**
 * Authenticated client for the same-origin admin API. Runs from the public
 * site at /admin. Every request sends credentials so the session cookie rides
 * along as a first-party cookie.
 */

import { API_BASE, type SiteContent, type Project } from "./api";

export interface AdminProject extends Project {
  _id: string;
  order: number;
  published: boolean;
}

export interface AdminPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  published: boolean;
}

export interface AdminTeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  order: number;
  socials: { linkedin?: string; twitter?: string; github?: string };
  published: boolean;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string }).error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

// --- auth ---
export const getMe = () =>
  request<{ authed: boolean; username?: string }>("/api/admin/me");

export const login = (username: string, password: string) =>
  request<{ ok: true }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const logout = () =>
  request<{ ok: true }>("/api/admin/logout", { method: "POST" });

// --- images ---
export async function uploadImage(file: File): Promise<{ id: string; url: string }> {
  const fd = new FormData();
  fd.append("image", file);
  return request<{ id: string; url: string }>("/api/admin/images", {
    method: "POST",
    body: fd,
  });
}

// --- posts ---
export const listPosts = () => request<AdminPost[]>("/api/admin/posts");
export const createPost = (body: Partial<AdminPost>) =>
  request<AdminPost>("/api/admin/posts", { method: "POST", body: JSON.stringify(body) });
export const updatePost = (id: string, body: Partial<AdminPost>) =>
  request<AdminPost>(`/api/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deletePost = (id: string) =>
  request<{ ok: true }>(`/api/admin/posts/${id}`, { method: "DELETE" });

// --- projects ---
export const listProjects = () => request<AdminProject[]>("/api/admin/projects");
export const createProject = (body: Partial<AdminProject>) =>
  request<AdminProject>("/api/admin/projects", { method: "POST", body: JSON.stringify(body) });
export const updateProject = (id: string, body: Partial<AdminProject>) =>
  request<AdminProject>(`/api/admin/projects/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteProject = (id: string) =>
  request<{ ok: true }>(`/api/admin/projects/${id}`, { method: "DELETE" });

// --- site content ---
export const getContent = () => request<SiteContent>("/api/admin/content");
export const updateContent = (body: SiteContent) =>
  request<SiteContent>("/api/admin/content", { method: "PUT", body: JSON.stringify(body) });

// --- team ---
export const listTeam = () => request<AdminTeamMember[]>("/api/admin/team");
export const createTeam = (body: Partial<AdminTeamMember>) =>
  request<AdminTeamMember>("/api/admin/team", { method: "POST", body: JSON.stringify(body) });
export const updateTeam = (id: string, body: Partial<AdminTeamMember>) =>
  request<AdminTeamMember>(`/api/admin/team/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteTeam = (id: string) =>
  request<{ ok: true }>(`/api/admin/team/${id}`, { method: "DELETE" });
