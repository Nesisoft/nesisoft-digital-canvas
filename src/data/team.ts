import type { TeamMember } from "@/lib/api";

/**
 * Team members, bundled with the frontend (no API needed). Shown in `order`,
 * lowest first. Photos go in `public/team/` and are referenced as
 * "/team/<file>" — square, at least 400×400, JPG or WebP. Leave `image` empty
 * to show the person's initials instead. Socials are optional; empty ones
 * are hidden.
 *
 * Example:
 *   {
 *     id: "ama-mensah",
 *     name: "Ama Mensah",
 *     role: "Lead Product Designer",
 *     bio: "Turns rough ideas into interfaces people want to use. Previously at …",
 *     image: "/team/ama-mensah.jpg",
 *     order: 1,
 *     socials: { linkedin: "https://linkedin.com/in/…", twitter: "", github: "" },
 *   },
 */
export const team: TeamMember[] = [];
