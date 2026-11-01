import "./env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { closePool, getPool } from "./db.js";
import { ensureBucket } from "./storage.js";

/**
 * Applies server/db/migrations/*.sql in name order, each once and inside its
 * own transaction, recording what ran in schema_migrations. Safe to run on
 * every deploy: a transaction-scoped advisory lock keeps two runs from
 * applying the same file, and it works through Supabase's pooler too.
 *
 *   npm run db:migrate
 */

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../db/migrations"
);

// Any fixed number; just has to be the same for every run.
const LOCK_ID = 727_001;

export async function runMigrations(log = console.log) {
  const client = await getPool().connect();
  try {
    // Under the lock too, so two first-ever runs don't race to create it.
    await client.query("begin");
    try {
      await client.query("select pg_advisory_xact_lock($1)", [LOCK_ID]);
      await client.query(`
        create table if not exists schema_migrations (
          name        text primary key,
          applied_at  timestamptz not null default now()
        );
        alter table schema_migrations enable row level security;
        do $$
        begin
          if exists (select 1 from pg_roles where rolname = 'anon') then
            revoke all on schema_migrations from anon, authenticated;
          end if;
        end $$;
      `);
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    let applied = 0;
    for (const file of files) {
      await client.query("begin");
      try {
        await client.query("select pg_advisory_xact_lock($1)", [LOCK_ID]);
        const { rowCount } = await client.query(
          "select 1 from schema_migrations where name = $1",
          [file]
        );
        if (rowCount === 0) {
          await client.query(fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"));
          await client.query("insert into schema_migrations (name) values ($1)", [file]);
          log(`[migrate] applied ${file}`);
          applied++;
        }
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw new Error(`[migrate] ${file} failed: ${err.message}`);
      }
    }
    log(`[migrate] ${applied ? `${applied} applied` : "already up to date"} (${files.length} total)`);
  } finally {
    client.release();
  }
}

// Run directly: migrate the database, then make sure the image bucket exists.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await runMigrations();
    console.log(`[storage] ${await ensureBucket()}`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}
