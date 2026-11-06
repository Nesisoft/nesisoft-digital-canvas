import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { PlatformMark, StatusPill } from "@/components/PlatformBits";
import { WaitlistForm } from "@/components/WaitlistForm";
import { useProjects } from "@/hooks/useProjects";
import { resolveImage } from "@/lib/api";
import { siteConfig } from "@/config/site";
import type { Project } from "@/data/projects";

/** schema.org's application category for a platform's category. */
function applicationCategory(category: string) {
  if (/learn|educat|school|tutor/i.test(category)) return "EducationalApplication";
  if (/commerce|shop|market|retail/i.test(category)) return "ShoppingApplication";
  if (/financ|pay|bank/i.test(category)) return "FinanceApplication";
  return "BusinessApplication";
}

const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${siteConfig.url}${url}`);

function structuredData(project: Project, path: string) {
  const description = project.fullDescription || project.description;
  const data: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: project.name,
      description,
      applicationCategory: applicationCategory(project.category),
      url: project.websiteUrl || `${siteConfig.url}${path}`,
      ...(project.image ? { image: absolute(resolveImage(project.image)) } : {}),
      publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    },
    breadcrumbsJsonLd([
      { name: "Home", path: "/" },
      { name: "Platforms", path: "/platforms" },
      { name: project.name, path },
    ]),
  ];
  const faqs = project.faqs ?? [];
  if (faqs.length) {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }
  return data;
}

const eyebrow = "font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300";

/**
 * A platform's product page: what it is, who it's for, what it does, how it
 * works, questions, and early access (or links to it once it's live). Every
 * part is edited in /admin → Projects; empty parts are left out.
 */
const Platform = () => {
  const { slug } = useParams();
  const projects = useProjects();
  const project = projects.find((p) => p.slug === slug && p.type === "Internal platform");

  if (!project) {
    return (
      <>
        <Seo title="Platform Not Found" noindex />
        <PageShell>
          <Navbar />
          <PageHeader
            backTo="/platforms"
            backLabel="All platforms"
            eyebrow="Platforms"
            title="Platform not found"
            description="That platform doesn't exist or may have moved."
          />
          <Section className="pt-0">
            <EmptyState
              title="No matching platform"
              description="See the platforms we build and run."
              action={
                <Button asChild className="bg-violet-600 text-white hover:bg-violet-500">
                  <Link to="/platforms">View platforms</Link>
                </Button>
              }
            />
          </Section>
          <Footer />
        </PageShell>
      </>
    );
  }

  const path = `/platforms/${project.slug}`;
  const tagline = (project.tagline || "").trim();
  const audiences = project.audiences ?? [];
  const steps = project.steps ?? [];
  const faqs = project.faqs ?? [];
  const gallery = (project.gallery ?? []).filter(Boolean);
  const live = project.status === "Completed";
  const earlyLabel = project.status === "Beta testing" ? "Join the beta" : "Get early access";
  const appLinks = [
    project.appStoreUrl && { label: "App Store", href: project.appStoreUrl },
    project.playStoreUrl && { label: "Google Play", href: project.playStoreUrl },
  ].filter(Boolean) as { label: string; href: string }[];
  const others = projects.filter((p) => p.type === "Internal platform" && p.slug !== project.slug);

  return (
    <>
      <Seo
        title={tagline ? `${project.name}: ${tagline.replace(/[.!]$/, "")}` : project.name}
        description={project.fullDescription || project.description}
        image={project.image || undefined}
        jsonLd={structuredData(project, path)}
      />
      <PageShell>
        <Navbar />

        {/* Hero */}
        <header className="pb-12 pt-28 md:pt-32">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8">
            <div>
              <Link
                to="/platforms"
                className="-ml-2 mb-8 inline-flex items-center px-2 py-1 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                ← All platforms
              </Link>
              <div className="flex items-center gap-3">
                <PlatformMark project={project} size="lg" />
                <div>
                  <p className="font-display text-2xl font-bold text-white">{project.name}</p>
                  <p className="text-sm text-slate-400">{project.category}</p>
                </div>
              </div>
              <div className="mt-6">
                <StatusPill status={project.status} />
              </div>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-white md:text-6xl">
                {tagline || project.name}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                {project.fullDescription || project.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {project.websiteUrl ? (
                  <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
                    <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit {project.name} <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  !live && (
                    <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
                      <a href="#early-access">
                        {earlyLabel} <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )
                )}
                {appLinks.map((link) => (
                  <Button key={link.label} asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label} <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ))}
                <Button asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
                  <Link to="/contact">Partner with us</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-gradient-to-br from-violet-600/30 via-white/[0.03] to-transparent">
              {project.image ? (
                <img
                  src={resolveImage(project.image)}
                  alt={`${project.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center font-display text-7xl font-bold text-white/80">
                  {project.name}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Who it's for */}
        {audiences.length > 0 && (
          <Section id="who">
            <SectionHeading
              align="left"
              eyebrow="Who it's for"
              title={audiences.length === 2 ? `Built for both sides of ${project.name}` : `Who ${project.name} is for`}
            />
            <div className={`mt-12 grid gap-6 ${audiences.length > 1 ? "md:grid-cols-2" : ""}`}>
              {audiences.map((audience) => (
                <div key={audience.title} className="border border-white/10 bg-white/[0.03] p-8">
                  <span className={eyebrow}>{audience.role}</span>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white">{audience.title}</h2>
                  {audience.description && <p className="mt-3 text-slate-300">{audience.description}</p>}
                  {audience.points.length > 0 && (
                    <ul className="mt-6 space-y-3">
                      {audience.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-slate-200">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-300" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Features */}
        {project.features.length > 0 && (
          <Section id="features">
            <SectionHeading align="left" eyebrow="Features" title={`What ${project.name} does`} />
            <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
              {project.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 bg-slate-950/40 p-6">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-300" />
                  <span className="font-medium text-white">{feature}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* How it works */}
        {steps.length > 0 && (
          <Section id="how-it-works">
            <SectionHeading align="left" eyebrow="How it works" title={`${project.name} in ${steps.length} steps`} />
            <ol className={`mt-12 grid gap-6 sm:grid-cols-2 ${steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {steps.map((step, i) => (
                <li key={step.title} className="border-t-2 border-violet-500/60 pt-5">
                  <span className="font-mono text-sm text-gold-300">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                  {step.description && <p className="mt-2 text-slate-300">{step.description}</p>}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Screens */}
        {gallery.length > 0 && (
          <Section id="screens">
            <SectionHeading align="left" eyebrow="A closer look" title={`Inside ${project.name}`} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((src, i) => (
                <img
                  key={src}
                  src={resolveImage(src)}
                  alt={`${project.name} screen ${i + 1}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full border border-white/10 object-cover"
                />
              ))}
            </div>
          </Section>
        )}

        {/* Questions */}
        {faqs.length > 0 && (
          <Section id="faq">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
              <SectionHeading align="left" eyebrow="Questions" title="Good to know" />
              <div className="divide-y divide-white/10 border-y border-white/10">
                {faqs.map((faq) => (
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
        )}

        {/* Early access, until it's live */}
        {!live && (
          <Section id="early-access">
            <div className="grid gap-10 border border-white/10 bg-gradient-to-br from-violet-600/20 via-white/[0.03] to-transparent p-8 md:p-12 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <span className={eyebrow}>{project.status === "Beta testing" ? "Beta" : "Early access"}</span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {earlyLabel}
                </h2>
                <p className="mt-4 text-slate-300">
                  {project.status === "Beta testing"
                    ? `${project.name} is in beta. Leave your details and we'll let you know when you can start using it.`
                    : `${project.name} is in development. Leave your details and we'll let you know as it opens up.`}
                </p>
              </div>
              <WaitlistForm
                platform={project.slug}
                platformName={project.name}
                roles={audiences.map((a) => a.role).filter(Boolean)}
                submitLabel={earlyLabel}
              />
            </div>
          </Section>
        )}

        {/* The other platforms */}
        {others.length > 0 && (
          <Section id="more-platforms">
            <SectionHeading align="left" eyebrow="More from Nesisoft" title="Our other platforms" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  to={`/platforms/${other.slug}`}
                  className="group flex flex-col border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]"
                >
                  <div className="flex items-center gap-3">
                    <PlatformMark project={other} />
                    <span className="font-display text-lg font-bold text-white">{other.name}</span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{other.tagline || other.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-violet-300">
                    View {other.name}
                    <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Cross-sell: the studio behind it */}
        <Section>
          <div className="flex flex-col items-start gap-6 border border-white/10 bg-white/[0.03] p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                Want a platform like {project.name} for your business?
              </h2>
              <p className="mt-3 max-w-xl text-slate-300">
                The team that builds {project.name} builds web and mobile products for clients too.
              </p>
            </div>
            <Button asChild className="h-11 shrink-0 bg-violet-600 px-5 text-white hover:bg-violet-500">
              <Link to="/contact">
                Start a project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default Platform;
