import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/hooks/useProjects";

/** /projects: every client project, each linking to its case study. */
const ClientProjects = () => {
  const projects = useProjects().filter((p) => p.type === "Client work");

  return (
    <>
      <Seo
        title="Client Projects & Case Studies"
        description="Web, mobile and custom software Nesisoft has built for clients across Africa, from fintech and e-commerce to healthcare and logistics. Some of it under NDA."
        jsonLd={breadcrumbsJsonLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
        ])}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          eyebrow="Client work"
          title="Projects we've built for clients"
          description="Web, mobile and custom software for businesses across Africa. Open any project for the challenge, our approach and the result."
        />
        <Section className="pt-0">
          <div className="mb-8 flex items-start gap-3 border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 md:items-center">
            <Lock aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-300 md:mt-0" />
            <p>
              <span className="font-medium text-white">We keep to NDAs.</span> Projects marked{" "}
              <span className="font-medium text-white">Under NDA</span> leave out the client's name and
              anything that would identify them. Yours would get the same care.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} heading="h2" />
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-300">
              Looking for our own products?{" "}
              <Link to="/platforms" className="font-medium text-violet-300 hover:text-violet-200">
                See our platforms
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
};

export default ClientProjects;
