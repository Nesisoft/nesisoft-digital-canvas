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

export type AdminRole = "superadmin" | "admin" | "editor";

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Super admin",
  admin: "Admin",
  editor: "Editor",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  superadmin: "Everything, including managing accounts",
  admin: "All site content: posts, projects, team, homepage",
  editor: "Writes and edits blog posts",
};

/** An admin account, as the API shows it (never the password). */
export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Fired when the API says this browser's session is over (signed out, the
 * account disabled or its password reset) or that a new password is due, so
 * /admin can refetch who's signed in and show the right screen.
 */
export const SESSION_CHANGED_EVENT = "nesisoft:admin-session-changed";

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
  const sessionChanged =
    (res.status === 401 && path !== "/api/admin/login") ||
    (res.status === 403 && (data as { mustChangePassword?: boolean }).mustChangePassword);
  if (sessionChanged && typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  }
  if (!res.ok) {
    const message = (data as { error?: string }).error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

// --- auth ---
export const getMe = () =>
  request<{ authed: boolean; user?: AdminUser }>("/api/admin/me");

export const login = (email: string, password: string) =>
  request<{ ok: true; user: AdminUser }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  request<{ ok: true }>("/api/admin/logout", { method: "POST" });

/** Your own password; needs the current (or temporary) one. */
export const changePassword = (currentPassword: string, newPassword: string) =>
  request<{ ok: true; user: AdminUser }>("/api/admin/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

// --- accounts (super admins) ---
export const listUsers = () => request<AdminUser[]>("/api/admin/users");
export const createUser = (body: {
  email: string;
  name: string;
  role: AdminRole;
  password: string;
}) => request<AdminUser>("/api/admin/users", { method: "POST", body: JSON.stringify(body) });
export const updateUser = (
  id: string,
  body: Partial<Pick<AdminUser, "name" | "role" | "active">>,
) => request<AdminUser>(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
/** Sets a temporary password; its owner must choose a new one at next sign-in. */
export const resetUserPassword = (id: string, password: string) =>
  request<AdminUser>(`/api/admin/users/${id}/password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
export const deleteUser = (id: string) =>
  request<{ ok: true }>(`/api/admin/users/${id}`, { method: "DELETE" });

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

// --- inquiries (the website's contact form; admins and super admins) ---
export type InquiryStatus = "new" | "read" | "open" | "responded" | "closed";

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  open: "Open",
  responded: "Responded",
  closed: "Closed",
};

export interface AdminInquiry {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  source: string;
  message: string;
  page: string;
  /** stored: false when only the notification email carried it. */
  attachment: { name: string; type: string; size: number; stored: boolean } | null;
  status: InquiryStatus;
  notifiedAt: string | null;
  notifyError: string | null;
  replyCount: number;
  lastReplyAt: string | null;
  createdAt: string;
}

export interface AdminInquiryReply {
  _id: string;
  subject: string;
  body: string;
  sentByName: string;
  createdAt: string;
}

export const listInquiries = () =>
  request<{ items: AdminInquiry[]; mailConfigured: boolean }>("/api/admin/inquiries");
/** Opening one marks it read. */
export const getInquiry = (id: string) =>
  request<{ inquiry: AdminInquiry; replies: AdminInquiryReply[]; mailConfigured: boolean }>(
    `/api/admin/inquiries/${id}`
  );
export const setInquiryStatus = (id: string, status: InquiryStatus) =>
  request<AdminInquiry>(`/api/admin/inquiries/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
/** Emails the reply to the person who wrote in and keeps it with the inquiry. */
export const replyToInquiry = (id: string, subject: string, message: string) =>
  request<{ reply: AdminInquiryReply; inquiry: AdminInquiry }>(`/api/admin/inquiries/${id}/replies`, {
    method: "POST",
    body: JSON.stringify({ subject, message }),
  });
export const deleteInquiry = (id: string) =>
  request<{ ok: true }>(`/api/admin/inquiries/${id}`, { method: "DELETE" });
/** Same-origin download link; the session cookie authorises it. */
export const inquiryAttachmentUrl = (id: string) =>
  `${API_BASE}/api/admin/inquiries/${id}/attachment`;
