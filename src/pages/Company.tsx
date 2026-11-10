import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { AboutPhotos, Paragraphs, StatsGrid } from "@/components/AboutBits";
import { TeamSection } from "@/components/Team";
import { useSiteContent } from "@/hooks/useSiteContent";
import { siteConfig } from "@/config/site";

/**
 * The Company page: who Nesisoft is, in numbers, why and how it works, the
 * team, and what it gives back. All the copy is edited in /admin (Site
 * content); the team in /admin (Team).
 */
const Company = () => {
  const { about } = useSiteContent();

  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${siteConfig.name}`,
    url: `${siteConfig.url}/company`,
    about: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <>
      <Seo
        title="About Our Software Development Company in Accra"
        description="Meet Nesisoft, a software development company in Accra, Ghana: our vision and mission, why clients work with us, the team behind the work, and how we train the next generation of developers."
        jsonLd={aboutPageJsonLd}
      />
      <PageShell>
        <Navbar />
        <PageHeader eyebrow="Company" title={about.title} description={about.description} />

        {about.photos.some((p) => p.url) && (
          <Section className="pt-0">
            <AboutPhotos photos={about.photos} />
          </Section>
        )}

        <Section className="pt-0" aria-label="Nesisoft in numbers">
          <StatsGrid stats={about.stats} />
        </Section>

        {/* Vision and mission */}
        <Section id="vision">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { label: "Vision", title: about.visionTitle, body: about.visionBody },
              { label: "Mission", title: about.missionTitle, body: about.missionBody },
            ].map((block) => (
              <div key={block.label} className="border border-white/10 bg-white/[0.03] p-8 md:p-10">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">
                  {block.label}
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {block.title}
                </h2>
                <Paragraphs text={block.body} className="mt-5 leading-relaxed text-slate-300" />
              </div>
            ))}
          </div>
        </Section>

        {/* Why work with us */}
        {about.benefits.length > 0 && (
          <Section id="why-us">
            <SectionHeading align="left" eyebrow="Why Nesisoft" title={about.whyTitle} />
            <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
              {about.benefits.map((benefit, i) => (
                <div key={benefit} className="bg-slate-950/40 p-6 md:p-8">
                  <span className="font-mono text-sm text-gold-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-lg font-medium leading-snug text-white">{benefit}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <TeamSection />

        {/* Corporate social responsibility */}
        <Section id="csr">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">
                Giving back
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.035em] text-white md:text-5xl">
                {about.csrTitle}
              </h2>
              <Paragraphs text={about.csrBody} className="mt-5 text-lg leading-relaxed text-slate-300" />
            </div>
            <div className="space-y-4">
              {about.csrPrograms
                .filter((program) => program.title || program.description)
                .map((program) => (
                  <div key={program.title} className="border border-white/10 bg-white/[0.03] p-6 md:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center bg-violet-500/15 text-violet-200">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <h3 className="font-display text-xl font-bold text-white">{program.title}</h3>
                    </div>
                    <Paragraphs text={program.description} className="mt-4 leading-relaxed text-slate-300" />
                    {/trainingship/i.test(program.title) && (
                      <Link
                        to="/trainingships"
                        className="mt-5 inline-flex items-center text-sm font-medium text-violet-300 transition-colors hover:text-white"
                      >
                        Tracks, details and how to apply <ArrowRight aria-hidden className="ml-1.5 h-4 w-4" />
                      </Link>
                    )}
                  </div>
                ))}
              <p className="text-sm text-slate-400">
                Want to train with us?{" "}
                <Link to="/trainingships" className="font-medium text-violet-300 hover:text-violet-200">
                  Apply for a Trainingship
                </Link>
                . A school or organisation that wants to partner with us?{" "}
                <Link to="/contact" className="font-medium text-violet-300 hover:text-violet-200">
                  Get in touch
                </Link>
                .
              </p>
            </div>
          </div>
        </Section>

        {/* Call to action */}
        <Section>
          <div className="flex flex-col items-start gap-6 border border-white/10 bg-gradient-to-br from-violet-600/20 via-white/[0.03] to-transparent p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                Have a project in mind?
              </h2>
              <p className="mt-3 max-w-xl text-slate-300">
                Tell us what you're building. We'll reply within one business day.
              </p>
            </div>
            <Button asChild className="h-11 shrink-0 bg-violet-600 px-5 text-white hover:bg-violet-500">
              <Link to="/contact">
                Start a project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default Company;
