import { Link } from "react-router-dom";
import { ArrowUpRight, Lock } from "lucide-react";
import { resolveImage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { projectPath, type Project } from "@/data/projects";

/** "Under NDA" marker for client work delivered under a non-disclosure agreement. */
export function NdaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border border-white/15 bg-slate-950/80 px-2.5 py-1 text-xs font-medium text-slate-100 backdrop-blur",
        className
      )}
    >
      <Lock aria-hidden className="h-3 w-3" />
      Under NDA
    </span>
  );
}

/**
 * A project card: platforms open their product page, client work its case
 * study. `heading` keeps the page's outline in order: h2 straight under a
 * page title, h3 under a section heading (the default), h4 under a group title.
 */
export function ProjectCard({
  project,
  className,
  heading: Heading = "h3",
}: {
  project: Project;
  className?: string;
  heading?: "h2" | "h3" | "h4";
}) {
  return (
    <Link to={projectPath(project)} className={className}>
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-violet-500/30 hover:bg-white/[0.05]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={resolveImage(project.image)}
            alt={project.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
            {project.category}
          </span>
          {project.nda && project.type === "Client work" && <NdaBadge className="absolute right-3 top-3" />}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <Heading className="mb-2 text-lg font-semibold text-white">{project.name}</Heading>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-300">{project.description}</p>
          <span className="inline-flex items-center text-sm font-medium text-violet-400">
            {project.type === "Internal platform" ? "View platform" : "View project"}
            <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
