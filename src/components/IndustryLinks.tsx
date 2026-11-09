import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Industry } from "@/data/industries";

/** Industry cards, each linking to its page (/industries/<slug>). */
export function IndustryCards({ industries, className }: { industries: Industry[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {industries.map((industry) => {
        const Icon = industry.icon;
        return (
          <Link
            key={industry.slug}
            to={`/industries/${industry.slug}`}
            className="group flex flex-col border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]"
          >
            <Icon aria-hidden className="h-6 w-6 text-violet-300 transition-colors group-hover:text-gold-300" strokeWidth={1.5} />
            <h3 className="mt-4 text-lg font-semibold text-white">{industry.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-300">{industry.summary}</p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-violet-300">
              {industry.title}
              <ArrowUpRight className="ml-1 h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** A compact row of industry links (homepage, service pages). */
export function IndustryChips({ industries, className }: { industries: Industry[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {industries.map((industry) => {
        const Icon = industry.icon;
        return (
          <li key={industry.slug}>
            <Link
              to={`/industries/${industry.slug}`}
              className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 transition-colors hover:border-violet-400/50 hover:text-white"
            >
              <Icon aria-hidden className="h-4 w-4 text-violet-300" strokeWidth={1.75} />
              {industry.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
