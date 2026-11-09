import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { IndustryCards } from "@/components/IndustryLinks";
import { industries } from "@/data/industries";

/** /industries: the sectors we build software for, each with its own page. */
const Industries = () => (
  <>
    <Seo
      title="Industries We Build Software For"
      description="Software for education, healthcare, fintech, e-commerce, logistics and agriculture, built by Nesisoft in Accra, Ghana, around how each sector works."
      jsonLd={breadcrumbsJsonLd([
        { name: "Home", path: "/" },
        { name: "Industries", path: "/industries" },
      ])}
    />
    <PageShell>
      <Navbar />
      <PageHeader
        eyebrow="Industries"
        title="Software for the way your sector works"
        description="Schools, hospitals, financial services, shops, logistics firms and farmers each need different things from software. Here's what we build for each, and the work behind it."
      />
      <Section className="pt-0">
        <IndustryCards industries={industries} />
        <div className="mt-12 flex flex-col items-start gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-300">
            Don't see your sector? We build custom systems for any organisation.{" "}
            <Link to="/services" className="font-medium text-violet-300 hover:text-violet-200">
              See our services
            </Link>
            .
          </p>
          <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
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

export default Industries;
