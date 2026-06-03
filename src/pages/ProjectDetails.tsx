import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock, Layers3, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { fetchProject } from "@/lib/api";
import { useProjects } from "@/hooks/useProjects";

const statusClass = {
  Completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  "In development": "border-sky-400/25 bg-sky-400/10 text-sky-200",
  "Beta testing": "border-amber-400/25 bg-amber-400/10 text-amber-200",
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
    retry: false,
  });
  const allProjects = useProjects();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [projectId]);

  if (isLoading) {
    return (
      <>
        <Seo title="Loading…" noindex />
        <PageShell>
          <Navbar />
          <PageHeader
            backTo="/#projects"
            backLabel="Back to projects"
            eyebrow="Project"
            title="Loading project…"
            description="Fetching the latest case study."
          />
          <Footer />
        </PageShell>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Seo title="Project Not Found" noindex />
        <PageShell>
          <Navbar />
          <PageHeader
            backTo="/#projects"
            backLabel="Back to projects"
            eyebrow="Project"
            title="Project not found"
            description="That project does not exist or may have moved."
          />
          <Section className="pt-0">
            <EmptyState
              title="No matching project"
              description="Browse the current project library from the homepage."
              action={
                <Link to="/#projects">
                  <Button className="rounded-lg bg-violet-600 text-white hover:bg-violet-500">
                    View projects
                  </Button>
                </Link>
              }
            />
          </Section>
          <Footer />
        </PageShell>
      </>
    );
  }

  const relatedProjects = allProjects.filter((item) => item.slug !== project.slug);

  return (
    <>
      <Seo
        title={`${project.name} Case Study`}
        description={project.fullDescription}
        image={project.image}
        type="article"
        jsonLd={breadcrumbsJsonLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/#projects" },
          { name: project.name, path: `/projects/${project.slug}` },
        ])}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          backTo="/#projects"
          backLabel="Back to projects"
          eyebrow={project.type}
          title={project.name}
          description={project.fullDescription}
        >
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300">
              {project.category}
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 text-sm ${statusClass[project.status]}`}
            >
              {project.status}
            </span>
          </div>
        </PageHeader>

        <Section className="pt-0">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <img
              src={project.image}
              alt={project.name}
              className="h-[24rem] w-full object-cover opacity-90 md:h-[34rem]"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            <div className="bg-[#080a0f]/90 p-5">
              <Clock className="mb-3 h-5 w-5 text-violet-300" />
              <p className="text-sm text-slate-400">Timeline</p>
              <p className="mt-1 font-medium text-white">{project.timeline}</p>
            </div>
            <div className="bg-[#080a0f]/90 p-5">
              <Users className="mb-3 h-5 w-5 text-violet-300" />
              <p className="text-sm text-slate-400">Team</p>
              <p className="mt-1 font-medium text-white">{project.teamSize}</p>
            </div>
            <div className="bg-[#080a0f]/90 p-5">
              <Layers3 className="mb-3 h-5 w-5 text-violet-300" />
              <p className="text-sm text-slate-400">Result</p>
              <p className="mt-1 font-medium text-white">{project.result}</p>
            </div>
          </div>
        </Section>

        <Section>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              align="left"
              eyebrow="Product"
              title="What the platform does"
              description="The experience is broken into clear, useful capabilities instead of a vague portfolio description."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <CheckCircle2 className="mb-4 h-5 w-5 text-violet-300" />
                  <p className="font-medium text-white">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section className="border-y border-white/10 bg-white/[0.025]">
          <SectionHeading
            eyebrow="Case study"
            title="Challenge and solution"
            description="The strongest projects show the thinking behind the build, not only a screenshot."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Challenge
              </p>
              <p className="mt-4 leading-7 text-slate-300">
                {project.challenge}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Solution
              </p>
              <p className="mt-4 leading-7 text-slate-300">
                {project.solution}
              </p>
            </div>
          </div>
        </Section>

        <Section>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              align="left"
              eyebrow="Stack"
              title="Technology used"
              description="Tools selected for speed, maintainability, and the needs of the product."
            />
            <div className="flex flex-wrap content-start gap-3">
              {project.technologies.map((tech) => (
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
          <SectionHeading
            align="left"
            eyebrow="Visuals"
            title="Project gallery"
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {project.gallery.map((image, index) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <img
                  src={image}
                  alt={`${project.name} visual ${index + 1}`}
                  loading="lazy"
                  className="h-64 w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </Section>

        <Section className="pt-0">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Need a product with this level of clarity?
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Share the product context and we will help you turn it into a
                  clean build plan.
                </p>
              </div>
              <Link to="/contact">
                <Button className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500">
                  Start a project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Section>

        <Section className="pt-0">
          <SectionHeading
            align="left"
            eyebrow="More work"
            title="Related projects"
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {relatedProjects.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                to={`/projects/${item.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]"
              >
                <p className="text-sm text-violet-300">{item.category}</p>
                <h3 className="mt-2 font-semibold text-white">{item.name}</h3>
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

export default ProjectDetails;

