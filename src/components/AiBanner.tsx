import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEstimator } from "@/hooks/useEstimator";

/**
 * A call-out for AI-assisted development (/services/ai-assisted-development),
 * with the biggest saving from /admin → Pricing. On the homepage's services
 * and on /services.
 */
export function AiBanner({ className }: { className?: string }) {
  const config = useEstimator();
  const best = Math.max(0, ...config.approaches.map((a) => Math.round((1 - a.factor) * 100)));
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-gold-300/25 bg-gradient-to-br from-violet-600/25 via-violet-500/[0.06] to-gold-300/[0.08] p-6 md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">
            <Sparkles aria-hidden className="h-4 w-4" />
            AI-assisted development
          </p>
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            {best > 0 ? `Ship sooner and spend up to ${best}% less` : "Ship sooner with AI"}
          </h3>
          <p className="mt-2 leading-relaxed text-slate-300">
            AI speeds up the routine work while our engineers stay in charge. Choose a traditional, AI-assisted or
            AI-native team for any project.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            to="/services/ai-assisted-development"
            className="inline-flex h-11 items-center bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200"
          >
            How it works <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            to="/app-cost-calculator?approach=ai-assisted#calculator"
            className="inline-flex h-11 items-center border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            Compare costs
          </Link>
        </div>
      </div>
    </div>
  );
}
