import { resolveImage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

/** Shared by the platform pages (/platforms and /platforms/<slug>). */

type Status = Project["status"];

/** A product's status in product words: "Completed" is live. */
const PLATFORM_STATUS_LABEL: Record<Status, string> = {
  Completed: "Live",
  "Beta testing": "In beta",
  "In development": "In development",
};

const STATUS_STYLE: Record<Status, string> = {
  Completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  "Beta testing": "border-amber-400/25 bg-amber-400/10 text-amber-200",
  "In development": "border-sky-400/25 bg-sky-400/10 text-sky-200",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("inline-flex items-center border px-2.5 py-1 text-xs font-medium", STATUS_STYLE[status], className)}>
      {PLATFORM_STATUS_LABEL[status]}
    </span>
  );
}

/** The product's logo, or its initial on the brand gradient until there is one. */
export function PlatformMark({
  project,
  size = "md",
}: {
  project: Pick<Project, "name" | "logo">;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-14 w-14 text-2xl" : "h-10 w-10 text-lg";
  if (project.logo) {
    return (
      <img
        src={resolveImage(project.logo)}
        alt={`${project.name} logo`}
        className={cn(box, "flex-shrink-0 border border-white/10 bg-white object-contain p-1")}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        box,
        "flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-violet-500 to-violet-800 font-display font-bold text-white"
      )}
    >
      {project.name.charAt(0)}
    </span>
  );
}
