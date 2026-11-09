import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
  FlaskConical,
  Palette,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd, serviceJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { ApproachCards } from "@/components/ApproachCards";
import { useEstimator } from "@/hooks/useEstimator";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";
import {
  CALCULATOR_PATH,
  computeEstimate,
  defaultOption,
  featureApplies,
  formatRange,
  formatWeeks,
  savingLabel,
  type EstimatorConfig,
  type EstimatorMultiplier,
} from "@shared/estimator.js";

const PATH = "/services/ai-assisted-development";
const TITLE = "AI-Assisted Software Development";
const DESCRIPTION =
  "Build web and mobile apps faster and for less with Nesisoft's AI-assisted teams in Accra. AI speeds up the routine work; our engineers stay in charge.";

/** The calculator with an approach already chosen. */
const calculatorWith = (approach: string) => `${CALCULATOR_PATH}?approach=${approach}#calculator`;

/** "About 20% less" → 20; "faster" works from the weeks multiplier. */
const percentLess = (factor: number) => Math.round((1 - factor) * 100);

// Where AI speeds things up, stage by stage.
const STAGES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FileText,
    title: "Specs and planning",
    description: "AI helps turn your brief into user stories, acceptance criteria and a first plan, which we refine with you.",
  },
  {
    icon: Palette,
    title: "Design",
    description: "We explore layouts and variations quickly, so you see more options sooner, before anything is built.",
  },
  {
    icon: Code2,
    title: "Coding",
    description: "AI drafts routine code, from forms and screens to API endpoints, so engineers spend their time on the hard parts.",
  },
  {
    icon: FlaskConical,
    title: "Testing",
    description: "AI suggests test cases and edge cases, and helps write the automated tests that guard every release.",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Technical docs, API references and handover guides are drafted as we go, not left to the end.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description: "Faster bug fixing, upgrades and clean-ups on existing systems, including code nobody has touched in years.",
  },
];

// What AI doesn't decide.
const SAFEGUARDS = [
  {
    title: "Engineers make the decisions",
    description: "Architecture, security, data design and trade-offs are decided by experienced people, not tools.",
  },
  {
    title: "Everything is reviewed and tested",
    description: "AI-drafted work goes through the same code review and testing as everything else before it ships.",
  },
  {
    title: "Your data stays private",
    description: "Confidential data, customer records and credentials are kept out of AI prompts, and we're happy to sign an NDA first.",
  },
  {
    title: "You get normal, maintainable code",
    description: "Clean, documented code that your team or any developer can work with, handed over like any other project.",
  },
];

/** A typical mobile app (the first project type if there's no "mobile"), priced each way. */
function sampleComparison(config: EstimatorConfig) {
  const type = config.types.find((t) => t.id === "mobile") ?? config.types[0];
  if (!type) return null;
  const wanted = ["accounts", "payments", "admin", "notifications"];
  const features = config.features.filter((f) => wanted.includes(f.id) && featureApplies(f, type));
  const rows = config.approaches.map((approach) => ({
    approach,
    estimate: computeEstimate(config, {
      type,
      size: defaultOption(config.sizes),
      design: defaultOption(config.designs),
      approach,
      pace: defaultOption(config.paces),
      features,
    }),
  }));
  return { type, features, rows, max: Math.max(...rows.map((row) => row.estimate.high)) };
}

const lowerFirst = (text: string) => (/^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text);

