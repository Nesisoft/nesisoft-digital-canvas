-- Project briefs and messages sent through the website's contact form, and
-- the replies sent to them from /admin.
--
-- status: new (not opened yet) → read → open (being handled) → responded
-- (a reply went out) → closed. Opening one in /admin marks it read; sending
-- a reply marks it responded; the rest is set by hand.
--
-- An attached brief (PDF or .docx) lives in a private Supabase Storage
-- bucket; attachment_path is its object path there, or null when it couldn't
-- be stored (it was still emailed to the company inbox).

create table inquiries (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null,
  last_name        text not null,
  email            text not null,
  phone            text not null default '',
  company          text not null default '',
  service          text not null default '',
  budget           text not null default '',
  timeline         text not null default '',
  source           text not null default '', -- "How did you hear about us?"
  message          text not null,
  page             text not null default '', -- where the form was sent from
  attachment_name  text,
  attachment_type  text,
  attachment_size  integer,
  attachment_path  text,
  status           text not null default 'new'
                   check (status in ('new', 'read', 'open', 'responded', 'closed')),
  notified_at      timestamptz,              -- when the company inbox was emailed
  notify_error     text,                     -- why it wasn't, if it wasn't
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index inquiries_created_at_idx on inquiries (created_at desc);
create index inquiries_status_idx on inquiries (status);

create table inquiry_replies (
  id            uuid primary key default gen_random_uuid(),
  inquiry_id    uuid not null references inquiries (id) on delete cascade,
  subject       text not null,
  body          text not null,
  sent_by       uuid references users (id) on delete set null,
  sent_by_name  text not null default '',
  message_id    text,                        -- the email's Message-ID, for threading
  created_at    timestamptz not null default now()
);
create index inquiry_replies_inquiry_idx on inquiry_replies (inquiry_id, created_at);

alter table inquiries enable row level security;
alter table inquiry_replies enable row level security;

-- As in 001: keep Supabase's Data API roles away from them.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on inquiries, inquiry_replies from anon, authenticated;
  end if;
end $$;
