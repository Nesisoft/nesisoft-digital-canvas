import { deleteRow, insertRow, query, updateRow } from "../db.js";

/** Team members (table team_members), edited in /admin. */

/** Shape the public API returns (TeamMember in src/lib/api.ts). */
export function toPublicMember(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    image: row.image,
    order: row.sort_order,
    socials: row.socials || {},
  };
}

/** Shape /admin reads (AdminTeamMember in src/lib/adminApi.ts). */
export function toAdminMember(row) {
  return {
    _id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    image: row.image,
    order: row.sort_order,
    socials: row.socials || {},
    published: row.published,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listPublishedMembers() {
  const { rows } = await query(
    "select * from team_members where published order by sort_order, created_at"
  );
  return rows;
}

export async function listMembers() {
  const { rows } = await query("select * from team_members order by sort_order, created_at");
  return rows;
}

export async function findMember(id) {
  const { rows } = await query("select * from team_members where id = $1", [id]);
  return rows[0] ?? null;
}

export const createMember = (values) => insertRow("team_members", values);
export const updateMember = (id, values) => updateRow("team_members", id, values);
export const deleteMember = (id) => deleteRow("team_members", id);
