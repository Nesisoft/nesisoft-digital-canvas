import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd, serviceJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { IndustryCards } from "@/components/IndustryLinks";
import { AiBanner } from "@/components/AiBanner";
import { services } from "@/data/services";
import { industries } from "@/data/industries";

// How every engagement runs, whatever the service.
const STEPS = [
  { title: "Discover", description: "We agree the goals, the users and what success looks like, and scope the first release." },
  { title: "Design", description: "We map the key journeys and prototype them, so you see the product before it's built." },
  { title: "Build", description: "We build in short cycles you can review, testing performance and edge cases as we go." },
  { title: "Launch and support", description: "We ship with monitoring in place, train your team and keep improving after launch." },
];

/** /services: every service, how we work, and the industries we serve. */
const Services = () => (
  <>
    <Seo
      title="Software Development Services in Ghana"
      description="Web platforms, mobile apps, custom software and product design from Nesisoft in Accra, Ghana, shaped around the outcome your business needs."
      jsonLd={[
        breadcrumbsJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]),
        ...services.map((service) =>
          serviceJsonLd({ title: service.title, description: service.fullDescription, slug: service.slug })
        ),
      ]}
    />
    <PageShell>
      <Navbar />
      <PageHeader
        eyebrow="Services"
        title="Software development services"
        description="We design, build and support web platforms, mobile apps and custom systems for businesses and organisations in Ghana and across Africa. Every engagement starts with the outcome you need."
      />

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="group flex flex-col border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-violet-500/30 hover:bg-white/[0.05] md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon aria-hidden className="h-8 w-8 text-violet-300 transition-colors group-hover:text-gold-300" strokeWidth={1.5} />
                  <span className="font-mono text-xs tracking-[0.12em] text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">{service.title}</h2>
                <p className="mt-3 leading-relaxed text-slate-300">{service.description}</p>
                <p className="mt-4 text-sm font-medium text-gold-300">{service.outcome}</p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {service.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center border-t border-white/10 pt-5 text-sm font-medium text-violet-300">
                  Explore {service.shortTitle.toLowerCase()}
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
        <AiBanner className="mt-6" />
      </Section>

      <Section className="border-y border-white/10 bg-white/[0.025]">
        <SectionHeading align="left" eyebrow="How we work" title="From idea to shipped product" />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t-2 border-violet-500/60 pt-5">
              <span className="font-mono text-sm text-gold-300">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-slate-300">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading align="left" eyebrow="Industries" title="Built for your sector" />
          <Link to="/industries" className="text-sm font-medium text-violet-300 hover:text-violet-200">
            All industries →
          </Link>
        </div>
        <IndustryCards industries={industries} className="mt-10" />
      </Section>

      <Section className="pt-0">
        <div className="flex flex-col items-start gap-6 border border-white/10 bg-gradient-to-br from-violet-600/20 via-white/[0.03] to-transparent p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">See the work behind it</h2>
            <p className="mt-3 max-w-xl text-slate-300">
              Browse{" "}
              <Link to="/projects" className="font-medium text-violet-300 hover:text-violet-200">
                client projects
              </Link>{" "}
              and{" "}
              <Link to="/platforms" className="font-medium text-violet-300 hover:text-violet-200">
                our own platforms
              </Link>
              , or tell us what you're building.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
              <Link to="/app-cost-calculator">Estimate the cost</Link>
            </Button>
            <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
              <Link to="/contact">
                Start a project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      <Footer />
    </PageShell>
  </>
);

export default Services;
