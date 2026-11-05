import { platformVercelEnv } from "./env.js";

import { closePool, databaseConfigured, isConnectionError } from "./db.js";
import { runMigrations } from "./migrate.js";
import { importBundledContentOnce } from "./seed.js";
import { ensureBucket } from "./storage.js";

/**
 * Brings the database up to date as part of every production deploy on
 * Vercel: vercel.json's build command is `npm run build && npm run db:deploy`.
 *
 *   1. applies pending migrations (as `npm run db:migrate` does);
 *   2. on a brand-new, empty database, imports the content bundled with the
 *      site, once, so a new site doesn't start out with an empty blog and
 *      project list;
 *   3. makes sure the image bucket exists (a problem there is only a warning).
 *
 * It runs after the site has built, and a database failure fails the build,
 * so the new code doesn't go live against a database it doesn't match:
 * Vercel keeps serving the current deployment.
 *
 * Only production builds run it (promoting a preview to production rebuilds
 * it as one); preview and local builds leave the database alone. It goes by
 * VERCEL_ENV as Vercel sets it, never as a pulled .env file has it, so
 * Vercel's "Automatically expose System Environment Variables" setting must
 * stay on. Set MIGRATE_ON_DEPLOY=false to skip it, e.g. to ship while
 * Supabase is down.
 *
 * The database changes before the new code goes live, and an Instant
 * Rollback doesn't undo that, so the deployment being served can run against
 * the new schema for a while: write migrations it can live with (add tables
 * and columns; rename or drop only in a later deploy).
 */

const log = (message) => console.log(`[deploy] ${message}`);

async function deployDatabase() {
  if (process.env.MIGRATE_ON_DEPLOY === "false") {
    log("MIGRATE_ON_DEPLOY=false: leaving the database as it is");
    return;
  }
  if (platformVercelEnv !== "production") {
    log(
      platformVercelEnv
        ? `a ${platformVercelEnv} build: leaving the database as it is (only production deploys update it)`
        : "VERCEL_ENV isn't set (a local build, or Vercel's \"Automatically expose System " +
            'Environment Variables" setting is off): leaving the database as it is'
    );
    return;
  }
  if (!databaseConfigured) {
    console.warn(
      "[deploy] DATABASE_URL isn't set for Production, so there's no database to update; " +
        "the site will use its built-in content and /admin won't work"
    );
    return;
  }

  await runMigrations();
  log(`initial content: ${await importBundledContentOnce()}`);

  try {
    console.log(`[storage] ${await ensureBucket()}`);
  } catch (err) {
    // Only image uploads in /admin need the bucket: don't hold the deploy back.
    console.warn(`[storage] warning: ${err.message}`);
  }
}

/** What to check, going by how the database update failed. */
function hint(err) {
  const cause = err.cause ?? err;
  const message = String(cause.message);
  if (/tenant or user not found/i.test(message)) {
    return (
      "Supabase doesn't recognise that user or project: copy the Transaction pooler " +
      "connection string again from Connect in the Supabase dashboard " +
      "(user postgres.<project-ref>, host ...pooler.supabase.com, port 6543)."
    );
  }
  if (/password authentication failed|circuit breaker/i.test(message)) {
    return (
      "The database password in DATABASE_URL is wrong. After fixing it, wait a couple of " +
      "minutes before redeploying: Supabase briefly blocks repeated failed logins."
    );
  }
  if (/\bdb\.[a-z0-9]+\.supabase\.co\b/i.test(message)) {
    return (
      "DATABASE_URL is Supabase's direct connection (db.<project-ref>.supabase.co), which " +
      "Vercel can't reach (it's IPv6-only): use the Transaction pooler string " +
      "(...pooler.supabase.com:6543) from Connect in the Supabase dashboard."
    );
  }
  // 57P01-57P03: the server shut the connection, or is still starting up
  // (as a Supabase project does while it's being restored).
  if (isConnectionError(cause) || /^57P0[123]$/.test(cause.code ?? "")) {
    return (
      "Couldn't reach the database. Check that the Supabase project isn't paused (free " +
      "projects pause after about a week without use; restore it from the dashboard) and, " +
      "if Network Restrictions are on, that they allow Vercel's build servers."
    );
  }
  return null;
}

try {
  await deployDatabase();
} catch (err) {
  console.error(`[deploy] database update failed: ${err.message}`);
  const tip = hint(err);
  if (tip) console.error(`[deploy] ${tip}`);
  console.error(
    "[deploy] This deployment was stopped so the new code doesn't go live against a " +
      "database it doesn't match; the current site keeps running. Fix the problem and " +
      "redeploy, or set MIGRATE_ON_DEPLOY=false to deploy without updating the database."
  );
  process.exitCode = 1;
} finally {
  await closePool();
}
