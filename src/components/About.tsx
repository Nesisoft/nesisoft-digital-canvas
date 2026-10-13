import { CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { useSiteContent } from "@/hooks/useSiteContent";

const About = () => {
  const { about } = useSiteContent();
  const stats = about.stats;
  const benefits = about.benefits;
  // Mission copy is stored as paragraphs separated by blank lines.
  const missionParagraphs = about.missionBody
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Section id="about">
      <SectionHeading
        eyebrow={about.eyebrow}
        title={about.title}
        description={about.description}
      />

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mission */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <h3 className="mb-6 text-xl font-semibold text-white">{about.missionTitle}</h3>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            {missionParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Why choose us */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <h3 className="mb-6 text-xl font-semibold text-white">{about.whyTitle}</h3>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-400" />
                <span className="text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-950/40 p-8 text-center">
            <div className="text-3xl font-semibold tabular-nums text-white md:text-4xl">
              {/* Numbers stay white; a trailing "+", "%" etc. gets the gold accent. */}
              {stat.number.replace(/[^\d.,]+$/, "")}
              <span className="text-gold-300">{stat.number.match(/[^\d.,]+$/)?.[0]}</span>
            </div>
            <div className="mt-2 text-sm text-slate-300">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default About;
