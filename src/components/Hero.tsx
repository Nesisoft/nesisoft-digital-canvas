import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { HeroChat } from "@/components/HeroChat";
import { useSiteContent } from "@/hooks/useSiteContent";

// Cycled in the headline; the first is the one search engines and screen
// readers get. Each phrase is split over two lines so every one fills the
// same space — no empty gap under the shorter phrases.
const HEADLINE_PHRASES: [string, string][] = [
  ["African businesses", "forward"],
  ["startups", "to market"],
  ["bold ideas", "to launch"],
  ["teams", "ahead"],
];

const Hero = () => {
  const content = useSiteContent();
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const id = setInterval(
      () => setPhrase((p) => (p + 1) % HEADLINE_PHRASES.length),
      2800,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden pb-12 pt-28 md:pt-36 lg:pb-20"
    >
      {/* Two columns from lg up: copy on the left, the live conversation on
          the right. Stacks (copy first) on smaller screens. Same container and
          gutters as the navbar so the headline lines up with the logo. */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:px-8">
        <div className="text-center lg:text-left">
          <p className="mb-6 inline-flex items-center gap-2.5 border border-gold-300/25 bg-gold-300/[0.06] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-gold-200">
            <span
              aria-hidden
              className="h-0.5 w-0.5 rounded-[999px] bg-gold-300"
            />
            Software studio · {siteConfig.contact.location}
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl sm:leading-[0.98] lg:text-6xl xl:text-[4.25rem]">
            {content.hero.titleLead}{" "}
            {/* Search engines and screen readers get one stable headline. The
                rotating phrases below are painted by ::before from data-text
                (pre-line keeps its line break); that isn't DOM text, so they
                never leak into the heading. */}
            <span className="sr-only">{HEADLINE_PHRASES[0].join(" ")}</span>
            {/* All phrases occupy the same grid cell, so the line is always
                sized to the tallest one — swapping them never shifts layout. */}
            <span aria-hidden className="mt-1 grid">
              {HEADLINE_PHRASES.map(([first, second], i) => (
                <span
                  key={first}
                  data-text={`${first}\n${second}`}
                  className={`col-start-1 row-start-1 whitespace-pre-line text-violet-400 transition-opacity duration-500 before:content-[attr(data-text)] ${
                    i === phrase ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300 lg:mx-0">
            {content.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <Button
              asChild
              className="group h-12 rounded-lg bg-violet-600 px-6 text-base font-medium text-white transition-colors hover:bg-violet-500"
            >
              <Link to="/contact">
                Start a project
                <ArrowRight
                  className="ml-2 transition-transform group-hover:translate-x-0.5"
                  size={18}
                />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-12 rounded-lg border-white/15 bg-transparent px-6 text-base font-medium text-white transition-colors hover:bg-white/5 hover:text-white"
            >
              <a href={siteConfig.contact.phonePrimary.href}>
                <Phone size={18} className="mr-2" />
                Call us
              </a>
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400 lg:text-left">
            <Calculator aria-hidden className="mr-1.5 inline h-4 w-4 align-[-3px] text-gold-300" />
            Wondering what it costs?{" "}
            <Link
              to="/app-cost-calculator"
              className="font-medium text-violet-300 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Get an instant estimate →
            </Link>
          </p>
        </div>

        {/* Animated conversation: lead → product ready for review */}
        <HeroChat />
      </div>
    </section>
  );
};

export default Hero;
