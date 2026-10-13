import { cn } from "@/lib/utils";

/**
 * Shared layout primitives that give every section the same rhythm —
 * consistent vertical padding, container width and heading treatment.
 * Replaces the per-section copy-pasted backgrounds + ad-hoc spacing that
 * made the site feel pieced-together.
 */

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  containerClassName?: string;
}

export function Section({
  id,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-20", className)} {...props}>
      <div className={cn("mx-auto max-w-7xl px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.035em] text-white md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-slate-300">
          {description}
        </p>
      )}
    </div>
  );
}