function faqsFor(config: EstimatorConfig) {
  const cheaper = config.approaches.filter((a) => a.factor < 1);
  const savings = cheaper
    .map((a) => {
      const faster = percentLess(a.weeksFactor);
      return `${lowerFirst(a.label)}, ${savingLabel(a).toLowerCase()}${faster > 0 ? ` and about ${faster}% faster` : ""}`;
    })
    .join("; ");
  return [
    {
      question: "What is AI-assisted software development?",
      answer:
        "It's software built by experienced engineers who use AI tools to speed up the routine parts: drafting code, tests and documentation, exploring designs and making sense of existing code. People still design the system, review the work and decide what ships.",
    },
    ...(savings
      ? [
          {
            question: "How much can AI save on my project?",
            answer: `As a guide, compared with a traditional team: ${savings}. The saving depends on the project, so use our cost calculator to compare the three ways for yours.`,
          },
        ]
      : []),
    {
      question: "Is AI-written code safe and reliable?",
      answer:
        "It's held to the same standard as any code we ship: an engineer reviews it, it's tested, and it's checked for security issues before release. AI makes the routine work faster; it doesn't decide what's good enough.",
    },
    {
      question: "What's the difference between an AI-assisted and an AI-native team?",
      answer:
        "An AI-assisted team works in the same flexible sprints as a traditional team, so the scope can change as you go. An AI-native team is smaller and leans further on AI, working from a detailed specification agreed before work starts; changes after sign-off are quoted separately. That's why it costs less, and why it suits MVPs and new products with a clear scope.",
    },
    {
      question: "Will my idea and data stay confidential?",
      answer:
        "Yes. Confidential data, customer records and credentials are kept out of AI prompts, and we're happy to sign an NDA before you share the details.",
    },
    {
      question: "Can you use AI on an existing system?",
      answer:
        "Yes. AI is especially useful for understanding unfamiliar code, writing tests around it before anything changes, and speeding up upgrades. An AI-assisted team suits existing systems best, since the work tends to change as we learn.",
    },
  ];
}

