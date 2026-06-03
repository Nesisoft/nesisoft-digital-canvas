import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { siteConfig } from "@/config/site";
import { HeroChat } from "@/components/HeroChat";
import { useSiteContent } from "@/hooks/useSiteContent";

// Cycled in the headline. Kept short and similar in length to limit reflow.
const HEADLINE_PHRASES = [
  "African businesses forward",
  "startups to market",
  "bold ideas to launch",
  "teams ahead",
];

const Hero = () => {
  const content = useSiteContent();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;
    const id = setInterval(
      () => setPhrase((p) => (p + 1) % HEADLINE_PHRASES.length),
      2800
    );
    return () => clearInterval(id);
  }, []);

  const stats = [
    {
      id: "projects",
      title: "10+",
      subtitle: "Projects delivered",
      modalTitle: "Projects Delivered",
      description:
        "We've shipped over 10 projects across fintech, e-commerce, healthcare and education — from first concept to production and beyond.",
      highlights: [
        "Custom web applications built on modern frameworks",
        "Native and cross-platform mobile apps",
        "Enterprise systems and internal tools",
        "End-to-end product design",
      ],
      achievements: [
        "Delivered on schedule",
        "Ongoing support and maintenance",
        "Measurable outcomes for clients",
      ],
    },
    {
      id: "clients",
      title: "5+",
      subtitle: "Clients served",
      modalTitle: "Clients Served",
      description:
        "From early-stage startups to established organisations across Africa and beyond, our clients return to us for the next build.",
      highlights: [
        "Long-term partnerships",
        "Clear, regular communication",
        "Flexible engagement models",
        "Transparent project management",
      ],
      achievements: [
        "High rate of repeat business",
        "Referral-driven growth",
        "Industry-specific expertise",
      ],
    },
    {
      id: "experience",
      title: "5+",
      subtitle: "Years building",
      modalTitle: "Years of Experience",
      description:
        "More than five years refining how we plan, build and ship software — so your project benefits from proven process, not guesswork.",
      highlights: [
        "Agile delivery",
        "Modern, maintainable stacks",
        "Cross-functional collaboration",
        "Continuous improvement",
      ],
      achievements: [
        "Current with industry practice",
        "Many full product lifecycles",
        "A team that mentors and grows",
      ],
    },
    {
      id: "team",
      title: "5+",
      subtitle: "Specialists",
      modalTitle: "Our Team",
      description:
        "A focused team of engineers, designers and analysts who bring complementary expertise to every engagement.",
      highlights: [
        "Frontend and backend engineers",
        "Product and UI/UX designers",
        "Quality assurance",
        "Project managers and analysts",
      ],
      achievements: [
        "Cross-disciplinary by default",
        "Continuous skill development",
        "Collaborative problem-solving",
      ],
    },
  ];

  return (
    <>
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24"
      >
        <div className="relative z-10 mx-auto w-full max-w-6xl text-center">
          <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl sm:leading-[0.96] md:text-7xl">
            {content.hero.titleLead}
            {/* All phrases occupy the same grid cell, so the line is always
                sized to the tallest one — swapping them never shifts layout. */}
            <span className="mt-1 grid">
              {HEADLINE_PHRASES.map((p, i) => (
                <span
                  key={p}
                  aria-hidden={i !== phrase}
                  className={`col-start-1 row-start-1 text-violet-400 transition-opacity duration-500 ${
                    i === phrase ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {p}
                </span>
              ))}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            {content.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/contact">
              <Button className="group rounded-lg bg-violet-600 px-6 py-6 text-base font-medium text-white transition-colors hover:bg-violet-500">
                Start a project
                <ArrowRight
                  className="ml-2 transition-transform group-hover:translate-x-0.5"
                  size={18}
                />
              </Button>
            </Link>

            <a href={siteConfig.contact.phonePrimary.href}>
              <Button
                variant="outline"
                className="rounded-lg border-white/15 bg-transparent px-6 py-6 text-base font-medium text-white transition-colors hover:bg-white/5 hover:text-white"
              >
                <Phone size={18} className="mr-2" />
                Schedule a call
              </Button>
            </a>
          </div>

          {/* Animated conversation: lead → product ready for review */}
          <div className="mt-14">
            <HeroChat />
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-4">
            {stats.map((stat) => (
              <button
                key={stat.id}
                onClick={() => setOpenModal(stat.id)}
                className="bg-slate-950/40 p-6 text-center transition-colors hover:bg-white/[0.04]"
              >
                <div className="text-3xl font-semibold text-white">
                  {stat.title}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  {stat.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stat detail modals */}
      {stats.map((stat) => (
        <Dialog
          key={stat.id}
          open={openModal === stat.id}
          onOpenChange={(open) => setOpenModal(open ? stat.id : null)}
        >
          <DialogContent className="max-w-[95vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 sm:max-w-lg md:max-w-2xl">
            <button
              onClick={() => setOpenModal(null)}
              className="absolute right-4 top-4 z-50 rounded-full border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4 text-slate-300" />
            </button>

            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-2xl font-semibold text-white">
                {stat.modalTitle}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {stat.description}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-violet-400">
                  What we do
                </h3>
                <ul className="space-y-2.5">
                  {stat.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-[999px] bg-violet-400/70" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-emerald-400">
                  Track record
                </h3>
                <ul className="space-y-2.5">
                  {stat.achievements.map((achievement) => (
                    <li
                      key={achievement}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-[999px] bg-emerald-400/70" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-5">
              <Link to="/contact" onClick={() => setOpenModal(null)}>
                <Button className="w-full rounded-lg bg-violet-600 py-5 font-medium text-white hover:bg-violet-500">
                  Start your project
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default Hero;
