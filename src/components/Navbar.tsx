import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Layers3,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { services } from "@/data/services";
import { clientProjects, internalProjects } from "@/data/projects";

const sectionLinks = [
  { label: "Studio", href: "#about", description: "Who we are and how we work" },
  { label: "Contact", href: "/contact", description: "Send a project brief" },
];

const navGroups = [
  {
    key: "services",
    label: "Services",
    eyebrow: "Build capability",
    description: "Choose the product outcome you need.",
    icon: BriefcaseBusiness,
  },
  {
    key: "work",
    label: "Work",
    eyebrow: "Selected systems",
    description: "Platforms and client products in motion.",
    icon: Layers3,
  },
  {
    key: "writing",
    label: "Writing",
    eyebrow: "Engineering notes",
    description: "Practical thinking on building software.",
    icon: BookOpen,
  },
] as const;

type NavGroupKey = (typeof navGroups)[number]["key"];

function useSiteNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToHash = (hash: string) => {
    const element = document.getElementById(hash.replace("#", ""));
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", hash);
  };

  const goTo = (href: string) => {
    if (href.startsWith("#")) {
      if (location.pathname === "/") {
        scrollToHash(href);
      } else {
        navigate(`/${href}`);
      }
      return;
    }
    navigate(href);
  };

  return { goTo };
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<NavGroupKey | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { goTo } = useSiteNavigation();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setIsScrolled(window.scrollY > 24);
      setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const cta = useMemo(() => {
    if (location.pathname.startsWith("/projects/")) {
      return "Build similar";
    }
    if (location.pathname.startsWith("/services/")) {
      return "Discuss this";
    }
    if (location.pathname.startsWith("/blog")) {
      return "Talk to us";
    }
    return "Start a project";
  }, [location.pathname]);

  const handleNav = (href: string) => {
    setIsOpen(false);
    setOpenGroup(null);
    goTo(href);
  };

  const isGroupActive = (key: NavGroupKey) => {
    if (key === "services") return location.pathname.startsWith("/services");
    if (key === "work") return location.pathname.startsWith("/projects");
    if (key === "writing") return location.pathname.startsWith("/blog");
    return false;
  };

  const renderPanel = (key: NavGroupKey) => {
    if (key === "services") {
      return (
        <div className="grid gap-1.5">
          {services.map((service) => (
            <button
              key={service.slug}
              onClick={() => handleNav(`/services/${service.slug}`)}
              className="group flex items-start gap-3 rounded-2xl border border-slate-700 bg-[#202a3a] p-3.5 text-left transition-colors hover:border-violet-300/50 hover:bg-[#263247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/18 text-violet-200 ring-1 ring-violet-300/15">
                <service.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-white">
                  {service.shortTitle}
                </span>
                <span className="mt-0.5 block text-sm leading-5 text-slate-300">
                  {service.outcome}
                </span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-200" />
            </button>
          ))}
        </div>
      );
    }

    if (key === "work") {
      return (
        <div className="grid gap-2">
          {[...internalProjects.slice(0, 3), ...clientProjects.slice(0, 1)].map(
            (project) => (
              <button
                key={project.slug}
                onClick={() => handleNav(`/projects/${project.slug}`)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-700 bg-[#202a3a] p-3 text-left transition-colors hover:border-violet-300/50 hover:bg-[#263247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <img
                  src={project.image}
                  alt=""
                  className="h-12 w-16 rounded-lg object-cover opacity-85"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-white">
                    {project.name}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-slate-300">
                    {project.category}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300" />
              </button>
            )
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-slate-700 bg-[#202a3a] p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/18 text-violet-200 ring-1 ring-violet-300/15">
          <BookOpen className="h-5 w-5" />
        </div>
        <p className="font-medium text-white">Engineering blog</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Notes on mobile, web, AI, delivery, and building for African markets.
        </p>
        <button
          onClick={() => handleNav("/blog")}
          className="mt-5 inline-flex items-center text-sm font-medium text-violet-300 transition-colors hover:text-white"
        >
          Read articles
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        isScrolled
          ? "bg-[#111827]/86 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl"
          : "bg-transparent"
      )}
      onMouseLeave={() => setOpenGroup(null)}
    >
      <div
        className="absolute left-0 top-0 h-px bg-violet-300/80 transition-[width] duration-150"
        style={{ width: `${Math.min(scrollProgress * 100, 100)}%` }}
      />

      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link
          to="/"
          className="group flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/[0.075] text-sm font-bold text-white transition-colors group-hover:border-violet-300/40 group-hover:bg-violet-500/18">
            <span className="absolute inset-0 rounded-lg bg-violet-400/0 blur-md transition-colors group-hover:bg-violet-400/20" />
            <span className="relative">N</span>
          </span>
          <span>
            <span className="block text-lg font-bold leading-none tracking-[-0.02em] text-white">
              Nesisoft
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400 lg:block">
              Software studio
            </span>
          </span>
        </Link>

        <div className="relative hidden lg:block">
          <div className="flex items-center gap-8">
            {sectionLinks.slice(0, 1).map((item, index) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.href)}
                className="group flex h-10 items-center gap-2.5 rounded-lg text-lg font-semibold text-slate-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <span className="font-mono text-xs tracking-[0.12em] text-violet-300/80 group-hover:text-violet-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </button>
            ))}

            {navGroups.map((group, index) => {
              const Icon = group.icon;
              const active = isGroupActive(group.key);
              return (
                <button
                  key={group.key}
                  onMouseEnter={() => setOpenGroup(group.key)}
                  onFocus={() => setOpenGroup(group.key)}
                  onClick={() =>
                    setOpenGroup(openGroup === group.key ? null : group.key)
                  }
                  aria-expanded={openGroup === group.key}
                className={cn(
                    "group relative flex h-10 items-center gap-2.5 rounded-lg text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                    active || openGroup === group.key
                      ? "text-white"
                      : "text-slate-100 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-xs tracking-[0.12em] transition-colors",
                      active || openGroup === group.key
                        ? "text-violet-300"
                        : "text-violet-300/70 group-hover:text-violet-200"
                    )}
                  >
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <Icon className="h-4 w-4 text-slate-300 transition-colors group-hover:text-violet-300" />
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-300 transition-transform",
                      openGroup === group.key && "rotate-180 text-violet-300"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-1 h-px origin-center scale-x-0 bg-violet-300 transition-transform duration-200",
                      (active || openGroup === group.key) && "scale-x-100"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {openGroup && (
            <div
              className="absolute left-1/2 top-[calc(100%+0.75rem)] w-[42rem] -translate-x-1/2 rounded-3xl border border-slate-700 bg-[#172033] p-3 shadow-2xl shadow-black/45"
              onMouseEnter={() => setOpenGroup(openGroup)}
            >
              <div className="grid gap-3 lg:grid-cols-[15rem_1fr]">
                <div className="rounded-2xl border border-slate-700 bg-[#202a3a] p-5">
                  {(() => {
                    const group = navGroups.find((item) => item.key === openGroup)!;
                    const Icon = group.icon;
                    return (
                      <>
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/18 text-violet-200 ring-1 ring-violet-300/15">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-violet-300">
                          {group.eyebrow}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {group.description}
                        </p>
                      </>
                    );
                  })()}
                </div>
                {renderPanel(openGroup)}
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={siteConfig.contact.phonePrimary.href}
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.045] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <Button
            onClick={() => handleNav("/contact")}
            className="group h-10 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            {cta}
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
    </header>

    {/* Rendered OUTSIDE <header> on purpose: the header gains
        `backdrop-filter` on scroll, which makes it a containing block for
        `position: fixed` descendants — that's what was making the open
        menu collapse to the header's height once the page scrolled. */}
    {isOpen && (
        <div className="fixed inset-0 z-[70] bg-[#0b0d12] lg:hidden">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] text-sm font-bold text-white">
                N
              </span>
              <span className="text-lg font-bold tracking-[-0.02em] text-white">
                Nesisoft
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.08] text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-[calc(100svh-4rem)] overflow-y-auto px-4 pb-6 pt-5 sm:px-6">
            <div className="mb-6">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-violet-300">
                Navigation
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
                Jump to the studio, services, work, writing, or start a project.
              </p>
            </div>

            <div className="grid gap-2">
              {sectionLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.href)}
                  className="flex items-center justify-between rounded-2xl bg-[#1b2536] p-4 text-left"
                >
                  <span>
                    <span className="block text-lg font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm text-slate-300">
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-2">
              {navGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <button
                    key={group.key}
                    onClick={() =>
                      handleNav(
                        group.key === "services"
                          ? "#services"
                          : group.key === "work"
                          ? "#projects"
                          : "/blog"
                      )
                    }
                    className="flex items-center gap-4 rounded-2xl bg-[#1b2536] p-4 text-left"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/18 text-violet-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-white">
                        {group.label}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-slate-300">
                        {group.description}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-2 bg-[#0b0d12] pt-3">
              <a
                href={siteConfig.contact.phonePrimary.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1b2536] text-sm font-medium text-white"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <Button
                onClick={() => handleNav("/contact")}
                className="h-12 rounded-xl bg-white text-sm font-semibold text-slate-950 hover:bg-slate-200"
              >
                {cta}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
