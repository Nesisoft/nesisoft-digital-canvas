import { resolveImage, type SiteContent } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Shared by the homepage About teaser and the Company page. */

type Photo = SiteContent["about"]["photos"][number];
type Stat = SiteContent["about"]["stats"][number];

/** Copy edited in /admin keeps paragraphs apart with blank lines. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}

function PhotoFrame({ photo, className }: { photo: Photo; className?: string }) {
  return (
    <figure className={cn("overflow-hidden border border-white/10 bg-white/[0.03]", className)}>
      <img
        src={resolveImage(photo.url)}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </figure>
  );
}

/**
 * The team-at-work photos. Three sit in a staggered row (a wide one, a
 * narrow one, then a taller one that rises beside the text when `rise` is
 * set); one or two simply share the width.
 */
export function AboutPhotos({ photos, rise = false }: { photos: Photo[]; rise?: boolean }) {
  const shown = photos.filter((p) => p.url).slice(0, 3);
  if (!shown.length) return null;

  if (shown.length < 3) {
    return (
      <div className={cn("grid gap-4 md:gap-6", shown.length === 2 && "sm:grid-cols-[1.4fr_1fr]")}>
        {shown.map((photo, i) => (
          <PhotoFrame key={i} photo={photo} className="h-64 md:h-[24rem]" />
        ))}
      </div>
    );
  }

  const [first, second, third] = shown;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-[1.6fr_0.9fr_1.25fr] md:items-end md:gap-6">
      <PhotoFrame photo={first} className="col-span-2 h-56 sm:h-72 md:col-span-1 md:h-[22rem]" />
      <PhotoFrame photo={second} className="h-44 sm:h-56 md:h-[22rem]" />
      <PhotoFrame
        photo={third}
        className={cn("h-44 sm:h-56 md:h-[29rem]", rise && "lg:-mt-28")}
      />
    </div>
  );
}

/** Big numbers with small labels; a trailing "+" or "%" gets the gold accent. */
export function StatsGrid({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/5",
        stats.length >= 4 ? "md:grid-cols-4" : stats.length === 3 ? "md:grid-cols-3" : ""
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="bg-slate-950/40 p-8 text-center">
          <div className="font-display text-4xl font-bold tabular-nums tracking-tight text-white md:text-5xl">
            {stat.number.replace(/[^\d.,]+$/, "")}
            <span className="text-gold-300">{stat.number.match(/[^\d.,]+$/)?.[0]}</span>
          </div>
          <div className="mt-2 text-sm text-slate-300">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
