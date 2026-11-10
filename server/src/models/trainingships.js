import { query } from "../db.js";
import { describeChannel } from "../attribution.js";
import { APPLICATION_STATUSES, DEFAULT_TRAININGSHIPS } from "../../../shared/trainingships.js";

/**
 * Trainingships: the page's content (settings, key "trainingships") and the
 * applications sent from it (table trainingship_applications, migration 009).
 */

const KEY = "trainingships";

/* ---------------- The page's content ---------------- */

/** The saved content, with anything added since it was saved filled in from the defaults. */
export async function getTrainingships() {
  const { rows } = await query("select value from settings where key = $1", [KEY]);
  return { ...DEFAULT_TRAININGSHIPS, ...(rows[0]?.value ?? {}) };
}

export async function saveTrainingships(input, userId) {
  const value = cleanTrainingships(input);
  await query(
    `insert into settings (key, value, updated_by) values ($1, $2, $3)
     on conflict (key) do update
       set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
    [KEY, JSON.stringify(value), userId ?? null]
  );
  return value;
}

function invalid(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function text(value, name, max, required = false) {
  if (typeof value !== "string") throw invalid(`${name} must be text`);
  const clean = value.trim();
  if (required && !clean) throw invalid(`${name} is required`);
  if (clean.length > max) throw invalid(`${name} must be at most ${max} characters`);
  return clean;
}

function list(value, name, max) {
  if (!Array.isArray(value)) throw invalid(`${name} must be a list`);
  if (value.length > max) throw invalid(`${name}: at most ${max}`);
  return value;
}

const ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** The page's content as submitted from /admin, checked field by field; unknown keys are dropped. */
export function cleanTrainingships(input) {
  if (!isObject(input)) throw invalid("Send the whole page");
  if (typeof input.open !== "boolean") throw invalid("Say whether applications are open");

  const seen = new Set();
  const tracks = list(input.tracks, "Tracks", 8).map((track, i) => {
    if (!isObject(track)) throw invalid(`Track ${i + 1} must be an object`);
    if (typeof track.id !== "string" || !ID.test(track.id)) throw invalid(`Track ${i + 1}: id must be lowercase letters, digits and dashes`);
    if (seen.has(track.id)) throw invalid(`Tracks: "${track.id}" is used twice`);
    seen.add(track.id);
    return {
      id: track.id,
      name: text(track.name, `Track ${i + 1}: name`, 60, true),
      description: text(track.description ?? "", `Track ${i + 1}: description`, 240),
    };
  });
  if (input.open && tracks.length === 0) throw invalid("Add at least one track before opening applications");

  return {
    open: input.open,
    intake: text(input.intake ?? "", "Intake", 80),
    deadline: text(input.deadline ?? "", "Deadline", 80),
    duration: text(input.duration ?? "", "Duration", 80),
    format: text(input.format ?? "", "Format", 80),
    commitment: text(input.commitment ?? "", "Time commitment", 80),
    intro: text(input.intro ?? "", "Introduction", 1500),
    tracks,
    highlights: list(input.highlights, "What you'll do", 8).map((h, i) => {
      if (!isObject(h)) throw invalid(`Highlight ${i + 1} must be an object`);
      return {
        title: text(h.title, `Highlight ${i + 1}: title`, 80, true),
        description: text(h.description ?? "", `Highlight ${i + 1}: description`, 240),
      };
    }),
    requirements: list(input.requirements, "Who can apply", 10)
      .map((r, i) => text(r, `Requirement ${i + 1}`, 240))
      .filter(Boolean),
    faqs: list(input.faqs, "Questions", 12).map((f, i) => {
      if (!isObject(f)) throw invalid(`Question ${i + 1} must be an object`);
      return {
        question: text(f.question, `Question ${i + 1}`, 160, true),
        answer: text(f.answer, `Answer ${i + 1}`, 800, true),
      };
    }),
    closedMessage: text(input.closedMessage ?? "", "Message when closed", 400),
  };
}

/* ---------------- Applications ---------------- */

export { APPLICATION_STATUSES };

/** What /admin sees of an application (AdminApplication in src/lib/adminApi.ts). */
export function toAdminApplication(row) {
  return {
    _id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    trackId: row.track_id,
    track: row.track,
    currentStatus: row.current_status,
    school: row.school,
    links: row.links ? row.links.split("\n") : [],
    motivation: row.motivation,
    availability: row.availability,
    intake: row.intake,
    page: row.page,
    cv: row.cv_name
      ? { name: row.cv_name, type: row.cv_type, size: row.cv_size, stored: Boolean(row.cv_path) }
      : null,
    status: row.status,
    notes: row.notes,
    foundVia: row.channel
      ? {
          label: describeChannel(row.channel, row.channel_source),
          landingPage: row.landing_page,
          campaign: [row.utm_source, row.utm_medium, row.utm_campaign].filter(Boolean).join(" / "),
        }
      : null,
    notifyError: row.notify_error,
    copy: row.copy_sent_at || row.copy_error
      ? { sentAt: row.copy_sent_at ? row.copy_sent_at.toISOString() : null, error: row.copy_error }
      : null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createApplication(values) {
  const columns = Object.keys(values);
  const { rows } = await query(
    `insert into trainingship_applications (${columns.join(", ")})
     values (${columns.map((_, i) => `$${i + 1}`).join(", ")}) returning *`,
    columns.map((column) => values[column])
  );
  return rows[0];
}

export async function listApplications() {
  const { rows } = await query("select * from trainingship_applications order by created_at desc limit 1000");
  return rows;
}

export async function findApplication(id) {
  const { rows } = await query("select * from trainingship_applications where id = $1", [id]);
  return rows[0] ?? null;
}

/** Opening a new application in /admin moves it to "reviewing". */
export async function markReviewing(id) {
  await query(
    "update trainingship_applications set status = 'reviewing', updated_at = now() where id = $1 and status = 'new'",
    [id]
  );
}

/** Changes the status and/or the team's notes. */
export async function updateApplication(id, { status, notes }) {
  const { rows } = await query(
    `update trainingship_applications
        set status = coalesce($2, status), notes = coalesce($3, notes), updated_at = now()
      where id = $1 returning *`,
    [id, status ?? null, notes ?? null]
  );
  return rows[0] ?? null;
}

export async function recordApplicationEmails(id, { notifyError, copyError }) {
  await query(
    `update trainingship_applications
        set notified_at = case when $2::text is null then now() end, notify_error = $2,
            copy_sent_at = case when $3::text is null then now() end, copy_error = $3
      where id = $1`,
    [id, notifyError ?? null, copyError ?? null]
  );
}

/** Deletes an application; returns its stored CV's path, if any. */
export async function deleteApplication(id) {
  const { rows } = await query("delete from trainingship_applications where id = $1 returning cv_path", [id]);
  return rows.length ? { cvPath: rows[0].cv_path } : null;
}
