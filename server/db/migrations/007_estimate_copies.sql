-- The copy of their estimate emailed to someone who asks for a quote from
-- the cost calculator (server/src/estimateEmail.js): when it went out, or
-- why it didn't, and its Message-ID and subject, so replies sent from
-- /admin land in the same email thread. All null for contact-form messages.
alter table inquiries
  add column copy_sent_at     timestamptz,
  add column copy_error       text,
  add column copy_message_id  text,
  add column copy_subject     text;
