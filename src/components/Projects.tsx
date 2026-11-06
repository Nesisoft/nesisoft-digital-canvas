import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { useProjects } from "@/hooks/useProjects";
import { projectPath, type Project } from "@/data/projects";

const Projects = () => {
  const projects = useProjects();
  const internalProjects = projects.filter((p) => p.type === "Internal platform");
  const clientProjects = projects.filter((p) => p.type === "Client work");

  const ProjectCard = ({
    project,
    className = "",
  }: {
    project: Project;
    className?: string;
  }) => {
    const inner = (
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-violet-500/30 hover:bg-white/[0.05]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={project.image}
            alt={project.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
            {project.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h4 className="mb-2 text-lg font-semibold text-white">
            {project.name}
          </h4>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-300">
            {project.description}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-violet-400">
            View project
            <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    );

    return (
      <Link to={projectPath(project)} className={className}>
        {inner}
      </Link>
    );
  };

  return (
    <Section id="projects">
      <SectionHeading
        eyebrow="Work"
        title="Selected projects"
        description="Our own platforms and client builds making a difference across Africa."
      />

      <div className="mt-16">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">
            Our platforms
          </h3>
          <Link to="/platforms" className="text-sm font-medium text-violet-300 hover:text-violet-200">
            All platforms →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {internalProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-slate-400">
          Client work
        </h3>
        <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
          {clientProjects.map((project) => (
            <ProjectCard
              key={project.name}
              project={project}
              className="shrink-0 basis-[82%] snap-start rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] sm:basis-[55%] md:basis-auto md:shrink"
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Projects;
