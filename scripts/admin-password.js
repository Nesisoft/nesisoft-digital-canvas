import "../server/src/env.js";
import { closePool, databaseConfigured, query } from "../server/src/db.js";
import { runMigrations } from "../server/src/migrate.js";
import { hashPassword, passwordProblem } from "../server/src/password.js";
import { fail, readNewPassword } from "./lib/password-input.js";

/**
 * Sets an admin account's password from the command line, for when nobody
 * can sign in to /admin to reset it:
 *
 *   npm run admin:password -- you@example.com      # prompts twice, no echo
 *
 * The account keeps its role, is re-enabled and signed out everywhere, and
 * can sign in with the new password straight away. An email with no account
 * becomes a new super admin. Uses DATABASE_URL (from .env.local), so it
 * changes whichever database that points at.
 */

const ROLE_LABELS = { superadmin: "Super admin", admin: "Admin", editor: "Editor" };

const [email, ...extra] = process.argv.slice(2);
if (!email || extra.length || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fail(
    "Usage: npm run admin:password -- <email>\n" +
      "Type the new password when prompted, or pipe it on stdin.",
  );
}
if (!databaseConfigured) {
  fail("DATABASE_URL isn't set: put the database's connection string in .env.local.");
}

const password = await readNewPassword(
  `New password for ${email}: `,
  "Repeat it: ",
  "Nothing was changed.",
);
const problem = passwordProblem(password, email);
if (problem) fail(`${problem}. Nothing was changed.`);

try {
  await runMigrations(() => {});
  const { rows } = await query(
    `insert into users (email, name, role, password_hash, must_change_password)
     values ($1, '', 'superadmin', $2, false)
     on conflict (lower(email)) do update
       set password_hash = excluded.password_hash, active = true,
           must_change_password = false, session_version = users.session_version + 1,
           updated_at = now()
     returning email, role, (xmax = 0) as created`,
    [email, await hashPassword(password)],
  );
  const user = rows[0];
  console.error(
    user.created
      ? `Created ${user.email} as a super admin. Sign in to /admin with that password.`
      : `Password set for ${user.email} (${ROLE_LABELS[user.role]}). The account is ` +
          "enabled, signed out everywhere, and can sign in with the new password now.",
  );
} catch (err) {
  fail(`Couldn't set the password: ${err.message}`);
} finally {
  await closePool();
}
