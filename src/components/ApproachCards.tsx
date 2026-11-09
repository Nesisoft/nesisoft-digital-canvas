import type { ReactNode } from "react";
import { Bot, Sparkles, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { savingLabel, type EstimatorMultiplier } from "@shared/estimator.js";

const ICONS: Record<string, LucideIcon> = {
  traditional: Users,
  "ai-assisted": Sparkles,
  "ai-native": Bot,
};

// How each build approach runs. Names, wording and savings come from
// /admin → Pricing; this is the part that doesn't change.
const DETAILS: Record<string, { badge: string; delivery: string; bestFor: string }> = {
  traditional: {
    badge: "Iterative",
    delivery: "The scope evolves sprint by sprint: plan, build, review, adjust.",
    bestFor: "Projects whose scope will change as you learn from your users.",
  },
  "ai-assisted": {
    badge: "Iterative + AI",
    delivery: "The same sprints, with AI drafting code, tests and documentation for our engineers to review.",
    bestFor: "Most projects, including existing systems that need to move faster.",
  },
  "ai-native": {
    badge: "Spec-first",
    delivery: "We agree a detailed specification first, then build to it in milestones.",
    bestFor: "MVPs and new products with a clear, fixed scope.",
  },
};

/**
 * The three ways to build (traditional, AI-assisted, AI-native) side by
 * side: how each is delivered, what it suits and what it saves. Used by the
 * cost calculator and the AI-assisted development page; `action` renders
 * each card's button, and `selected` highlights one.
 */
export function ApproachCards({
  approaches,
  selected,
  action,
  className,
}: {
  approaches: EstimatorMultiplier[];
  selected?: string;
  action: (approach: EstimatorMultiplier, chosen: boolean) => ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      {approaches.map((approach) => {
        const details = DETAILS[approach.id];
        const Icon = ICONS[approach.id] ?? Sparkles;
        const chosen = selected === approach.id;
        return (
          <div
            key={approach.id}
            className={cn(
              "flex flex-col border p-6 md:p-7",
              chosen ? "border-violet-400/60 bg-violet-500/[0.08]" : "border-white/10 bg-white/[0.03]"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <Icon aria-hidden className="h-7 w-7 text-violet-300" strokeWidth={1.5} />
              {details && (
                <span className="border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-slate-300">
                  {details.badge}
                </span>
              )}
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">{approach.label}</h3>
            {/* Three lines' room side by side, so the budgets line up. */}
            <p className="mt-2 text-sm leading-6 text-slate-300 lg:min-h-[4.5rem]">{approach.description}</p>
            <p
              className={cn(
                "mt-6 font-display text-4xl font-bold tracking-tight",
                approach.factor < 1 ? "text-gold-300" : "text-white"
              )}
            >
              {approach.factor === 1 ? "Base" : savingLabel(approach).replace(/^About /, "")}
            </p>
            <p className="mt-1 text-sm text-slate-400">Development budget</p>
            {details && (
              <dl className="mt-6 flex-1 space-y-4 border-t border-white/10 pt-5 text-sm">
                <div>
                  <dt className="font-medium text-white">How it's delivered</dt>
                  <dd className="mt-1 leading-6 text-slate-300">{details.delivery}</dd>
                </div>
                <div>
                  <dt className="font-medium text-white">Best for</dt>
                  <dd className="mt-1 leading-6 text-slate-300">{details.bestFor}</dd>
                </div>
              </dl>
            )}
            <div className="mt-6">{action(approach, chosen)}</div>
          </div>
        );
      })}
    </div>
  );
}
