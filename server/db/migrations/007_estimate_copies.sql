-- The email sent to whoever sent an inquiry (server/src/visitorEmail.js): a
-- copy of their estimate for a quote request from the cost calculator, and
-- (since then) a confirmation for a contact-form message. When it went out,
-- or why it didn't, and its Message-ID and subject, so replies sent from
-- /admin land in the same email thread.
alter table inquiries
  add column copy_sent_at     timestamptz,
  add column copy_error       text,
  add column copy_message_id  text,
  add column copy_subject     text;
