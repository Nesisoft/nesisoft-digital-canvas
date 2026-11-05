import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { AboutPhotos, StatsGrid } from "@/components/AboutBits";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * Homepage About: a short introduction and photos of the team at work, with a
 * link to the Company page for the full story (vision, mission, team...).
 * Until photos are added in /admin, the stats stand in for them.
 */
const About = () => {
  const { about } = useSiteContent();
  const hasPhotos = about.photos.some((p) => p.url);

  return (
    <Section id="about">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">
            {about.eyebrow}
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.035em] text-white md:text-5xl">
            {about.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">{about.description}</p>
        </div>
        <Link
          to="/company"
          className="group inline-flex shrink-0 items-center gap-2 self-start border border-violet-400/40 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-100 transition-colors hover:border-violet-300/60 hover:bg-violet-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          More about us
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-10 md:mt-12">
        {hasPhotos ? <AboutPhotos photos={about.photos} rise /> : <StatsGrid stats={about.stats} />}
      </div>
    </Section>
  );
};

export default About;
