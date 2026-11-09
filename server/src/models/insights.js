import { query } from "../db.js";
import { CHANNEL_LABELS } from "../attribution.js";

/**
 * /admin → Insights: what the inquiries say about the site, over the last
 * `days` days (30, 90 or 365) against the period before. Everything comes
 * from our own tables (inquiries, inquiry_replies, waitlist_signups), so it
 * needs no outside service. Visitor numbers are in Vercel Web Analytics.
 */

export const RANGES = [30, 90, 365];

const DAY_MS = 24 * 60 * 60 * 1000;

// (low + high) / 2 of a quote request's estimate, in cedis.
const MIDPOINT = "((estimate->>'low')::numeric + (estimate->>'high')::numeric) / 2";

const ranked = (rows) => rows.map((row) => ({ label: row.label, count: Number(row.count) }));

export async function getInsights(days, now = new Date()) {
  const since = new Date(now.getTime() - days * DAY_MS);
  const prevSince = new Date(now.getTime() - 2 * days * DAY_MS);
  // Weeks up to a quarter; months for a year.
  const bucket = days > 90 ? "month" : "week";
  const inRange = "created_at >= $1";

  // Run one after another: the serverless pool has only two connections.
  const totals = await query(
    `select
       count(*) filter (where created_at >= $1)::int as leads,
       count(*) filter (where created_at >= $1 and estimate is not null)::int as quotes,
       count(*) filter (where created_at < $1)::int as prev_leads,
       count(*) filter (where created_at < $1 and estimate is not null)::int as prev_quotes
     from inquiries where created_at >= $2`,
    [since, prevSince]
  );
  const series = await query(
    `select b.start,
            count(i.id) filter (where i.estimate is not null)::int as quotes,
            count(i.id) filter (where i.estimate is null)::int as messages
       from generate_series(date_trunc($2, $1::timestamptz), date_trunc($2, $3::timestamptz), ('1 ' || $2)::interval) as b(start)
       left join inquiries i on i.created_at >= $1 and date_trunc($2, i.created_at) = b.start
      group by b.start
      order by b.start`,
    [since, bucket, now]
  );
  const channels = await query(
    `select coalesce(channel, 'unknown') as channel, count(*)::int as count
       from inquiries where ${inRange} group by 1 order by 2 desc, 1`,
    [since]
  );
  const sources = await query(
    `select channel, channel_source as label, count(*)::int as count
       from inquiries where ${inRange} and channel is not null and channel_source <> ''
      group by 1, 2 order by 3 desc, 2 limit 8`,
    [since]
  );
  const landing = await query(
    `select landing_page as label, count(*)::int as count
       from inquiries where ${inRange} and landing_page <> ''
      group by 1 order by 2 desc, 1 limit 8`,
    [since]
  );
  const heard = await query(
    `select source as label, count(*)::int as count
       from inquiries where ${inRange} and source <> ''
      group by 1 order by 2 desc, 1 limit 8`,
    [since]
  );
  const types = await query(
    `select estimate->'type'->>'label' as label, count(*)::int as count
       from inquiries where ${inRange} and estimate is not null
      group by 1 order by 2 desc, 1 limit 8`,
    [since]
  );
  const approaches = await query(
    `select coalesce(estimate->'approach'->>'label', 'Not asked') as label, count(*)::int as count
       from inquiries where ${inRange} and estimate is not null
      group by 1 order by 2 desc, 1`,
    [since]
  );
  const features = await query(
    `select f->>'label' as label, count(*)::int as count
       from inquiries i
       cross join lateral jsonb_array_elements(coalesce(i.estimate->'features', '[]'::jsonb)) as f
      where i.created_at >= $1 and i.estimate is not null
      group by 1 order by 2 desc, 1 limit 8`,
    [since]
  );
  const value = await query(
    `select coalesce(sum(${MIDPOINT}), 0)::float as total,
            percentile_cont(0.5) within group (order by ${MIDPOINT})::float as median
       from inquiries where ${inRange} and estimate is not null`,
    [since]
  );
  const services = await query(
    `select service as label, count(*)::int as count
       from inquiries where ${inRange} and estimate is null and service <> ''
      group by 1 order by 2 desc, 1 limit 8`,
    [since]
  );
  const statuses = await query(
    `select status, count(*)::int as count from inquiries where ${inRange} group by 1`,
    [since]
  );
  // The first reply sent from /admin to each inquiry in range.
  const replies = await query(
    `select count(first_reply)::int as replied,
            count(*) filter (where first_reply <= created_at + interval '24 hours')::int as within_day,
            percentile_cont(0.5) within group (order by extract(epoch from first_reply - created_at))::float as median_seconds
       from (select i.created_at,
                    (select min(r.created_at) from inquiry_replies r where r.inquiry_id = i.id) as first_reply
               from inquiries i where i.created_at >= $1) as t`,
    [since]
  );
  // Waiting for a first reply, whenever they arrived: the oldest first.
  const awaiting = await query(
    `select i.id, i.first_name, i.last_name, i.created_at, i.status, i.service,
            i.estimate is not null as is_quote, count(*) over ()::int as total
       from inquiries i
      where i.status in ('new', 'read', 'open')
        and not exists (select 1 from inquiry_replies r where r.inquiry_id = i.id)
      order by i.created_at
      limit 5`
  );
  const waitlist = await query(
    `select p.name as label, count(*)::int as count
       from waitlist_signups w join projects p on p.id = w.project_id
      where w.created_at >= $1
      group by 1 order by 2 desc, 1`,
    [since]
  );

  const t = totals.rows[0];
  const r = replies.rows[0];
  return {
    days,
    since: since.toISOString(),
    bucket,
    totals: {
      leads: t.leads,
      quotes: t.quotes,
      messages: t.leads - t.quotes,
      prevLeads: t.prev_leads,
      prevQuotes: t.prev_quotes,
      prevMessages: t.prev_leads - t.prev_quotes,
    },
    series: series.rows.map((row) => ({ start: row.start.toISOString(), quotes: row.quotes, messages: row.messages })),
    channels: channels.rows.map((row) => ({
      channel: row.channel,
      label: CHANNEL_LABELS[row.channel] ?? "Not recorded",
      count: row.count,
    })),
    sources: sources.rows.map((row) => ({
      channel: row.channel,
      label: row.label,
      group: CHANNEL_LABELS[row.channel] ?? row.channel,
      count: row.count,
    })),
    landingPages: ranked(landing.rows),
    heardVia: ranked(heard.rows),
    quotes: {
      types: ranked(types.rows),
      approaches: ranked(approaches.rows),
      features: ranked(features.rows),
      totalValue: Math.round(value.rows[0].total ?? 0),
      medianValue: value.rows[0].median == null ? null : Math.round(value.rows[0].median),
    },
    services: ranked(services.rows),
    statuses: Object.fromEntries(statuses.rows.map((row) => [row.status, row.count])),
    replies: {
      replied: r.replied,
      withinDay: r.within_day,
      medianHours: r.median_seconds == null ? null : Math.round((r.median_seconds / 3600) * 10) / 10,
    },
    awaiting: {
      count: awaiting.rows[0]?.total ?? 0,
      oldest: awaiting.rows.map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`.trim(),
        createdAt: row.created_at.toISOString(),
        status: row.status,
        topic: row.is_quote ? `Quote request · ${row.service}` : row.service,
      })),
    },
    waitlist: ranked(waitlist.rows),
  };
}
