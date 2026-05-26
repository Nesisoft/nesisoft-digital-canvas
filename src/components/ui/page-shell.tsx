import { Link } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#101622] text-slate-100",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(56,189,248,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_32%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.16]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  children?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  backTo,
  backLabel = "Back",
  children,
  align = "left",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("px-6 pb-14 pt-28 lg:px-8", className)}>
      <div
        className={cn(
          "mx-auto max-w-7xl",
          align === "center" && "text-center"
        )}
      >
        {backTo && (
          <Link
            to={backTo}
            className="mb-8 inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        )}
        {eyebrow && (
          <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-violet-300">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon = <Inbox className="h-5 w-5" />,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
