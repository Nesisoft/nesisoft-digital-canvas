-- Initial schema: the content the /admin panel edits, plus admin sessions.
--
-- Row level security is enabled on every table with no policies. The API
-- connects as the table owner, which bypasses RLS, but Supabase also exposes
-- the public schema through its REST Data API — with RLS on and no policies,
-- that API can't read or write any of this. On Supabase, the API roles also
-- lose their table privileges (see the end of this file).

create table blog_posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  excerpt     text not null default '',
  content     text not null default '', -- GitHub-flavoured Markdown
  image       text not null default '', -- absolute URL (Supabase Storage or external)
  category    text not null default 'Uncategorized',
  author      text not null default 'Nesisoft Team',
  date        timestamptz not null default now(),
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index blog_posts_published_date_idx on blog_posts (published, date desc);

create table projects (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  category          text not null default '',
  type              text not null default 'Client work'
                    check (type in ('Internal platform', 'Client work')),
  description       text not null default '',
  full_description  text not null default '',
  image             text not null default '',
  gallery           text[] not null default '{}',
  technologies      text[] not null default '{}',
  features          text[] not null default '{}',
  timeline          text not null default '',
  team_size         text not null default '',
  status            text not null default 'In development'
                    check (status in ('Completed', 'In development', 'Beta testing')),
  challenge         text not null default '',
  solution          text not null default '',
  result            text not null default '',
  sort_order        double precision not null default 0, -- lower = shown first; 1.5 slots between 1 and 2
  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index projects_published_order_idx on projects (published, sort_order, created_at);

create table team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null default '',
  bio         text not null default '',
  image       text not null default '',
  sort_order  double precision not null default 0, -- lower = shown first; 1.5 slots between 1 and 2
  socials     jsonb not null default '{}'::jsonb, -- { linkedin, twitter, github }
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Editable marketing copy: one row per key ("main" today).
create table site_content (
  key         text primary key,
  hero        jsonb not null,
  about       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Admin sessions, in the layout connect-pg-simple expects.
create table "session" (
  sid     varchar not null primary key,
  sess    json not null,
  expire  timestamp(6) not null
);
create index session_expire_idx on "session" (expire);

alter table blog_posts enable row level security;
alter table projects enable row level security;
alter table team_members enable row level security;
alter table site_content enable row level security;
alter table "session" enable row level security;

-- Supabase grants its Data API roles (anon, authenticated) privileges on new
-- public tables by default. Nothing here is meant for them, so take those
-- away too. Plain Postgres has no such roles, so this only runs on Supabase.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on blog_posts, projects, team_members, site_content, "session"
      from anon, authenticated;
  end if;
end $$;
