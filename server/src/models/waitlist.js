import { query } from "../db.js";

/** Early-access signups from the platforms' pages (table waitlist_signups, migration 004). */

export function toAdminSignup(row) {
  return {
    _id: row.id,
    platform: { slug: row.platform_slug, name: row.platform_name },
    name: row.name,
    email: row.email,
    role: row.role,
    page: row.page,
    createdAt: row.created_at.toISOString(),
  };
}

/** Adds a signup; signing up twice for the same platform keeps the first. */
export async function addSignup({ projectId, name, email, role, page }) {
  const { rowCount } = await query(
    `insert into waitlist_signups (project_id, name, email, role, page)
     values ($1, $2, $3, $4, $5)
     on conflict (project_id, lower(email)) do nothing`,
    [projectId, name, email, role, page]
  );
  return rowCount > 0;
}

/** Newest first, optionally for one platform (by slug). */
export async function listSignups(platformSlug) {
  const { rows } = await query(
    `select w.*, p.slug as platform_slug, p.name as platform_name
       from waitlist_signups w
       join projects p on p.id = w.project_id
      where $1::text is null or p.slug = $1
      order by w.created_at desc
      limit 5000`,
    [platformSlug ?? null]
  );
  return rows;
}

export async function deleteSignup(id) {
  const { rowCount } = await query("delete from waitlist_signups where id = $1", [id]);
  return rowCount > 0;
}
