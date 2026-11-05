import "./env.js";

import { closePool, databaseConfigured } from "./db.js";
import { runMigrations } from "./migrate.js";
import { importBundledContentOnce } from "./seed.js";
import { ensureBucket } from "./storage.js";

/**
 * Brings the database up to date as part of every production deploy on
 * Vercel: vercel.json's build command is `npm run build && npm run db:deploy`.
 *
 *   1. applies pending migrations (as `npm run db:migrate` does);
 *   2. makes sure the image bucket exists (a problem here is only a warning);
 *   3. on a brand-new, empty database, imports the content bundled with the
 *      site, once (as `npm run seed` does), so the live site never shows an
 *      empty blog or project list.
 *
 * It runs after the site has built, and a database failure fails the build,
 * so new code never goes live against a database it doesn't match: Vercel
 * keeps serving the current deployment. Preview and local builds skip it, so
 * an unmerged branch can't change the production database. Set
 * MIGRATE_ON_DEPLOY=false to skip it, e.g. to ship while Supabase is down.
 *
 * Because the database is updated just before the new code goes live, the
 * current deployment briefly runs against the new schema: write migrations it
 * can live with (add tables and columns; don't rename or drop in the same deploy).
 */

const log = (message) => console.log(`[deploy] ${message}`);

async function deployDatabase() {
  if (process.env.MIGRATE_ON_DEPLOY === "false") {
    log("MIGRATE_ON_DEPLOY=false: leaving the database as it is");
    return;
  }
  if (process.env.VERCEL_ENV !== "production") {
    const kind = process.env.VERCEL_ENV ? `a ${process.env.VERCEL_ENV}` : "a local";
    log(`${kind} build: leaving the database as it is (only production deploys update it)`);
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

  try {
    console.log(`[storage] ${await ensureBucket()}`);
  } catch (err) {
    // Only image uploads in /admin need the bucket: don't hold the deploy back.
    console.warn(`[storage] warning: ${err.message}`);
  }

  log(`initial content: ${await importBundledContentOnce()}`);
}

try {
  await deployDatabase();
} catch (err) {
  console.error(`[deploy] database update failed: ${err.message}`);
  console.error(
    "[deploy] This deployment was stopped so the new code doesn't go live against an " +
      "out-of-date database; the current site keeps running."
  );
  console.error(
    "[deploy] Check that the Supabase project isn't paused and that DATABASE_URL is the " +
      "pooler connection string, then redeploy. To deploy without updating the database, " +
      "set MIGRATE_ON_DEPLOY=false."
  );
  process.exitCode = 1;
} finally {
  await closePool();
}