/** One app priced three ways: the saving at a glance, from the live price list. */
function Comparison({ config }: { config: EstimatorConfig }) {
  const sample = sampleComparison(config);
  if (!sample) return null;
  const featureList = sample.features.map((f) => lowerFirst(f.label)).join(", ");
  return (
    <div className="border border-white/10 bg-[#111114] p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
          One {lowerFirst(sample.type.label)}, three ways to build it
        </h2>
        <Link to={CALCULATOR_PATH} className="text-sm font-medium text-violet-300 hover:text-white">
          Price your own project →
        </Link>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Medium-sized, custom design{featureList ? `, with ${featureList}` : ""}. From our cost calculator's current prices.
      </p>
      <ul className="mt-8 space-y-6">
        {sample.rows.map(({ approach, estimate }) => (
          <li key={approach.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="font-medium text-white">
                {approach.label}
                {approach.factor < 1 && (
                  <span className="ml-2 font-mono text-xs text-gold-300">{savingLabel(approach)}</span>
                )}
              </span>
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-white">{formatRange(estimate)}</span> · {formatWeeks(estimate)}
              </span>
            </div>
            <div className="mt-2 h-3 bg-white/[0.06]" aria-hidden>
              <div
                className={cn(
                  "h-full",
                  approach.factor < 1 ? "bg-gradient-to-r from-violet-600 to-gold-300" : "bg-slate-400/60"
                )}
                style={{ width: `${Math.round((estimate.high / sample.max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * /services/ai-assisted-development: how we use AI to build software faster
 * and for less, the three ways to build (with savings from /admin →
 * Pricing), what stays in human hands, and questions. Every call to action
 * opens the cost calculator with an approach already chosen.
 */
const AiDevelopment = () => {
  const config = useEstimator();
  const faqs = faqsFor(config);
  const best = config.approaches.reduce<EstimatorMultiplier | null>(
    (min, a) => (!min || a.factor < min.factor ? a : min),
    null
  );
  const fastest = config.approaches.reduce<EstimatorMultiplier | null>(
    (min, a) => (!min || a.weeksFactor < min.weeksFactor ? a : min),
    null
  );
  const stats = [
    best && best.factor < 1 ? { value: `Up to ${percentLess(best.factor)}% less`, label: "on the development budget" } : null,
    fastest && fastest.weeksFactor < 1
      ? { value: `Up to ${percentLess(fastest.weeksFactor)}% faster`, label: "from kickoff to launch" }
      : null,
    { value: "Engineers in charge", label: "of every decision and release" },
  ].filter(Boolean);

  return (
    <>
      <Seo
        title="AI-Assisted Software Development in Ghana"
        description={DESCRIPTION}
        jsonLd={[
          serviceJsonLd({ title: TITLE, description: DESCRIPTION, slug: "ai-assisted-development" }),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
          breadcrumbsJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: "AI-assisted development", path: PATH },
          ]),
        ]}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          backTo="/services"
          backLabel="All services"
          eyebrow="AI-assisted development"
          title="Software built faster, for less, with AI"
          description="We use AI across planning, design, coding, testing and documentation, so your product ships sooner and costs less. Our engineers stay in charge of every decision."
        >
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
              <Link to={calculatorWith("ai-assisted")}>
                Estimate with an AI team <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-3xl gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.value} className="bg-[#0c0c0f] p-5">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-bold tracking-tight text-gold-300">{stat.value}</span>
                  <span className="mt-1 block text-sm text-slate-400">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </PageHeader>

        <Section className="pt-4">
          <Comparison config={config} />
        </Section>

        <Section id="approaches">
          <SectionHeading
            align="left"
            eyebrow="Delivery models"
            title="Three ways to build it"
            description="Choose how much of the work AI takes on. The more it does, the lower the cost, with the trade-offs below."
          />
          <ApproachCards
            className="mt-12"
            approaches={config.approaches}
            selected="ai-assisted"
            action={(approach, chosen) => (
              <Button
                asChild
                variant={chosen ? "default" : "outline"}
                className={cn(
                  "h-11 w-full",
                  chosen
                    ? "bg-violet-600 text-white hover:bg-violet-500"
                    : "border-white/15 bg-transparent text-white hover:bg-white/[0.06]"
                )}
              >
                <Link to={calculatorWith(approach.id)}>
                  Estimate with this model <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          />
          <p className="mt-6 text-sm text-slate-400">
            Not sure? The AI-assisted team, highlighted above, is a good default: you keep flexible sprints and still save.
          </p>
        </Section>

        <Section>
          <SectionHeading
            align="left"
            eyebrow="How we use it"
            title="Where AI speeds things up"
            description="AI earns its place in every stage of the work, from the first plan to looking after the product once it's live."
          />
          <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map(({ icon: Icon, title, description }, i) => (
              <div key={title} className="bg-[#0c0c0f] p-6">
                <div className="flex items-center justify-between">
                  <Icon aria-hidden className="h-6 w-6 text-violet-300" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading
              align="left"
              eyebrow="What stays human"
              title="AI drafts. People decide."
              description="Speed only helps if what ships is right. These don't change, whichever way you build."
            />
            <ul className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
              {SAFEGUARDS.map((item) => (
                <li key={item.title} className="bg-[#0c0c0f] p-6">
                  <CheckCircle2 aria-hidden className="h-5 w-5 text-gold-300" />
                  <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section>
          <SectionHeading
            align="left"
            eyebrow="Works with every service"
            title="AI-assisted, whatever you're building"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  className="group border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]"
                >
                  <Icon aria-hidden className="h-6 w-6 text-violet-300" strokeWidth={1.5} />
                  <h3 className="mt-4 font-semibold text-white">{service.shortTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{service.outcome}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-violet-300">
                    Explore
                    <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Section>

        <Section id="faq">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeading align="left" eyebrow="Questions" title="Good to know" />
            <div className="divide-y divide-white/10 border-y border-white/10">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                    {faq.question}
                    <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <div className="flex flex-col items-start gap-6 border border-white/10 bg-gradient-to-br from-violet-600/20 via-white/[0.03] to-transparent p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">See the difference</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                What would your project cost with an AI team?
              </h2>
              <p className="mt-3 max-w-xl text-slate-300">
                Answer six quick questions and compare a traditional, AI-assisted and AI-native build in about a minute.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
                <Link to={calculatorWith("ai-assisted")}>
                  Open the cost calculator <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
                <Link to="/contact">Send a brief</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default AiDevelopment;
