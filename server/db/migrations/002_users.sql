-- Admin accounts: who can sign in to /admin, and what each may do.
--
--   superadmin  everything, including managing these accounts
--   admin       all site content (posts, projects, team, homepage, images)
--   editor      writes and edits blog posts (and uploads their images)
--
-- Passwords are scrypt hashes (server/src/password.js), never plain text.
-- A super admin hands a new account a temporary password; must_change_password
-- makes its owner pick their own at first sign-in. Raising session_version
-- signs the account out everywhere (password changed or reset, account
-- disabled), because each session remembers the version it started with.

create table users (
  id                    uuid primary key default gen_random_uuid(),
  email                 text not null,
  name                  text not null default '',
  role                  text not null check (role in ('superadmin', 'admin', 'editor')),
  password_hash         text not null,
  must_change_password  boolean not null default true,
  active                boolean not null default true,
  session_version       integer not null default 1,
  created_by            uuid references users (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  last_login_at         timestamptz
);
-- One account per address, whatever its capitalisation.
create unique index users_email_key on users (lower(email));

alter table users enable row level security;

-- As in 001: keep Supabase's Data API roles away from it.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on users from anon, authenticated;
  end if;
end $$;
