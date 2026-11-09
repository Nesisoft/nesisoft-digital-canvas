import { query, withClient } from "../db.js";

/**
 * Contact-form submissions (table inquiries, migration 003) and the replies
 * sent to them from /admin (inquiry_replies).
 */

export const STATUSES = ["new", "read", "open", "responded", "closed"];

/** What /admin sees of an inquiry (AdminInquiry in src/lib/adminApi.ts). */
export function toAdminInquiry(row) {
  return {
    _id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    service: row.service,
    budget: row.budget,
    timeline: row.timeline,
    source: row.source,
    message: row.message,
    page: row.page,
    attachment: row.attachment_name
      ? {
          name: row.attachment_name,
          type: row.attachment_type,
          size: row.attachment_size,
          stored: Boolean(row.attachment_path),
        }
      : null,
    // A quote request from the cost calculator: its answers and estimate,
    // and the copy of it emailed to them (sent, or why not).
    estimate: row.estimate ?? null,
    copy:
      row.copy_sent_at || row.copy_error
        ? {
            sentAt: row.copy_sent_at ? row.copy_sent_at.toISOString() : null,
            error: row.copy_error,
            subject: row.copy_subject,
          }
        : null,
    status: row.status,
    notifiedAt: row.notified_at ? row.notified_at.toISOString() : null,
    notifyError: row.notify_error,
    replyCount: Number(row.reply_count ?? 0),
    lastReplyAt: row.last_reply_at ? row.last_reply_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

export function toAdminReply(row) {
  return {
    _id: row.id,
    subject: row.subject,
    body: row.body,
    sentByName: row.sent_by_name,
    createdAt: row.created_at.toISOString(),
  };
}

const WITH_REPLY_STATS = `
  select i.*,
         (select count(*) from inquiry_replies r where r.inquiry_id = i.id) as reply_count,
         (select max(created_at) from inquiry_replies r where r.inquiry_id = i.id) as last_reply_at
    from inquiries i`;

export async function createInquiry(values) {
  const columns = Object.keys(values);
  const { rows } = await query(
    `insert into inquiries (${columns.join(", ")})
     values (${columns.map((_, i) => `$${i + 1}`).join(", ")}) returning *`,
    columns.map((column) => values[column])
  );
  return rows[0];
}

/** Newest first; the admin list is small enough to load whole. */
export async function listInquiries() {
  const { rows } = await query(`${WITH_REPLY_STATS} order by i.created_at desc limit 500`);
  return rows;
}

export async function findInquiry(id) {
  const { rows } = await query(`${WITH_REPLY_STATS} where i.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listReplies(inquiryId) {
  const { rows } = await query(
    "select * from inquiry_replies where inquiry_id = $1 order by created_at",
    [inquiryId]
  );
  return rows;
}

/** Records whether telling the company inbox worked. */
export async function recordNotification(id, error) {
  await query(
    `update inquiries
        set notified_at = case when $2::text is null then now() else notified_at end,
            notify_error = $2
      where id = $1`,
    [id, error ?? null]
  );
}

/** Records the copy of a quote request's estimate emailed to its sender: sent (with its Message-ID), or why not. */
export async function recordCopy(id, { messageId, subject, error }) {
  await query(
    `update inquiries
        set copy_sent_at = case when $2::text is null then now() end,
            copy_error = $2,
            copy_message_id = $3,
            copy_subject = $4
      where id = $1`,
    [id, error ?? null, error ? null : (messageId ?? null), error ? null : subject]
  );
}

/** Opening a new inquiry in /admin marks it read. */
export async function markRead(id) {
  await query(
    "update inquiries set status = 'read', updated_at = now() where id = $1 and status = 'new'",
    [id]
  );
}

export async function setStatus(id, status) {
  const { rowCount } = await query(
    "update inquiries set status = $2, updated_at = now() where id = $1",
    [id, status]
  );
  return rowCount > 0;
}

/** Stores a sent reply and marks the inquiry responded, together. */
export function addReply({ inquiryId, subject, body, sentBy, sentByName, messageId }) {
  return withClient(async (client) => {
    await client.query("begin");
    try {
      const { rows } = await client.query(
        `insert into inquiry_replies (inquiry_id, subject, body, sent_by, sent_by_name, message_id)
         values ($1, $2, $3, $4, $5, $6) returning *`,
        [inquiryId, subject, body, sentBy, sentByName, messageId ?? null]
      );
      await client.query(
        "update inquiries set status = 'responded', updated_at = now() where id = $1",
        [inquiryId]
      );
      await client.query("commit");
      return rows[0];
    } catch (err) {
      await client.query("rollback").catch(() => {});
      throw err;
    }
  });
}

/** Deletes an inquiry (and its replies); returns its stored file's path, if any. */
export async function deleteInquiry(id) {
  const { rows } = await query(
    "delete from inquiries where id = $1 returning attachment_path",
    [id]
  );
  return rows.length ? { attachmentPath: rows[0].attachment_path } : null;
}
