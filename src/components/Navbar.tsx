import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, type To } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { services } from "@/data/services";
import { team } from "@/data/team";
import { useProjects } from "@/hooks/useProjects";
import { LogoMark } from "@/components/LogoMark";

type GroupKey = "services" | "work";

// Same rule as the homepage Team section: no link to /team until
// src/data/team.ts has someone in it, so the nav never leads to an empty page.
const hasTeam = team.length > 0;

const groups: Record<GroupKey, { label: string; eyebrow: string; description: string; all: To; allLabel: string }> = {
  services: {
    label: "Services",
    eyebrow: "Build capability",
    description: "Choose the product outcome you need.",
    all: { pathname: "/", hash: "#services" },
    allLabel: "All services",
  },
  work: {
    label: "Work",
    eyebrow: "Selected systems",
    description: "Platforms and client products in motion.",
    all: { pathname: "/", hash: "#projects" },
    allLabel: "All projects",
  },
};

const linkBase =
  "relative inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[0.95rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

/** Underline shown under the active / open nav item. */
const Indicator = ({ on }: { on: boolean }) => (
  <span
    aria-hidden
    className={cn(
      "absolute inset-x-3 -bottom-0.5 h-px origin-center scale-x-0 bg-gold-300 transition-transform duration-200",
      on && "scale-x-100"
    )}
  />
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const location = useLocation();
  const projects = useProjects();
  const featuredProjects = [
    ...projects.filter((p) => p.type === "Internal platform").slice(0, 3),
    ...projects.filter((p) => p.type === "Client work").slice(0, 1),
  ];

  // Scroll state, throttled to one update per frame. The progress bar is
  // driven through a ref so scrolling doesn't re-render the whole navbar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      setIsScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close menus whenever the route (or hash) changes.
  useEffect(() => {
    setIsOpen(false);
    setOpenGroup(null);
  }, [location.pathname, location.hash]);

  // Escape closes whatever is open; clicks outside close the desktop panel.
  useEffect(() => {
    if (!openGroup && !isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
      setOpenGroup(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openGroup, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Route changes close menus via the effect above; this covers clicks that
  // don't change the URL (same page, or the same #section clicked twice).
  const onNavigate = (to: To) => {
    setIsOpen(false);
    setOpenGroup(null);
    if (typeof to === "object" && to.hash && to.pathname === location.pathname && to.hash === location.hash) {
      document.getElementById(to.hash.slice(1))?.scrollIntoView({ block: "start" });
    }
  };

  const path = location.pathname;
  const cta = path.startsWith("/projects/")
    ? "Build something similar"
    : path.startsWith("/services/")
    ? "Discuss this service"
    : "Start a project";
  const isActive = {
    services: path.startsWith("/services"),
    work: path.startsWith("/projects"),
    writing: path.startsWith("/blog"),
    team: path === "/team",
  };

  const panelLink =
    "group flex items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-colors hover:border-white/10 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

  const renderPanel = (key: GroupKey) => {
    const group = groups[key];
    return (
      <div
        id={`${panelId}-${key}`}
        className="absolute left-1/2 top-[calc(100%+0.5rem)] w-[40rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#16161a] p-2 shadow-2xl shadow-black/50 animate-in fade-in-0 slide-in-from-top-1 duration-150"
      >
        <div className="grid grid-cols-[13rem_1fr] gap-2">
          <div className="flex flex-col justify-between rounded-xl bg-white/[0.03] p-5">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-gold-300">
                {group.eyebrow}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{group.description}</p>
            </div>
            <Link
              onClick={() => onNavigate(group.all)}
              to={group.all}
              className="mt-6 inline-flex items-center text-sm font-medium text-violet-300 transition-colors hover:text-white"
            >
              {group.allLabel}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-1">
            {key === "services"
              ? services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      onClick={() => onNavigate(`/services/${service.slug}`)}
                      to={`/services/${service.slug}`} className={panelLink}>
                      <service.icon
                        aria-hidden
                        className="h-5 w-5 flex-shrink-0 text-violet-300 transition-colors group-hover:text-gold-300 group-focus-visible:text-gold-300"
                        strokeWidth={1.5}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-white">{service.shortTitle}</span>
                        <span className="block truncate text-sm text-slate-400">{service.outcome}</span>
                      </span>
                    </Link>
                  </li>
                ))
              : featuredProjects.map((project) => (
                  <li key={project.slug}>
                    <Link
                      onClick={() => onNavigate(`/projects/${project.slug}`)}
                      to={`/projects/${project.slug}`} className={panelLink}>
                      <img
                        src={project.image}
                        alt=""
                        width={56}
                        height={40}
                        loading="lazy"
                        className="h-10 w-14 flex-shrink-0 rounded-md object-cover opacity-90"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-white">{project.name}</span>
                        <span className="block truncate text-sm text-slate-400">{project.category}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300" />
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
      </div>
    );
  };

  const mobileLinks: { label: string; to: To; description: string }[] = [
    { label: "Studio", to: { pathname: "/", hash: "#about" }, description: "Who we are and how we work" },
    { label: "Services", to: { pathname: "/", hash: "#services" }, description: "Web, mobile, custom systems, design" },
    { label: "Work", to: { pathname: "/", hash: "#projects" }, description: "Our platforms and client builds" },
    { label: "Writing", to: "/blog", description: "Engineering notes and insights" },
    ...(hasTeam ? [{ label: "Team", to: "/team", description: "The people behind the work" }] : []),
    { label: "Contact", to: "/contact", description: "Send a project brief" },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-200",
          isScrolled || openGroup
            ? "border-white/[0.06] bg-[#09090b]/85 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
        onMouseLeave={() => setOpenGroup(null)}
      >
        <div
          ref={progressRef}
          aria-hidden
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-violet-500 via-violet-300 to-gold-300"
        />

        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8"
          aria-label="Primary"
        >
          <Link
            onClick={() => onNavigate("/")}
            to="/"
            className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Nesisoft home"
          >
            <LogoMark className="transition-transform duration-200 group-hover:scale-105" />
            <span className="text-lg font-bold leading-none tracking-[-0.02em] text-white">
              Nesisoft
            </span>
          </Link>

          <div ref={navRef} className="relative hidden lg:block">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  onClick={() => onNavigate({ pathname: "/", hash: "#about" })}
                  to={{ pathname: "/", hash: "#about" }}
                  className={cn(linkBase, "text-slate-300 hover:text-white")}
                >
                  Studio
                </Link>
              </li>
              {(Object.keys(groups) as GroupKey[]).map((key) => {
                const open = openGroup === key;
                return (
                  <li key={key} onMouseEnter={() => setOpenGroup(key)}>
                    <button
                      type="button"
                      onClick={() => setOpenGroup(open ? null : key)}
                      aria-expanded={open}
                      aria-controls={`${panelId}-${key}`}
                      className={cn(
                        linkBase,
                        open || isActive[key] ? "text-white" : "text-slate-300 hover:text-white"
                      )}
                    >
                      {groups[key].label}
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                          open && "rotate-180 text-violet-300"
                        )}
                      />
                      <Indicator on={open || isActive[key]} />
                    </button>
                    {/* Panel follows its trigger in the DOM, so Tab moves
                        straight from "Services" into the services list. */}
                    {open && renderPanel(key)}
                  </li>
                );
              })}
              <li onMouseEnter={() => setOpenGroup(null)}>
                <Link
                  onClick={() => onNavigate("/blog")}
                  to="/blog"
                  aria-current={isActive.writing ? "page" : undefined}
                  className={cn(linkBase, isActive.writing ? "text-white" : "text-slate-300 hover:text-white")}
                >
                  Writing
                  <Indicator on={isActive.writing} />
                </Link>
              </li>
              {hasTeam && (
                <li>
                  <Link
                    onClick={() => onNavigate("/team")}
                    to="/team"
                    aria-current={isActive.team ? "page" : undefined}
                    className={cn(linkBase, isActive.team ? "text-white" : "text-slate-300 hover:text-white")}
                  >
                    Team
                    <Indicator on={isActive.team} />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <a
              href={siteConfig.contact.phonePrimary.href}
              className={cn(linkBase, "text-slate-300 hover:text-white")}
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call
            </a>
            <Button
              asChild
              className="group ml-2 h-10 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              <Link
                onClick={() => onNavigate("/contact")}
                to="/contact">
                {cta}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:hidden"
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {/* Focus target for the skip link: the next Tab lands in page content. */}
      <div id="main-content" tabIndex={-1} className="outline-none" />

      {/* Rendered OUTSIDE <header> on purpose: the header gains
          `backdrop-filter` on scroll, which makes it a containing block for
          `position: fixed` descendants — that's what was making the open
          menu collapse to the header's height once the page scrolled. */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[70] flex flex-col bg-[#0f0f12] animate-in fade-in-0 duration-150 lg:hidden"
        >
          <div className="flex h-16 flex-shrink-0 items-center justify-between px-6">
            <Link
              onClick={() => onNavigate("/")}
              to="/" className="flex items-center gap-2.5" aria-label="Nesisoft home">
              <LogoMark />
              <span className="text-lg font-bold tracking-[-0.02em] text-white">Nesisoft</span>
            </Link>
            <button
              type="button"
              autoFocus
              onClick={() => {
                setIsOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {mobileLinks.map((item, i) => (
                <li key={item.label}>
                  <Link
                    onClick={() => onNavigate(item.to)}
                    to={item.to}
                    className="group flex items-center justify-between gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both"
                    style={{ animationDelay: `${40 + i * 30}ms` }}
                  >
                    <span>
                      <span className="block text-2xl font-semibold tracking-[-0.02em] text-white">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-400">{item.description}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid flex-shrink-0 grid-cols-2 gap-2 border-t border-white/[0.06] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <a
              href={siteConfig.contact.phonePrimary.href}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call us
            </a>
            <Button asChild className="h-12 rounded-xl bg-white text-sm font-semibold text-slate-950 hover:bg-slate-200">
              <Link
                onClick={() => onNavigate("/contact")}
                to="/contact">Start a project</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
