import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { services } from "@/data/services";
import { industries } from "@/data/industries";
import { IndustryChips } from "@/components/IndustryLinks";
import { AiBanner } from "@/components/AiBanner";

const Services = () => {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="Services shaped around outcomes"
        description="Each engagement starts with the business result you need, then narrows into a usable, maintainable product."
      />

      {/* Horizontal scroll on mobile, grid from md up. */}
      <div className="mt-16 -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
        {services.map((service, index) => {
          const Icon = service.icon;
          const card = (
            <article className="group relative flex h-full min-h-[25rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-transparent p-6 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/60 hover:bg-violet-500/[0.07] hover:shadow-2xl hover:shadow-violet-900/30 focus-within:border-violet-400/60">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/0 to-transparent transition-colors duration-200 group-hover:via-violet-400" />

              <div className="mb-6 flex items-start justify-between gap-4">
                <Icon
                  aria-hidden
                  className="h-7 w-7 text-violet-300 transition-colors duration-200 group-hover:text-gold-300"
                  strokeWidth={1.5}
                />
                <span className="font-mono text-xs tracking-[0.12em] text-slate-500 transition-colors duration-200 group-hover:text-gold-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-white">
                {service.shortTitle}
              </h3>
              <p className="mt-3 min-h-[5.25rem] text-sm leading-6 text-slate-300">
                {service.description}
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-200 group-hover:border-violet-400/40 group-hover:bg-violet-500/10">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 transition-colors duration-200 group-hover:text-gold-300">
                  Outcome
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-100">
                  {service.outcome}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {service.deliverables.slice(0, 3).map((deliverable) => (
                  <div
                    key={deliverable}
                    className="flex items-center gap-2.5 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-gold-400" />
                    <span>{deliverable}</span>
                  </div>
                ))}
              </div>

              <span className="mt-auto inline-flex items-center justify-between border-t border-white/10 pt-5 text-sm font-medium text-violet-300 transition-colors duration-200 group-hover:text-white">
                <span>Explore service</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-colors duration-200 group-hover:border-violet-400/50 group-hover:bg-violet-500/25">
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </span>
            </article>
          );

          return (
            <Link
              key={service.title}
              to={`/services/${service.slug}`}
              className="shrink-0 basis-[82%] snap-start rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] sm:basis-[55%] md:basis-auto md:shrink"
            >
              {card}
            </Link>
          );
        })}
      </div>

      <AiBanner className="mt-10" />

      <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Industries we build for</p>
          <IndustryChips industries={industries} className="mt-4" />
        </div>
        <Link
          to="/services"
          className="inline-flex flex-shrink-0 items-center text-sm font-medium text-violet-300 hover:text-violet-200"
        >
          All services and how we work →
        </Link>
      </div>
      <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Need something custom?
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            Tell us what you're building and we'll map out an approach.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
          <Link
            to="/app-cost-calculator"
            className="inline-flex items-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
          >
            Estimate the cost
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Get in touch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
};

export default Services;
