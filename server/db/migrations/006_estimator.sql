-- The app cost calculator (/app-cost-calculator).
--
-- settings: one JSON value per key for site-wide settings edited in /admin.
-- The calculator's price list is key 'estimator' (its shape: shared/
-- estimator.js). Until it's saved, the site uses DEFAULT_ESTIMATOR there.
--
-- inquiries.estimate: for a quote request sent from the calculator, the
-- answers and the estimate as the server worked them out from the price list
-- at the time ({type, size, design, pace, features, low, high, ...}); null
-- for the contact form's messages.

create table settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references users (id) on delete set null,
  updated_at  timestamptz not null default now()
);

alter table settings enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on settings from anon, authenticated;
  end if;
end $$;

alter table inquiries add column estimate jsonb;
