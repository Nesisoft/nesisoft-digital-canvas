import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Layers3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd, serviceJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { getService, services } from "@/data/services";
import { industries } from "@/data/industries";
import { IndustryChips } from "@/components/IndustryLinks";

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const service = getService(serviceId);


  if (!service) {
    return (
      <>
        <Seo title="Service Not Found" noindex />
        <PageShell>
          <Navbar />
          <PageHeader
            backTo="/"
            backLabel="Back to home"
            eyebrow="Service"
            title="Service not found"
            description="That service does not exist or may have moved."
          />
          <Section className="pt-0">
            <EmptyState
              title="No matching service"
              description="Return to the homepage to browse the current services."
              action={
                <Button asChild className="rounded-lg bg-violet-600 text-white hover:bg-violet-500">
                  <Link to="/services">
                    View services
                  </Link>
                </Button>
              }
            />
          </Section>
          <Footer />
        </PageShell>
      </>
    );
  }

  const ServiceIcon = service.icon;
  const relatedServices = services.filter((item) => item.slug !== service.slug);
  const serviceIndustries = industries.filter((industry) => industry.services.includes(service.slug));

  return (
    <>
      <Seo
        title={service.seoTitle ?? service.title}
        description={service.seoDescription ?? service.fullDescription}
        image={service.image}
        jsonLd={[
          serviceJsonLd({
            title: service.title,
            description: service.fullDescription,
            slug: service.slug,
          }),
          breadcrumbsJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          backTo="/services"
          backLabel="All services"
          eyebrow="Service"
          title={service.title}
          description={service.fullDescription}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500">
              <Link to="/contact">
                Start a project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-lg border-white/15 bg-white/[0.02] px-5 text-white hover:bg-white/[0.06] hover:text-white">
              <a href="#process">
                See process
              </a>
            </Button>
          </div>
        </PageHeader>

        <Section className="pt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <img
                src={service.image}
                alt={service.title}
                className="h-full min-h-[22rem] w-full object-cover opacity-90"
              />
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <ServiceIcon
                  aria-hidden
                  className="mb-5 h-7 w-7 text-gold-300"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                  Outcome
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  {service.outcome}
                </h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                  Deliverables
                </p>
                <div className="mt-5 grid gap-3">
                  {service.deliverables.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-gold-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <SectionHeading
            align="left"
            eyebrow="Capabilities"
            title="What is included"
            description="A focused set of product, engineering, and delivery capabilities that reduce ambiguity and improve launch quality."
          />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {service.features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <CheckCircle2 className="mb-4 h-5 w-5 text-gold-400" />
                <p className="font-medium text-white">{feature}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="process" className="border-y border-white/10 bg-white/[0.025]">
          <SectionHeading
            eyebrow="Process"
            title="A clear path from idea to shipped product"
            description="The work is structured enough to reduce risk, but lightweight enough to keep momentum."
          />
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-5">
            {service.process.map((step, index) => (
              <div key={step} className="bg-[#09090b]/90 p-6">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-semibold text-violet-300">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-white">{step}</h3>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Stack"
                title="Built with maintainable tools"
                description="We choose technology for reliability, team fit, and long-term operability."
              />
            </div>
            <div className="flex flex-wrap content-start gap-3">
              {service.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section className="pt-0">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <Layers3 className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Have a product in this category?
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Send the high-level context and we will help you define the
                  scope, risks, timeline, and best first release.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button asChild variant="outline" className="h-11 rounded-lg border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06] hover:text-white">
                  <Link to="/app-cost-calculator">Estimate the cost</Link>
                </Button>
                <Button asChild className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500">
                  <Link to="/contact">
                    Send project brief
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {serviceIndustries.length > 0 && (
          <Section className="pt-0">
            <SectionHeading
              align="left"
              eyebrow="Industries"
              title={`${service.shortTitle} for your sector`}
            />
            <IndustryChips industries={serviceIndustries} className="mt-8" />
          </Section>
        )}

        <Section className="pt-0">
          <SectionHeading
            align="left"
            eyebrow="Related"
            title="Other ways we can help"
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {relatedServices.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                to={`/services/${item.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]"
              >
                <h3 className="font-semibold text-white">{item.shortTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default ServiceDetails;

