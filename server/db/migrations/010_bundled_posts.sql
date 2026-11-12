-- The Markdown posts bundled with the site (src/content/blog) that the
-- database has taken in, and the version of each it last copied. Production
-- deploys (syncBundledPosts in server/src/seed.js) use it to copy in new
-- posts and changes to existing files, but never over a post edited in
-- /admin since it was copied in, and never to bring back one deleted there.
--
--   file_hash  md5 of the file as last copied in; null until known.
--   post_hash  postHash() in seed.js of the post as it was copied in, to tell
--              whether /admin has changed it since. '' means the post is left
--              to /admin (edited or deleted there); null means not known yet,
--              which the next deploy works out.

create table bundled_posts (
  slug       text primary key,
  file_hash  text,
  post_hash  text,
  synced_at  timestamptz not null default now()
);

alter table bundled_posts enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on bundled_posts from anon, authenticated;
  end if;
end $$;

-- The posts this database has already taken in, as they were when it did:
-- the six from the initial import, and the five copied in one by one by the
-- deploy that first had them (each marked in schema_migrations). A post that
-- has gone since was deleted in /admin, so it's left to /admin. Nothing is
-- recorded for posts this database never took in: a brand-new database gets
-- them from the initial import, and the next deploy records them.
--
-- (The seed:post:* markers stay in schema_migrations, so a rolled-back
-- deployment still sees those posts as imported.)
with taken_in (slug, post_hash, marker) as (
  values
    ('ai-integration-in-african-business', 'beb42a8470d82b95c5c4f7b207dfa9b2', 'seed:initial-content'),
    ('building-scalable-web-applications', '1cd0ffffdb6c3314c35d720d45379992', 'seed:initial-content'),
    ('future-of-mobile-app-development-in-africa', '5e358e218c91072af667761214ca4587', 'seed:initial-content'),
    ('progressive-web-apps-for-african-markets', '3da68e64b232dc200f97f46840e5a0a9', 'seed:initial-content'),
    ('react-native-vs-native-development', '22ec376abbd2030c4e7ebb9390ef5bef', 'seed:initial-content'),
    ('rise-of-ecommerce-in-africa', '0da2dd634849e773bf557e573a060ea1', 'seed:initial-content'),
    ('accept-mobile-money-payments-ghana', 'ce2fc690528654a27dffacd9a95f5261', 'seed:post:accept-mobile-money-payments-ghana'),
    ('ai-assisted-development-budget-and-timeline', 'c99156626430c334a0744149e6eee7e5', 'seed:post:ai-assisted-development-budget-and-timeline'),
    ('how-much-does-it-cost-to-build-an-app-in-ghana', 'ffd3a255e6c631cbce6ee404fd3a570c', 'seed:post:how-much-does-it-cost-to-build-an-app-in-ghana'),
    ('school-management-software-ghana', '35e1294a1c0b27b64c4f96017d18cde8', 'seed:post:school-management-software-ghana'),
    ('website-web-app-or-mobile-app', 'ecf2c1718f9d47869a90b32dde853707', 'seed:post:website-web-app-or-mobile-app')
)
insert into bundled_posts (slug, post_hash)
select t.slug,
       case when exists (select 1 from blog_posts b where b.slug = t.slug) then t.post_hash else '' end
from taken_in t
where exists (select 1 from schema_migrations m where m.name = t.marker);
