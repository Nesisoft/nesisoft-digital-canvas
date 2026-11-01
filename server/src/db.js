import pg from "pg";
import { attachDatabasePool } from "@vercel/functions";

/**
 * PostgreSQL access (Supabase in production). One pool per process, made on
 * first use; serverless instances keep it between requests.
 *
 * Every data route needs DATABASE_URL. Without it (or with one that can't be
 * parsed) they answer 503 at once rather than waiting out a connection
 * timeout, and the public site simply keeps rendering its built-in content.
 */

const DATABASE_URL = process.env.DATABASE_URL || "";

export const databaseConfigured = Boolean(DATABASE_URL);

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]"];

function unavailable(message) {
  const err = new Error(message);
  err.status = 503;
  return err;
}

function poolConfig(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    // Never echo the URL: it holds the database password.
    throw unavailable(
      "DATABASE_URL is not a valid URL (percent-encode special characters such as # / ? @ in the password)"
    );
  }
  // TLS is decided here, not by the URL: recent pg treats sslmode=require as
  // full certificate verification. sslmode=disable (or DATABASE_SSL=false)
  // turns TLS off, e.g. for a plain Postgres on a private network.
  const sslDisabled =
    parsed.searchParams.get("sslmode") === "disable" || process.env.DATABASE_SSL === "false";
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.startsWith("ssl")) parsed.searchParams.delete(key);
  }
  const local = LOCAL_HOSTS.includes(parsed.hostname);

  let ssl = false;
  if (!local && !sslDisabled) {
    // Hosted Postgres (Supabase) requires TLS. Its certificates chain to
    // Supabase's own CA: set DATABASE_CA_CERT to that PEM to verify them;
    // otherwise the connection is still encrypted, just not verified.
    if (process.env.DATABASE_CA_CERT) {
      ssl = { ca: process.env.DATABASE_CA_CERT };
    } else {
      ssl = { rejectUnauthorized: false };
      if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        console.warn(
          "[db] DATABASE_CA_CERT is not set: the database TLS certificate isn't verified."
        );
      }
    }
  }

  return {
    connectionString: parsed.toString(),
    ssl,
    // Each serverless instance holds its own pool, so keep those small and
    // let Supabase's pooler multiplex.
    max: process.env.VERCEL ? 2 : 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: process.env.VERCEL ? 5000 : 10_000,
  };
}

let pool;

export function getPool() {
  if (!databaseConfigured) throw unavailable("Database is not configured (set DATABASE_URL)");
  if (!pool) {
    pool = new pg.Pool(poolConfig(DATABASE_URL));
    // An idle client dropping (say, the pooler restarting) must not crash the
    // process; the pool replaces it on the next query.
    pool.on("error", (err) => console.error("[db]", err.message));
    // Vercel suspends idle instances, and timers don't run while suspended:
    // this closes idle connections before that, instead of leaving them for
    // the pooler to drop under a resumed instance.
    if (process.env.VERCEL) attachDatabasePool(pool);
  }
  return pool;
}

/** Lets one-off scripts (migrate, seed) exit once they're done. */
export async function closePool() {
  await pool?.end();
  pool = undefined;
}

// Can't reach the database, as opposed to a bad query.
const CONNECTION_ERRORS = ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"];

export function isConnectionError(err) {
  if (CONNECTION_ERRORS.includes(err?.code)) return true;
  // Postgres's own errors carry a five-character SQLSTATE: those are about
  // the query, not the connection.
  if (/^[0-9A-Z]{5}$/.test(err?.code ?? "")) return false;
  // pg's "Connection terminated…" / "timeout exceeded when trying to connect".
  return /timeout|terminated/i.test(err?.message ?? "");
}

export async function query(text, params) {
  try {
    return await getPool().query(text, params);
  } catch (err) {
    if (!err.status && isConnectionError(err)) err.status = 503;
    throw err;
  }
}

/**
 * Postgres errors caused by the input rather than the server: invalid text
 * representation, numeric/date out of range, NUL bytes, NOT NULL, values too
 * large for an index. The error handler turns these into a 400.
 */
export const INVALID_INPUT_CODES = ["22P02", "22003", "22007", "22008", "22021", "23502", "54000"];

/**
 * Turns constraint violations into client errors with a readable message;
 * anything else is rethrown untouched. `messages` maps a Postgres error code
 * (23505 unique, 23514 check) to the text the admin should see.
 */
export function rethrowAsClientError(err, messages) {
  const statusByCode = { 23505: 409, 23514: 400 };
  if (messages[err.code] && statusByCode[err.code]) {
    const clientErr = new Error(messages[err.code]);
    clientErr.status = statusByCode[err.code];
    throw clientErr;
  }
  throw err;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ids are UUIDs; anything else can't match a row (and would make Postgres throw). */
export const isId = (value) => UUID.test(String(value));

// Column names only ever come from the fixed field maps in models/, never from
// request keys; this guard keeps it that way.
const COLUMN = /^[a-z_]+$/;

function columnsOf(values) {
  const columns = Object.keys(values);
  for (const column of columns) {
    if (!COLUMN.test(column)) throw new Error(`Invalid column name: ${column}`);
  }
  return columns;
}

/** INSERT the given columns and return the new row. */
export async function insertRow(table, values) {
  const columns = columnsOf(values);
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const { rows } = await query(
    `insert into ${table} (${columns.join(", ")}) values (${placeholders.join(", ")}) returning *`,
    columns.map((column) => values[column])
  );
  return rows[0];
}

/** UPDATE only the given columns (plus updated_at) and return the row, or null. */
export async function updateRow(table, id, values) {
  const columns = columnsOf(values);
  const sets = columns.map((column, i) => `${column} = $${i + 2}`);
  sets.push("updated_at = now()");
  const { rows } = await query(
    `update ${table} set ${sets.join(", ")} where id = $1 returning *`,
    [id, ...columns.map((column) => values[column])]
  );
  return rows[0] ?? null;
}

/** DELETE by id; true when a row went. */
export async function deleteRow(table, id) {
  const { rowCount } = await query(`delete from ${table} where id = $1`, [id]);
  return rowCount > 0;
}
