import { useState, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, ExternalLink, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@shared/estimator.js";
import {
  INQUIRY_STATUS_LABELS,
  getInsights,
  type InquiryStatus,
  type InsightRange,
  type Insights,
  type RankedRow,
} from "@/lib/adminApi";
import { StatusBadge } from "./InquiryDetail";

// Two series in the leads chart, validated for the dark admin surface
// (lightness band, CVD separation, contrast): violet, then amber.
const QUOTES = "#8b5cf6";
const MESSAGES = "#c98500";
// One hue for ranked bars (magnitude by category).
const BAR = "#8b5cf6";

const RANGES: { days: InsightRange; label: string }[] = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
];

const STATUS_ORDER: InquiryStatus[] = ["new", "read", "open", "responded", "closed"];

const DAY_MS = 24 * 60 * 60 * 1000;

/** 1,284 / 42K / 1.2M: big numbers as stat-tile values. */
function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  return formatNumber(n);
}

/** "today", "3 days ago", "4 months ago". */
function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (days < 1) return "today";
  if (days < 60) return `${days} day${days === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function hours(h: number | null) {
  if (h == null) return "–";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${h.toFixed(h < 10 ? 1 : 0)} hours`;
  return `${Math.round(h / 24)} days`;
}

/** A clean top for the y-axis, close above the tallest column: 2, 4, 6, 8, 10, 12, 16, 20… */
function niceTop(max: number) {
  const steps = [2, 4, 6, 8, 10, 12, 16, 20, 24, 30, 40, 50, 60, 80, 100];
  return steps.find((s) => s >= max) ?? Math.ceil(max / 50) * 50;
}

