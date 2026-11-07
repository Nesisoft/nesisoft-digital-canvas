-- Client projects delivered under a non-disclosure agreement. The site shows
-- them with an "Under NDA" badge and a note that the client's name and
-- identifying details are left out.
alter table projects add column nda boolean not null default false;
