import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { Paragraphs } from "@/components/AboutBits";
import { ProjectCard } from "@/components/ProjectCard";
import { IndustryChips } from "@/components/IndustryLinks";
import { useProjects } from "@/hooks/useProjects";
import { getIndustry, industries } from "@/data/industries";
import { services } from "@/data/services";
import { siteConfig } from "@/config/site";

const eyebrow = "font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300";

/**
 * An industry landing page: the sector's problems, what we build for it,
 * typical features, the related work (live projects and platforms), the
 * services involved and common questions. Content: src/data/industries.ts.
 */
const Industry = () => {
  const { slug } = useParams();
  const industry = getIndustry(slug);
  const projects = useProjects();

  if (!industry) {
    return (
      <>
        <Seo title="Industry Not Found" noindex />
        <PageShell>
          <Navbar />
          <PageHeader
            backTo="/industries"
            backLabel="All industries"
            eyebrow="Industries"
            title="Industry not found"
            description="That page doesn't exist or may have moved."
          />
          <Section className="pt-0">
            <EmptyState
              title="No matching industry"
              description="See the industries we build software for."
              action={
                <Button asChild className="bg-violet-600 text-white hover:bg-violet-500">
                  <Link to="/industries">View industries</Link>
                </Button>
              }
            />
          </Section>
          <Footer />
        </PageShell>
      </>
    );
  }

  const path = `/industries/${industry.slug}`;
  const Icon = industry.icon;
  // In the order listed, and only those still published.
  const work = industry.projects
    .map((s) => projects.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const related = industry.services
    .map((s) => services.find((service) => service.slug === s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const others = industries.filter((i) => i.slug !== industry.slug);

  return (
    <>
      <Seo
        title={industry.seoTitle}
        description={industry.seoDescription}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: industry.title,
            serviceType: industry.title,
            description: industry.seoDescription,
            url: `${siteConfig.url}${path}`,
            areaServed: { "@type": "Country", name: "Ghana" },
            provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: industry.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
          breadcrumbsJsonLd([
            { name: "Home", path: "/" },
            { name: "Industries", path: "/industries" },
            { name: industry.name, path },
          ]),
        ]}
      />
      <PageShell>
        <Navbar />
        <PageHeader backTo="/industries" backLabel="All industries" eyebrow={industry.name} title={industry.title}>
          <Paragraphs text={industry.intro} className="max-w-3xl text-lg leading-relaxed text-slate-300" />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
              <Link to="/contact">
                Start a project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {work.length > 0 && (
              <Button asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
                <a href="#work">See related work</a>
              </Button>
            )}
          </div>
        </PageHeader>

        {/* The problems */}
        <Section className="pt-4">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <Icon aria-hidden className="h-8 w-8 text-violet-300" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                What gets in the way
              </h2>
            </div>
            <ul className="grid gap-px overflow-hidden border border-white/10 bg-white/5 sm:grid-cols-2">
              {industry.challenges.map((challenge) => (
                <li key={challenge} className="flex items-start gap-3 bg-slate-950/40 p-5 text-slate-200">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-300" />
                  {challenge}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* What we build */}
        <Section>
          <SectionHeading align="left" eyebrow="What we build" title={`Software for ${industry.name.toLowerCase()}`} />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {industry.solutions.map((solution) => (
              <div key={solution.title} className="border border-white/10 bg-white/[0.03] p-7">
                <h3 className="text-xl font-semibold text-white">{solution.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-300">{solution.description}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-14 text-sm font-medium uppercase tracking-wider text-slate-400">Typical features</h3>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {industry.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-slate-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400" />
                {feature}
              </li>
            ))}
          </ul>
        </Section>

        {/* The proof */}
        {work.length > 0 && (
          <Section id="work">
            <SectionHeading align="left" eyebrow="Related work" title={`Our ${industry.name.toLowerCase()} work`} />
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {work.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </Section>
        )}

        {/* Services involved */}
        {related.length > 0 && (
          <Section>
            <SectionHeading align="left" eyebrow="Services" title="How we help" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {related.map((service) => {
                const ServiceIcon = service.icon;
                return (
                  <Link
                    key={service.slug}
                    to={`/services/${service.slug}`}
                    className="group border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]"
                  >
                    <ServiceIcon aria-hidden className="h-6 w-6 text-violet-300" strokeWidth={1.5} />
                    <h3 className="mt-4 font-semibold text-white">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{service.description}</p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-violet-300">
                      Explore {service.shortTitle.toLowerCase()}
                      <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* Questions */}
        <Section id="faq">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeading align="left" eyebrow="Questions" title="Good to know" />
            <div className="divide-y divide-white/10 border-y border-white/10">
              {industry.faqs.map((faq) => (
                <details key={faq.question} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                    {faq.question}
                    <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>

        {/* Call to action, then the other industries */}
        <Section>
          <div className="flex flex-col items-start gap-6 border border-white/10 bg-gradient-to-br from-violet-600/20 via-white/[0.03] to-transparent p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <span className={eyebrow}>{industry.name}</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                Tell us what you need to build
              </h2>
              <p className="mt-3 max-w-xl text-slate-300">
                Share a few details, or attach a brief, and we'll reply within one business day.
              </p>
            </div>
            <Button asChild className="h-11 shrink-0 bg-violet-600 px-5 text-white hover:bg-violet-500">
              <Link to="/contact">
                Start a project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <h2 className="mt-14 text-sm font-medium uppercase tracking-wider text-slate-400">Other industries</h2>
          <IndustryChips industries={others} className="mt-4" />
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default Industry;
