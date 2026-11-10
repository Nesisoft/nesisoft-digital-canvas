-- Trainingship applications from /trainingships (server/src/routes/
-- trainingships.js), reviewed in /admin → Trainingships. The page's own
-- content is in settings (key "trainingships").
--
-- status: new → reviewing (opened in /admin) → shortlisted → accepted or
-- declined. A CV (PDF or .docx) lives in the private documents bucket under
-- applications/; cv_path is null when it couldn't be stored (it was still
-- emailed to the company inbox). How the applicant found the site is kept
-- as for inquiries (migration 008).

create table trainingship_applications (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null,
  last_name        text not null,
  email            text not null,
  phone            text not null default '',
  track_id         text not null,
  track            text not null,              -- the track's name when they applied
  current_status   text not null,              -- Student, Recent graduate…
  school           text not null default '',   -- school, university or organisation
  links            text not null default '',   -- portfolio, GitHub, LinkedIn: one per line
  motivation       text not null,
  availability     text not null default '',
  intake           text not null default '',   -- the intake open when they applied
  page             text not null default '',
  cv_name          text,
  cv_type          text,
  cv_size          integer,
  cv_path          text,
  status           text not null default 'new'
                   check (status in ('new', 'reviewing', 'shortlisted', 'accepted', 'declined')),
  notes            text not null default '',   -- the team's private notes
  channel          text,
  channel_source   text not null default '',
  referrer         text not null default '',
  landing_page     text not null default '',
  utm_source       text not null default '',
  utm_medium       text not null default '',
  utm_campaign     text not null default '',
  notified_at      timestamptz,
  notify_error     text,
  copy_sent_at     timestamptz,
  copy_error       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index trainingship_applications_created_at_idx on trainingship_applications (created_at desc);
create index trainingship_applications_status_idx on trainingship_applications (status);

alter table trainingship_applications enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on trainingship_applications from anon, authenticated;
  end if;
end $$;
