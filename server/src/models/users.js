import { query, withClient } from "../db.js";

/**
 * Admin accounts (table users, migration 002). Every write that could take
 * away a super admin runs in a transaction that locks the active super
 * admins first, so two super admins demoting each other at once can't leave
 * the site with none.
 */

export const ROLES = ["superadmin", "admin", "editor"];

function conflict(message) {
  const err = new Error(message);
  err.status = 409;
  return err;
}

/** What /admin sees of an account: never the password hash. */
export function toAdminUser(row) {
  return {
    _id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    active: row.active,
    mustChangePassword: row.must_change_password,
    createdAt: row.created_at.toISOString(),
    lastLoginAt: row.last_login_at ? row.last_login_at.toISOString() : null,
  };
}

export async function listUsers() {
  const { rows } = await query("select * from users order by created_at");
  return rows;
}

export async function findUserById(id) {
  const { rows } = await query("select * from users where id = $1", [id]);
  return rows[0] ?? null;
}

export async function findUserByEmail(email) {
  const { rows } = await query("select * from users where lower(email) = lower($1)", [email]);
  return rows[0] ?? null;
}

export async function hasActiveSuperadmin() {
  const { rowCount } = await query(
    "select 1 from users where role = 'superadmin' and active limit 1"
  );
  return rowCount > 0;
}

export async function createUser({ email, name, role, passwordHash, mustChangePassword, createdBy }) {
  try {
    const { rows } = await query(
      `insert into users (email, name, role, password_hash, must_change_password, created_by)
       values ($1, $2, $3, $4, $5, $6) returning *`,
      [email, name, role, passwordHash, mustChangePassword, createdBy ?? null]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") throw conflict("An account with that email already exists");
    throw err;
  }
}

/**
 * Sets a new password hash and signs the account out everywhere else (the
 * caller re-signs its own session in if it's the account's owner).
 */
export async function setPassword(id, passwordHash, { mustChange }) {
  const { rows } = await query(
    `update users
        set password_hash = $2, must_change_password = $3,
            session_version = session_version + 1, updated_at = now()
      where id = $1 returning *`,
    [id, passwordHash, mustChange]
  );
  return rows[0] ?? null;
}

export async function recordLogin(id) {
  await query("update users set last_login_at = now() where id = $1", [id]);
}

/**
 * Runs `fn(q, superadminIds)` in a transaction holding row locks on the
 * active super admins, so the "is anyone left?" check can't race.
 */
function withSuperadminsLocked(fn) {
  return withClient(async (client) => {
    const q = (text, params) => client.query(text, params);
    await q("begin");
    try {
      const { rows } = await q(
        "select id from users where role = 'superadmin' and active for update"
      );
      const result = await fn(
        q,
        rows.map((row) => row.id)
      );
      await q("commit");
      return result;
    } catch (err) {
      await q("rollback").catch(() => {});
      throw err;
    }
  });
}

const LAST_SUPERADMIN =
  "There must always be at least one active super admin: make someone else a super admin first";

/**
 * Updates name, role and/or active. Disabling an account signs it out.
 * Returns the row, or null when there's no such account.
 */
export function updateUser(id, changes) {
  return withSuperadminsLocked(async (q, superadmins) => {
    const { rows: current } = await q("select * from users where id = $1", [id]);
    if (!current[0]) return null;
    const user = current[0];
    const role = changes.role ?? user.role;
    const active = changes.active ?? user.active;
    const losesSuperadmin = superadmins.includes(id) && (role !== "superadmin" || !active);
    if (losesSuperadmin && superadmins.length <= 1) throw conflict(LAST_SUPERADMIN);

    const { rows } = await q(
      `update users
          set name = $2, role = $3, active = $4,
              session_version = session_version + (case when $4 then 0 else 1 end),
              updated_at = now()
        where id = $1 returning *`,
      [id, changes.name ?? user.name, role, active]
    );
    return rows[0];
  });
}

/** Deletes an account; false when there's no such account. */
export function deleteUser(id) {
  return withSuperadminsLocked(async (q, superadmins) => {
    if (superadmins.includes(id) && superadmins.length <= 1) throw conflict(LAST_SUPERADMIN);
    const { rowCount } = await q("delete from users where id = $1", [id]);
    return rowCount > 0;
  });
}

/**
 * Makes `email` an active super admin with this password hash, creating the
 * account if needed, but only while there's no active super admin at all.
 * That's how the first account comes from ADMIN_USERNAME/ADMIN_PASSWORD, and
 * how those env vars recover a site that has lost its last super admin.
 * Returns the account, or null when a super admin already exists.
 */
export function bootstrapSuperadmin(email, passwordHash) {
  return withSuperadminsLocked(async (q, superadmins) => {
    if (superadmins.length > 0) return null;
    const { rows } = await q(
      `insert into users (email, name, role, password_hash, must_change_password)
       values ($1, '', 'superadmin', $2, true)
       on conflict (lower(email)) do update
         set role = 'superadmin', active = true, password_hash = excluded.password_hash,
             must_change_password = true, session_version = users.session_version + 1,
             updated_at = now()
       returning *`,
      [email, passwordHash]
    );
    return rows[0];
  });
}
