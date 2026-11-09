-- How each inquiry's sender found the site (server/src/attribution.js),
-- from what their browser noted on their first visit: the channel (campaign,
-- search, ai, social, referral or direct) and the source within it (Google,
-- Facebook, a campaign's utm_source…), the referring host name, the page
-- they landed on, and any campaign tags. Null channel: nothing was noted
-- (sent before this existed, or the browser blocked storage).

alter table inquiries
  add column channel         text,
  add column channel_source  text not null default '',
  add column referrer        text not null default '',
  add column landing_page    text not null default '',
  add column utm_source      text not null default '',
  add column utm_medium      text not null default '',
  add column utm_campaign    text not null default '';

create index inquiries_channel_idx on inquiries (channel);
