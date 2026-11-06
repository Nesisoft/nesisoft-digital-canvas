-- Product pages for the internal platforms (/platforms/<slug>), and
-- early-access signups from them.
--
-- New project fields (empty for client work): a tagline, a logo, links to
-- the live product and its app-store listings, and the page's sections:
-- audiences (who it's for: [{role, title, description, points[]}]), steps
-- (how it works: [{title, description}]) and faqs ([{question, answer}]).

alter table projects
  add column tagline         text  not null default '',
  add column logo            text  not null default '',
  add column website_url     text  not null default '',
  add column app_store_url   text  not null default '',
  add column play_store_url  text  not null default '',
  add column audiences       jsonb not null default '[]',
  add column steps           jsonb not null default '[]',
  add column faqs            jsonb not null default '[]';

-- Starting copy for Agoo, Sua, Adesuapa and Jua (the same as src/data/
-- projects.ts), only where a field is still empty, so nothing already
-- edited in /admin is overwritten. A database without them is unaffected.

update projects set
  tagline   = case when tagline = '' then 'Errands done by reliable runners.' else tagline end,
  audiences = case when audiences = '[]'::jsonb then '[{"role": "Customer", "title": "For customers", "description": "Hand off the errands that eat into your day.", "points": ["Post an errand and get matched with a runner", "Follow progress with location-aware updates", "Clear pricing and payment for every errand", "Rate your runner when it''s done"]}, {"role": "Runner", "title": "For runners", "description": "Earn by running errands for people nearby.", "points": ["Get started through a guided onboarding", "Get matched with errands near you", "Build trust through customer ratings", "Clear, commission-based earnings"]}]'::jsonb else audiences end,
  steps     = case when steps = '[]'::jsonb then '[{"title": "Post an errand", "description": "Say what needs doing and where."}, {"title": "Get matched", "description": "A runner picks it up through Agoo''s matching."}, {"title": "Follow along", "description": "Updates come in as the errand moves."}, {"title": "Pay and rate", "description": "Settle up and rate your runner."}]'::jsonb else steps end,
  faqs      = case when faqs = '[]'::jsonb then '[{"question": "How do I know I can trust a runner?", "answer": "Runners are onboarded before they can take errands, and every errand ends with a rating, so each runner''s track record is visible."}, {"question": "How do runners earn?", "answer": "Runners earn on each errand they complete. Agoo works on a commission basis, so pricing stays clear for both sides."}, {"question": "Where is Agoo available?", "answer": "Agoo is rolling out location by location. Join the early-access list on this page to hear when it reaches you."}]'::jsonb else faqs end
where slug = 'agoo' and type = 'Internal platform';

update projects set
  tagline   = case when tagline = '' then 'Trusted tutors for your child, at home or online.' else tagline end,
  audiences = case when audiences = '[]'::jsonb then '[{"role": "Parent", "title": "For parents", "description": "Find a qualified teacher you can trust.", "points": ["Browse verified teacher profiles", "Book home or virtual lessons", "Message teachers directly", "Follow your child''s progress"]}, {"role": "Teacher", "title": "For teachers", "description": "A professional way to find students and run your lessons.", "points": ["Get verified and build your profile", "Set your own availability", "Teach in person or in the virtual classroom", "Share progress with parents"]}]'::jsonb else audiences end,
  steps     = case when steps = '[]'::jsonb then '[{"title": "Say what your child needs", "description": "The subject, the level and how you''d like to learn."}, {"title": "Choose a teacher", "description": "Compare verified teacher profiles."}, {"title": "Schedule lessons", "description": "At home or in the virtual classroom."}, {"title": "Track progress", "description": "See how your child is getting on."}]'::jsonb else steps end,
  faqs      = case when faqs = '[]'::jsonb then '[{"question": "Are Sua''s teachers verified?", "answer": "Yes. Teachers are verified before parents can book them."}, {"question": "Can lessons be online?", "answer": "Yes. Lessons can take place at home or in Sua''s virtual classroom."}, {"question": "I''m a teacher. How do I join?", "answer": "Join the early-access list on this page as a teacher, and we''ll take you through verification."}]'::jsonb else faqs end
where slug = 'sua' and type = 'Internal platform';

update projects set
  tagline   = case when tagline = '' then 'Online learning built for Africa, paid for with mobile money.' else tagline end,
  audiences = case when audiences = '[]'::jsonb then '[{"role": "Learner", "title": "For learners", "description": "Learn online and pay the way you already pay.", "points": ["Browse the course catalogue", "Follow a learning path", "Pay with mobile money", "Track your progress"]}, {"role": "Institution", "title": "For institutions", "description": "Bring your courses and learners online.", "points": ["Set up an institutional account", "Manage your course content", "See progress reports across your learners", "Partner with us on course delivery"]}]'::jsonb else audiences end,
  steps     = case when steps = '[]'::jsonb then '[{"title": "Pick a course", "description": "Browse the catalogue."}, {"title": "Pay with mobile money", "description": "Enrol in a few taps."}, {"title": "Follow your path", "description": "Work through the course step by step."}, {"title": "Track your progress", "description": "See how far you''ve come."}]'::jsonb else steps end,
  faqs      = case when faqs = '[]'::jsonb then '[{"question": "How do I pay for a course?", "answer": "With mobile money, at checkout."}, {"question": "Can my school or organisation use Adesuapa?", "answer": "Yes. Institutional accounts let schools and organisations run courses for their learners, with progress reporting. Get in touch to partner with us."}]'::jsonb else faqs end
where slug = 'adesuapa' and type = 'Internal platform';

update projects set
  tagline   = case when tagline = '' then 'Buy in installments and trade business to business.' else tagline end,
  audiences = case when audiences = '[]'::jsonb then '[{"role": "Buyer", "title": "For buyers", "description": "Get what you need without paying it all upfront.", "points": ["Discover products from suppliers", "Pay in installments", "Send business-to-business enquiries", "Track your orders"]}, {"role": "Supplier", "title": "For suppliers", "description": "Reach more buyers and keep payments in order.", "points": ["Open a supplier account", "List your products", "Answer B2B enquiries", "Manage orders and reconciled payments"]}]'::jsonb else audiences end,
  steps     = case when steps = '[]'::jsonb then '[{"title": "Find a product", "description": "Browse listings from suppliers."}, {"title": "Choose how to pay", "description": "In full, or in installments."}, {"title": "Place your order", "description": "Or send the supplier an enquiry."}, {"title": "Track it", "description": "Follow your order and payments."}]'::jsonb else steps end,
  faqs      = case when faqs = '[]'::jsonb then '[{"question": "How will installment payments work?", "answer": "You''ll choose to pay in installments when you buy. Join the early-access list for the details as Jua gets closer to launch."}, {"question": "Can my business sell on Jua?", "answer": "Yes. Supplier accounts let businesses list products, answer B2B enquiries and manage orders. Join the early-access list as a supplier."}]'::jsonb else faqs end
where slug = 'jua' and type = 'Internal platform';

-- "Get early access" signups from a platform's page. One per email per
-- platform; `role` is the audience they picked (e.g. "Runner").
create table waitlist_signups (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects (id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default '',
  page        text not null default '',
  created_at  timestamptz not null default now()
);
create unique index waitlist_signups_project_email_key on waitlist_signups (project_id, lower(email));
create index waitlist_signups_created_at_idx on waitlist_signups (created_at desc);

alter table waitlist_signups enable row level security;

-- As in 001: keep Supabase's Data API roles away from it.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on waitlist_signups from anon, authenticated;
  end if;
end $$;