function Card({ title, hint, children, className }: { title: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-white/10 bg-white/[0.02] p-5", className)}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A KPI: label, value, and how it compares with the period before. */
function StatTile({
  label,
  value,
  current,
  previous,
  periodLabel,
  note,
}: {
  label: string;
  value: string;
  current?: number;
  previous?: number;
  periodLabel?: string;
  note?: string;
}) {
  let delta: ReactNode = null;
  if (current !== undefined && previous !== undefined && periodLabel) {
    if (previous === 0) {
      delta = <span className="text-slate-500">none in the previous {periodLabel}</span>;
    } else {
      const change = Math.round(((current - previous) / previous) * 100);
      const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
      delta = (
        <>
          <span
            className={cn(
              "inline-flex items-center font-medium",
              change > 0 ? "text-emerald-300" : change < 0 ? "text-rose-300" : "text-slate-400"
            )}
          >
            <Icon aria-hidden className="h-3.5 w-3.5" />
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          <span className="block text-slate-500">vs previous {periodLabel}</span>
        </>
      );
    }
  }
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {(delta || note) && <p className="mt-1.5 text-xs leading-5">{delta ?? <span className="text-slate-500">{note}</span>}</p>}
      {delta && note && <p className="text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  );
}

/** Name, bar and count per row, largest first (or in the order given), on one scale. */
function RankedBars({ rows, empty, share }: { rows: RankedRow[]; empty: string; share?: boolean }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-200" title={row.label}>
              {row.label}
            </span>
            <span className="shrink-0 tabular-nums text-slate-400">
              <span className="font-medium text-slate-100">{row.count}</span>
              {share && total > 0 && <span> · {Math.round((row.count / total) * 100)}%</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2">
            {row.count > 0 && (
              <div className="h-full rounded-r-[4px]" style={{ width: `${(row.count / max) * 100}%`, background: BAR }} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
      {[
        [QUOTES, "Quote requests"],
        [MESSAGES, "Contact messages"],
      ].map(([color, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-[2px]" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

/** Leads per week (or month): quote requests and contact messages, stacked. */
function LeadsChart({ series, bucket }: { series: Insights["series"]; bucket: Insights["bucket"] }) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const top = niceTop(Math.max(1, ...series.map((s) => s.quotes + s.messages)));
  const ticks = top % 2 === 0 ? [0, top / 2, top] : [0, top];
  const name = (iso: string) =>
    new Date(iso).toLocaleDateString(
      "en-GB",
      bucket === "week" ? { day: "numeric", month: "short", timeZone: "UTC" } : { month: "short", year: "numeric", timeZone: "UTC" }
    );
  const title = (iso: string) => (bucket === "week" ? `Week of ${name(iso)}` : name(iso));
  const labelEvery = Math.ceil(series.length / 7);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Legend />
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="text-xs font-medium text-violet-300 hover:text-white"
        >
          {asTable ? "Show chart" : "Show as table"}
        </button>
      </div>

      {asTable ? (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="py-1.5 font-medium">{bucket === "week" ? "Week of" : "Month"}</th>
              <th className="py-1.5 text-right font-medium">Quote requests</th>
              <th className="py-1.5 text-right font-medium">Contact messages</th>
              <th className="py-1.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 tabular-nums text-slate-200">
            {series.map((s) => (
              <tr key={s.start}>
                <td className="py-1.5">{name(s.start)}</td>
                <td className="py-1.5 text-right">{s.quotes}</td>
                <td className="py-1.5 text-right">{s.messages}</td>
                <td className="py-1.5 text-right font-medium text-white">{s.quotes + s.messages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <div className="relative mt-5 h-52 pl-8">
            {ticks.map((tick) => (
              <div
                key={tick}
                aria-hidden
                className="absolute left-8 right-0 border-t border-white/[0.07]"
                style={{ bottom: `${(tick / top) * 100}%` }}
              >
                <span className="absolute -left-8 w-6 -translate-y-1/2 text-right text-[11px] tabular-nums text-slate-500">
                  {tick}
                </span>
              </div>
            ))}
            <div className="absolute inset-y-0 left-8 right-0 flex items-end">
              {series.map((s, i) => {
                const total = s.quotes + s.messages;
                const height = (total / top) * 100;
                return (
                  <button
                    key={s.start}
                    type="button"
                    className="group relative flex h-full flex-1 items-end justify-center px-[3px] focus-visible:outline-none"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${title(s.start)}: ${s.quotes} quote requests, ${s.messages} contact messages`}
                  >
                    <span
                      className={cn(
                        "flex w-full max-w-[24px] flex-col-reverse gap-[2px] transition-[filter]",
                        active === i && "brightness-125",
                        "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-violet-300"
                      )}
                      style={{ height: `${height}%` }}
                    >
                      {s.quotes > 0 && (
                        <span
                          className={cn("block min-h-[2px]", s.messages === 0 && "rounded-t-[4px]")}
                          style={{ flexGrow: s.quotes, background: QUOTES }}
                        />
                      )}
                      {s.messages > 0 && (
                        <span className="block min-h-[2px] rounded-t-[4px]" style={{ flexGrow: s.messages, background: MESSAGES }} />
                      )}
                    </span>
                    {active === i && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute z-10 w-max -translate-x-1/2 rounded-lg border border-white/10 bg-[#18181b] px-3 py-2 text-left shadow-xl shadow-black/40"
                        style={{ bottom: `calc(${height}% + 10px)`, left: "50%" }}
                      >
                        <span className="block text-xs text-slate-400">{title(s.start)}</span>
                        {[
                          [QUOTES, s.quotes, "quote requests"],
                          [MESSAGES, s.messages, "contact messages"],
                        ].map(([color, count, label]) => (
                          <span key={label as string} className="mt-1 flex items-center gap-2 text-xs">
                            <span aria-hidden className="h-[2px] w-3" style={{ background: color as string }} />
                            <span className="font-semibold tabular-nums text-white">{count}</span>
                            <span className="text-slate-400">{label}</span>
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div aria-hidden className="mt-2 flex pl-8 text-[11px] text-slate-500">
            {series.map((s, i) => (
              <span key={s.start} className="flex-1 truncate text-center">
                {i % labelEvery === 0 || i === series.length - 1 ? name(s.start) : ""}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * /admin → Insights: what the inquiries say over 30 days, 90 days or 12
 * months: how many came in and how, what people ask for, and how fast we
 * answer. Visitor numbers live in Vercel Web Analytics.
 */
export function InsightsPanel({ onOpenInquiry }: { onOpenInquiry: (id: string) => void }) {
  const [days, setDays] = useState<InsightRange>(90);
  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["admin", "insights", days],
    queryFn: () => getInsights(days),
    placeholderData: keepPreviousData,
  });
  const periodLabel = RANGES.find((r) => r.days === days)?.label ?? `${days} days`;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* One row of filters above everything it scopes. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <BarChart3 aria-hidden className="h-5 w-5 text-violet-300" /> Insights
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            From your inquiries. For visitor numbers, open{" "}
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-violet-300 hover:text-white"
            >
              Vercel Analytics <ExternalLink aria-hidden className="h-3 w-3" />
            </a>
            .
          </p>
        </div>
        <div role="group" aria-label="Period" className="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              aria-pressed={days === range.days}
              onClick={() => setDays(range.days)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                days === range.days ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading insights…</p>}
      {isError && !data && <p className="text-sm text-rose-300">Couldn't load insights.</p>}

      {data && (
        <div className={cn("space-y-5 transition-opacity", isPlaceholderData && "opacity-60")}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <StatTile
              label="Leads"
              value={formatNumber(data.totals.leads)}
              current={data.totals.leads}
              previous={data.totals.prevLeads}
              periodLabel={periodLabel}
            />
            <StatTile
              label="Quote requests"
              value={formatNumber(data.totals.quotes)}
              current={data.totals.quotes}
              previous={data.totals.prevQuotes}
              periodLabel={periodLabel}
            />
            <StatTile
              label="Contact messages"
              value={formatNumber(data.totals.messages)}
              current={data.totals.messages}
              previous={data.totals.prevMessages}
              periodLabel={periodLabel}
            />
            <StatTile
              label="Value of quote requests"
              value={`GH₵${compact(data.quotes.totalValue)}`}
              note={
                data.quotes.medianValue != null
                  ? `Median GH₵${formatNumber(data.quotes.medianValue)} each, mid-estimate`
                  : "No quote requests yet"
              }
            />
            <StatTile
              label="Median first reply"
              value={hours(data.replies.medianHours)}
              note={
                data.replies.replied
                  ? `${data.replies.withinDay} of ${data.replies.replied} answered within 24 hours`
                  : "No replies sent from admin yet"
              }
            />
            <StatTile
              label="Waiting for a reply"
              value={formatNumber(data.awaiting.count)}
              note={data.awaiting.oldest[0] ? `Oldest arrived ${ago(data.awaiting.oldest[0].createdAt)}` : "All caught up"}
            />
          </div>

          <Card
            title={data.bucket === "week" ? "Leads per week" : "Leads per month"}
            hint="Every quote request from the cost calculator and every contact-form message."
          >
            <LeadsChart series={data.series} bucket={data.bucket} />
          </Card>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card
              title="Where leads come from"
              hint="How each sender first found the site. Leads from before this was recorded show as Not recorded."
            >
              <RankedBars rows={data.channels} empty="No leads in this period." share />
            </Card>
            <Card title="Top sources" hint="The search engine, social network, AI assistant, site or campaign.">
              <RankedBars
                rows={data.sources.map((s) => ({ label: `${s.label} · ${s.group}`, count: s.count }))}
                empty="No sources recorded yet."
              />
            </Card>
            <Card title="First page they saw" hint="The page each sender landed on.">
              <RankedBars rows={data.landingPages} empty="No landing pages recorded yet." />
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card title="What they want built" hint="Project types in quote requests.">
              <RankedBars rows={data.quotes.types} empty="No quote requests in this period." share />
            </Card>
            <Card title="How they want it built" hint="Build approach chosen in quote requests.">
              <RankedBars rows={data.quotes.approaches} empty="No quote requests in this period." share />
            </Card>
            <Card title="Most-requested features" hint="Features ticked in quote requests.">
              <RankedBars rows={data.quotes.features} empty="No features requested in this period." />
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card title="Contact form: what they need" hint="The service picked in contact messages.">
              <RankedBars rows={data.services} empty="No contact messages in this period." share />
            </Card>
            <Card title="Heard about us via" hint="What senders told us in the contact form.">
              <RankedBars rows={data.heardVia} empty="Nobody said in this period." />
            </Card>
            <Card title="Where inquiries stand" hint="The status of this period's inquiries.">
              <RankedBars
                rows={STATUS_ORDER.map((status) => ({
                  label: INQUIRY_STATUS_LABELS[status],
                  count: data.statuses[status] ?? 0,
                }))}
                empty="No inquiries in this period."
                share
              />
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Card
              title="Waiting for a first reply"
              hint="New, read or open inquiries with no reply sent from admin yet, oldest first, from any time. Replies sent straight from the mailbox aren't counted."
            >
              {data.awaiting.oldest.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing waiting. Nice work.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {data.awaiting.oldest.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{item.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {item.topic || "General"} · {ago(item.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                      <button
                        type="button"
                        onClick={() => onOpenInquiry(item.id)}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-violet-300 hover:text-white"
                      >
                        Open <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Early-access signups" hint="Waitlist signups per platform in this period.">
              <RankedBars rows={data.waitlist} empty="No signups in this period." />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
