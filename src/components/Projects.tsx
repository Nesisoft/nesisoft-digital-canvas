import { Link } from "react-router-dom";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/hooks/useProjects";

// The homepage shows a taste; /platforms and /projects list everything.
const MAX_PLATFORMS = 4;
const MAX_CLIENT_PROJECTS = 3;

function GroupHeading({ title, link, linkLabel }: { title: string; link: string; linkLabel: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">{title}</h3>
      <Link to={link} className="text-sm font-medium text-violet-300 hover:text-violet-200">
        {linkLabel} →
      </Link>
    </div>
  );
}

const Projects = () => {
  const projects = useProjects();
  const platforms = projects.filter((p) => p.type === "Internal platform").slice(0, MAX_PLATFORMS);
  const clientProjects = projects.filter((p) => p.type === "Client work").slice(0, MAX_CLIENT_PROJECTS);

  return (
    <Section id="projects">
      <SectionHeading
        eyebrow="Work"
        title="Selected projects"
        description="Our own platforms and client builds making a difference across Africa."
      />

      <div className="mt-16">
        <GroupHeading title="Our platforms" link="/platforms" linkLabel="All platforms" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((project) => (
            <ProjectCard key={project.slug} project={project} heading="h4" />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <GroupHeading title="Client work" link="/projects" linkLabel="More projects" />
        <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
          {clientProjects.map((project) => (
            <ProjectCard
              heading="h4"
              key={project.slug}
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
