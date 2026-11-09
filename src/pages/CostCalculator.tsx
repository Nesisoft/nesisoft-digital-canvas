import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Database,
  FileText,
  Globe,
  Languages,
  LayoutDashboard,
  Link2,
  MapPin,
  MessageSquare,
  MonitorSmartphone,
  Palette,
  Plug,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Users,
  UserRound,
  Wallet,
  WifiOff,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";
import { useEstimator } from "@/hooks/useEstimator";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  CALCULATOR_PATH,
  CURRENCY_SYMBOLS,
  computeEstimate,
  defaultOption,
  estimatePath,
  featureApplies,
  formatNumber,
  formatRange,
  formatWeeks,
  resolveSelection,
  savingLabel,
  startingEstimate,
  typicalEstimate,
  type Currency,
  type Estimate,
  type EstimatorConfig,
  type EstimatorMultiplier,
} from "@shared/estimator.js";

const TYPE_ICONS: Record<string, LucideIcon> = {
  website: Globe,
  ecommerce: ShoppingCart,
  webapp: LayoutDashboard,
  mobile: Smartphone,
  "mobile-web": MonitorSmartphone,
};

const FEATURE_ICONS: Record<string, LucideIcon> = {
  accounts: UserRound,
  payments: Wallet,
  admin: LayoutDashboard,
  cms: FileText,
  roles: ShieldCheck,
  notifications: Bell,
  bookings: CalendarDays,
  chat: MessageSquare,
  maps: MapPin,
  reports: BarChart3,
  offline: WifiOff,
  languages: Languages,
  integrations: Plug,
};

const CURRENCY_NAMES: Record<Currency, string> = { GHS: "Ghana cedis", USD: "US dollars" };

const APPROACH_ICONS: Record<string, LucideIcon> = {
  traditional: Users,
  "ai-assisted": Sparkles,
  "ai-native": Bot,
};

// How each build approach runs, for the comparison under the calculator.
const APPROACH_DETAILS: Record<string, { badge: string; delivery: string; bestFor: string }> = {
  traditional: {
    badge: "Iterative",
    delivery: "The scope evolves sprint by sprint: plan, build, review, adjust.",
    bestFor: "Projects whose scope will change as you learn from your users.",
  },
  "ai-assisted": {
    badge: "Iterative + AI",
    delivery: "The same sprints, with AI drafting code, tests and documentation for our engineers to review.",
    bestFor: "Most projects, including existing systems that need to move faster.",
  },
  "ai-native": {
    badge: "Spec-first",
    delivery: "We agree a detailed specification first, then build to it in milestones.",
    bestFor: "MVPs and new products with a clear, fixed scope.",
  },
};

// What moves the price, for people reading before (or instead of) clicking.
const DRIVERS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Boxes,
    title: "Scope",
    description:
      "How many screens it has and how many kinds of user. A booking site for one clinic is far smaller than a platform for patients, doctors and administrators.",
  },
  {
    icon: MonitorSmartphone,
    title: "Platforms",
    description:
      "A website, an Android and iOS app, or both. Cross-platform apps share most of their code, so the second platform costs much less than the first.",
  },
  {
    icon: Sparkles,
    title: "Features",
    description:
      "Payments, chat, maps, offline mode and connections to other systems each add design, building and testing time.",
  },
  {
    icon: Palette,
    title: "Design",
    description:
      "An adapted template is the quickest route. Custom and premium design take longer, and make the product feel like yours.",
  },
  {
    icon: Database,
    title: "Data and content",
    description:
      "Moving records from spreadsheets or an old system, and writing or translating content, take time the calculator can't see.",
  },
  {
    icon: CalendarClock,
    title: "Deadline",
    description:
      "A firm, early launch date means a bigger team working in parallel, which costs more than a steady pace.",
  },
];

// Paid to other providers, so not part of an estimate.
const RUNNING_COSTS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Globe,
    title: "Hosting and domain",
    description: "Servers, the database and your web address, paid monthly or yearly to the provider.",
  },
  {
    icon: Smartphone,
    title: "App store accounts",
    description: "Google Play charges a one-off US$25 to register. Apple's developer program costs US$99 a year.",
  },
  {
    icon: Wallet,
    title: "Payment and SMS fees",
    description: "Mobile money, card and SMS providers charge per transaction or per message.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description:
      "Security fixes, updates for new phones and browsers, and improvements. Many businesses budget around 15–20% of the build cost a year.",
  },
];

interface Answers {
  type: string;
  size: string;
  design: string;
  approach: string;
  pace: string;
  features: string[];
}

function startingAnswers(config: EstimatorConfig): Answers {
  return {
    type: "",
    size: defaultOption(config.sizes).id,
    design: defaultOption(config.designs).id,
    approach: defaultOption(config.approaches).id,
    pace: defaultOption(config.paces).id,
    features: [],
  };
}

/** Answers from a shared link (?type=mobile&size=medium&features=accounts,payments…). */
function answersFromLink(search: string, fallback: Answers): { answers: Answers; currency: Currency } | null {
  const params = new URLSearchParams(search);
  const type = params.get("type");
  if (!type) return null;
  return {
    answers: {
      type,
      size: params.get("size") || fallback.size,
      design: params.get("design") || fallback.design,
      approach: params.get("approach") || fallback.approach,
      pace: params.get("pace") || fallback.pace,
      features: (params.get("features") ?? "").split(",").filter(Boolean).slice(0, 50),
    },
    currency: params.get("currency") === "USD" ? "USD" : "GHS",
  };
}

const money = (amount: number, currency: Currency) => `${CURRENCY_SYMBOLS[currency]}${formatNumber(amount)}`;
const low = (estimate: Estimate, currency: Currency) => (currency === "USD" ? estimate.usdLow : estimate.low);

/** "Mobile app" → "mobile app", but "CRM system" stays as it is. */
const lowerFirst = (text: string) => (/^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text);

/** The questions and answers, some worked out from the live price list so they always agree with it. */
function faqsFor(config: EstimatorConfig) {
  const starts = config.types
    .map((type) => `${lowerFirst(type.label)}, about ${money(startingEstimate(config, type).low, "GHS")}`)
    .join("; ");
  const timelines = config.types
    .map((type) => `${lowerFirst(type.label)}, ${formatWeeks(typicalEstimate(config, type))}`)
    .join("; ");
  // Only the approaches that cost less than the traditional team.
  const savings = config.approaches
    .filter((approach) => approach.factor < 1)
    .map((approach) => `${lowerFirst(approach.label)}, ${savingLabel(approach).toLowerCase()}`)
    .join("; ");
  const specFirst = config.approaches.find((approach) => approach.id === "ai-native" && approach.factor < 1);
  const aiFaq = savings
    ? [
        {
          question: "Does using AI make building an app cheaper?",
          answer: `It can, if you choose it. We use AI across our work, and you decide how much of the build it takes on: ${savings}, compared with a traditional team. Our engineers stay responsible for everything that's built.${
            specFirst
              ? ` An ${specFirst.label.replace(/ team$/i, "")} build works from a specification agreed before work starts, so changes after that are quoted separately.`
              : ""
          }`,
        },
      ]
    : [];
  return [
    {
      question: "How much does it cost to build an app or website in Ghana?",
      answer: `It depends on what it needs to do. As a guide, our starting prices are: ${starts}. Features such as payments, chat or maps, a premium design or a tight deadline add to that. Use the calculator on this page for a range that fits your project.`,
    },
    {
      question: "How long does it take to build an app?",
      answer: `Typical timelines from kickoff to launch, for a medium-sized build: ${timelines}. Each feature you add takes time too, and a firm deadline can be met by adding people to the team.`,
    },
    ...aiFaq,
    {
      question: "Why is the estimate a range and not a fixed price?",
      answer:
        "Two projects with the same features can still differ in the detail: how many screens, which systems it connects to, how much content you provide. The range covers that. Once we've talked through your requirements, we'll send a detailed quote.",
    },
    {
      question: "Can we start with a smaller first version?",
      answer:
        "Yes, and it's often the smartest way to start. Launch the core features first, learn from real users, then add the rest. Untick the features you could live without at launch to see the difference.",
    },
    {
      question: "What isn't included in the estimate?",
      answer:
        "Running costs paid to other providers: hosting and your domain, app store accounts, payment and SMS fees, and ongoing maintenance after launch. See Running costs to plan for on this page.",
    },
  ];
}

/** One question: a numbered heading over its choices. */
function Question({ step, title, hint, children }: { step: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="float-left w-full">
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-sm text-gold-300">{String(step).padStart(2, "0")}</span>
          <span className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</span>
        </span>
      </legend>
      {hint && <p className="clear-left pt-2 text-slate-400">{hint}</p>}
      <div className="clear-left pt-6">{children}</div>
    </fieldset>
  );
}

/** A selectable card: a radio (one of a list) or a checkbox (any of a list). */
function Choice({
  kind,
  name,
  checked,
  onChange,
  title,
  description,
  meta,
  icon: Icon,
}: {
  kind: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  meta?: string;
  icon?: LucideIcon;
}) {
  return (
    <label
      className={cn(
        "flex h-full cursor-pointer gap-4 border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-400 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#09090b] sm:p-5",
        checked
          ? "border-violet-400/70 bg-violet-500/[0.12]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
      )}
    >
      <input type={kind} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {Icon && (
        <Icon
          aria-hidden
          className={cn("mt-0.5 h-5 w-5 flex-shrink-0", checked ? "text-gold-300" : "text-violet-300")}
          strokeWidth={1.75}
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-white">{title}</span>
        {description && <span className="mt-1 block text-sm leading-6 text-slate-300">{description}</span>}
        {meta && <span className="mt-2 block font-mono text-xs text-gold-300">{meta}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors",
          checked ? "border-violet-400 bg-violet-500 text-white" : "border-white/25"
        )}
      >
        {checked && (kind === "checkbox" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="h-2 w-2 bg-white" />)}
      </span>
    </label>
  );
}

function MultiplierChoices({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: EstimatorMultiplier[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <Choice
          key={option.id}
          kind="radio"
          name={name}
          checked={value === option.id}
          onChange={() => onChange(option.id)}
          title={option.label}
          description={option.description}
        />
      ))}
    </div>
  );
}

function CurrencySwitch({ name, value, onChange }: { name: string; value: Currency; onChange: (c: Currency) => void }) {
  return (
    <div role="radiogroup" aria-label="Currency" className="flex flex-shrink-0 border border-white/10 bg-black/20 p-0.5">
      {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map((code) => (
        <label key={code} className="relative">
          <input
            type="radio"
            name={name}
            value={code}
            checked={value === code}
            onChange={() => onChange(code)}
            className="peer sr-only"
          />
          <span className="flex h-8 cursor-pointer items-center px-2.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white peer-checked:bg-violet-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-violet-300">
            {CURRENCY_SYMBOLS[code]}
            <span className="sr-only"> {CURRENCY_NAMES[code]}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

/**
 * /app-cost-calculator: six questions, a live price range and timeline, and
 * a quote request that lands in /admin → Inquiries with the estimate. Prices
 * come from /admin → Pricing (shared/estimator.js has the starting list).
 * The answers live in the address bar, so a link reopens the same estimate.
 */
const CostCalculator = () => {
  const config = useEstimator();
  const id = useId();
  const [answers, setAnswers] = useState<Answers>(() => startingAnswers(config));
  const [currency, setCurrency] = useState<Currency>("GHS");
  // The address bar is read once, after hydration (the prerendered page has no answers).
  const [linkRead, setLinkRead] = useState(false);

  const selection = resolveSelection(config, answers);
  const estimate = computeEstimate(config, selection);
  const features = selection.type
    ? config.features.filter((feature) => featureApplies(feature, selection.type))
    : config.features;
  // What's actually priced: features the type doesn't offer are left out.
  const priced: Answers = { ...answers, features: selection.features.map((f) => f.id) };

  useEffect(() => {
    const shared = answersFromLink(window.location.search, startingAnswers(config));
    if (shared) {
      setAnswers(shared.answers);
      setCurrency(shared.currency);
    }
    setLinkRead(true);
    // Once, on arrival; later changes to the price list don't reset the answers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the address bar in step, so a refresh or a copied link keeps the answers.
  const link = selection.type ? estimatePath(priced, currency) : CALCULATOR_PATH;
  useEffect(() => {
    if (!linkRead) return;
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== link) window.history.replaceState(window.history.state, "", `${link}${window.location.hash}`);
  }, [link, linkRead]);

  // On phones the estimate sits under the questions, so a bar keeps it in
  // sight while answering: shown while the questions are on screen and the
  // estimate itself isn't.
  const resultRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState({ calculator: false, result: false });
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) =>
      setInView((prev) => {
        const next = { ...prev };
        for (const entry of entries) {
          next[entry.target === resultRef.current ? "result" : "calculator"] = entry.isIntersecting;
        }
        return next;
      })
    );
    const calculator = document.getElementById("calculator");
    if (calculator) observer.observe(calculator);
    if (resultRef.current) observer.observe(resultRef.current);
    return () => observer.disconnect();
  }, []);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => setAnswers((a) => ({ ...a, [key]: value }));
  const chooseType = (type: string) => {
    set("type", type);
    trackEvent("Cost Estimate", { type });
  };
  const toggleFeature = (feature: string) =>
    setAnswers((a) => ({
      ...a,
      features: a.features.includes(feature) ? a.features.filter((f) => f !== feature) : [...a.features, feature],
    }));

  const copyLink = async () => {
    const url = `${siteConfig.url}${link}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: "Anyone with it sees the same estimate." });
    } catch {
      toast("Copy this link", { description: url, duration: 15000 });
    }
    trackEvent("Cost Estimate Shared", { type: answers.type });
  };

  const summary =
    estimate && selection.type
      ? [
          `Project: ${selection.type.label}`,
          `Size: ${selection.size.label}`,
          `Features: ${selection.features.map((f) => f.label).join(", ") || "None added"}`,
          `Design: ${selection.design.label}`,
          `Approach: ${selection.approach.label}`,
          `Pace: ${selection.pace.label}`,
          `Estimate: ${formatRange(estimate, currency)}, ${formatWeeks(estimate)}`,
          `Link: ${siteConfig.url}${link}`,
        ]
      : [];

  const faqs = faqsFor(config);
  const showBar = Boolean(estimate) && inView.calculator && !inView.result;

  return (
    <>
      <Seo
        title="App & Website Cost Calculator for Ghana"
        description="How much does an app or website cost in Ghana? Answer six quick questions for an instant price range and timeline in cedis or dollars."
        jsonLd={[
          breadcrumbsJsonLd([
            { name: "Home", path: "/" },
            { name: "Cost calculator", path: CALCULATOR_PATH },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          eyebrow="Cost calculator"
          title="How much will your app cost?"
          description="Answer six quick questions for an instant price range and timeline, in Ghana cedis or US dollars. It takes about a minute, and you can send the result to us for a detailed quote."
        />

        <Section id="calculator" className="scroll-mt-16 pt-0">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-14">
              <Question step={1} title="What are you building?">
                <div className="grid gap-3 sm:grid-cols-2">
                  {config.types.map((type) => (
                    <Choice
                      key={type.id}
                      kind="radio"
                      name={`${id}-type`}
                      checked={answers.type === type.id}
                      onChange={() => chooseType(type.id)}
                      title={type.label}
                      description={type.description}
                      meta={`From ${money(low(startingEstimate(config, type, selection.approach), currency), currency)}`}
                      icon={TYPE_ICONS[type.id] ?? Boxes}
                    />
                  ))}
                </div>
              </Question>

              <Question step={2} title="How big is it?" hint="A screen is a page or view, such as sign-in, a product list or checkout.">
                <MultiplierChoices name={`${id}-size`} options={config.sizes} value={answers.size} onChange={(v) => set("size", v)} />
              </Question>

              <Question step={3} title="What should it do?" hint="Tick everything you need. Leave it empty if you only need the basics.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <Choice
                      key={feature.id}
                      kind="checkbox"
                      name={`${id}-features`}
                      checked={answers.features.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      title={feature.label}
                      description={feature.description}
                      icon={FEATURE_ICONS[feature.id] ?? Sparkles}
                    />
                  ))}
                </div>
              </Question>

              <Question step={4} title="How should it look?">
                <MultiplierChoices name={`${id}-design`} options={config.designs} value={answers.design} onChange={(v) => set("design", v)} />
              </Question>

              <Question
                step={5}
                title="How should we build it?"
                hint="We use AI across our work. The more of the build it takes on, the less you pay."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {config.approaches.map((approach) => (
                    <Choice
                      key={approach.id}
                      kind="radio"
                      name={`${id}-approach`}
                      checked={answers.approach === approach.id}
                      onChange={() => set("approach", approach.id)}
                      title={approach.label}
                      description={approach.description}
                      meta={savingLabel(approach)}
                    />
                  ))}
                </div>
              </Question>

              <Question step={6} title="How soon do you need it?">
                <MultiplierChoices name={`${id}-pace`} options={config.paces} value={answers.pace} onChange={(v) => set("pace", v)} />
              </Question>
            </div>

            {/* Stays in view beside the questions while scrolling (desktop);
                never taller than the window, so its buttons stay reachable. */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div
                ref={resultRef}
                id="estimate"
                className="scroll-mt-24 border border-white/10 bg-[#111114] p-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">Your estimate</h2>
                  <CurrencySwitch name={`${id}-currency`} value={currency} onChange={setCurrency} />
                </div>
                <div aria-live="polite">
                  {estimate && selection.type ? (
                    <>
                      {/* Smaller for six-figure ranges, so they fit on one line. */}
                      <p
                        className={cn(
                          "mt-5 font-display font-bold tracking-tight text-white",
                          formatRange(estimate, currency).length > 15 ? "text-3xl" : "text-4xl"
                        )}
                      >
                        {formatRange(estimate, currency)}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-slate-300">
                        <Clock aria-hidden className="h-4 w-4 text-violet-300" />
                        {formatWeeks(estimate)} to launch
                      </p>
                    </>
                  ) : (
                    <p className="mt-5 text-slate-300">Choose what you're building to see a price range and timeline.</p>
                  )}
                </div>
                {estimate && selection.type && (
                  <>
                    <dl className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-sm">
                      {[
                        ["Project", selection.type.label],
                        ["Size", selection.size.label],
                        [
                          "Features",
                          selection.features.length
                            ? selection.features.map((f) => f.label).join(", ")
                            : "None added",
                        ],
                        ["Design", selection.design.label],
                        ["Approach", selection.approach.label],
                        ["Pace", selection.pace.label],
                      ].map(([term, detail]) => (
                        <div key={term} className="grid grid-cols-[5.5rem_1fr] gap-3">
                          <dt className="text-slate-400">{term}</dt>
                          <dd className="text-slate-100">{detail}</dd>
                        </div>
                      ))}
                    </dl>
                    <Button asChild className="mt-6 h-11 w-full bg-violet-600 text-white hover:bg-violet-500">
                      <a href="#quote">
                        Get a detailed quote <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <button
                      type="button"
                      onClick={copyLink}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-violet-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      <Link2 aria-hidden className="h-4 w-4" />
                      Copy a link to this estimate
                    </button>
                  </>
                )}
                <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
                  An indicative range for design, development, testing and launch, not a quote. Running costs such as
                  hosting are extra.
                </p>
              </div>
            </aside>
          </div>
        </Section>

        {/* The next step: send it to us */}
        <Section id="quote" className="scroll-mt-16">
          <div className="grid gap-10 border border-white/10 bg-gradient-to-br from-violet-600/20 via-white/[0.03] to-transparent p-6 md:p-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">Next step</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                Get a detailed quote
              </h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                Send us your estimate and we'll reply within one business day with a detailed quote, or a few
                questions if we need more detail. No obligation.
              </p>
              {estimate && selection.type && (
                <div className="mt-6 border border-white/10 bg-black/20 p-5">
                  <p className="text-sm text-slate-400">{selection.type.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">{formatRange(estimate, currency)}</p>
                  <p className="mt-1 text-sm text-slate-300">{formatWeeks(estimate)}</p>
                  <a href="#calculator" className="mt-3 inline-block text-sm font-medium text-violet-300 hover:text-white">
                    Change your answers
                  </a>
                </div>
              )}
            </div>
            <div>
              {estimate && selection.type ? (
                <QuoteRequestForm
                  answers={priced}
                  currency={currency}
                  summary={summary}
                  range={formatRange(estimate, currency)}
                />
              ) : (
                <div className="flex h-full flex-col items-start justify-center border border-dashed border-white/15 p-6">
                  <p className="text-slate-300">Answer the first question above to see your estimate, then send it to us here.</p>
                  <Button asChild variant="outline" className="mt-4 border-white/15 bg-transparent text-white hover:bg-white/[0.06]">
                    <a href="#calculator">Start the calculator</a>
                  </Button>
                  <p className="mt-6 text-sm text-slate-400">
                    Already know what you need?{" "}
                    <Link to="/contact" className="text-violet-300 underline underline-offset-2 hover:text-white">
                      Send us a brief
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* The three ways to build, side by side */}
        <Section id="approaches">
          <SectionHeading
            align="left"
            eyebrow="Delivery models"
            title="Three ways to build it"
            description="From a classic human team to one where AI does much of the work. The more AI takes on, the lower the cost, with the trade-offs below."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {config.approaches.map((approach) => {
              const details = APPROACH_DETAILS[approach.id];
              const Icon = APPROACH_ICONS[approach.id] ?? Sparkles;
              const chosen = answers.approach === approach.id;
              return (
                <div
                  key={approach.id}
                  className={cn(
                    "flex flex-col border p-6 md:p-7",
                    chosen ? "border-violet-400/60 bg-violet-500/[0.08]" : "border-white/10 bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon aria-hidden className="h-7 w-7 text-violet-300" strokeWidth={1.5} />
                    {details && (
                      <span className="border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-slate-300">
                        {details.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">{approach.label}</h3>
                  {/* Three lines' room side by side, so the budgets line up. */}
                  <p className="mt-2 text-sm leading-6 text-slate-300 lg:min-h-[4.5rem]">{approach.description}</p>
                  <p
                    className={cn(
                      "mt-6 font-display text-4xl font-bold tracking-tight",
                      approach.factor < 1 ? "text-gold-300" : "text-white"
                    )}
                  >
                    {approach.factor === 1 ? "Base" : savingLabel(approach).replace(/^About /, "")}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Development budget</p>
                  {details && (
                    <dl className="mt-6 flex-1 space-y-4 border-t border-white/10 pt-5 text-sm">
                      <div>
                        <dt className="font-medium text-white">How it's delivered</dt>
                        <dd className="mt-1 leading-6 text-slate-300">{details.delivery}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-white">Best for</dt>
                        <dd className="mt-1 leading-6 text-slate-300">{details.bestFor}</dd>
                      </div>
                    </dl>
                  )}
                  <Button
                    type="button"
                    variant={chosen ? "default" : "outline"}
                    onClick={() => {
                      set("approach", approach.id);
                      document.getElementById(answers.type ? "estimate" : "calculator")?.scrollIntoView({ block: "start" });
                    }}
                    className={cn(
                      "mt-6 h-11 w-full",
                      chosen
                        ? "bg-violet-600 text-white hover:bg-violet-500"
                        : "border-white/15 bg-transparent text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {chosen ? "In your estimate" : "Estimate with this model"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Section>

        {/* For readers (and search): what the numbers depend on */}
        <Section>
          <SectionHeading
            align="left"
            eyebrow="What drives the cost"
            title="Why app prices vary so much"
            description="Two apps that sound alike can differ several times over in price. These are the things that make the difference."
          />
          <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {DRIVERS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[#0c0c0f] p-6">
                <Icon aria-hidden className="h-6 w-6 text-violet-300" strokeWidth={1.5} />
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              align="left"
              eyebrow="Typical prices"
              title="Where projects start"
              description={`Starting prices are for a small build by a traditional team, with the simplest design and no added features; timelines are for a medium-sized build. AI-assisted and AI-native builds cost less. In ${CURRENCY_NAMES[currency]}.`}
            />
            <CurrencySwitch name={`${id}-table-currency`} value={currency} onChange={setCurrency} />
          </div>
          <div className="mt-10 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[34rem] text-left">
              <caption className="sr-only">Starting prices and typical timelines by type of project</caption>
              <thead className="bg-white/[0.04] text-sm text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Project</th>
                  <th scope="col" className="px-5 py-3 font-medium">Starts from</th>
                  <th scope="col" className="px-5 py-3 font-medium">Typical timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {config.types.map((type) => (
                  <tr key={type.id}>
                    <th scope="row" className="px-5 py-4 font-medium text-white">
                      {type.label}
                      <span className="mt-1 block max-w-md text-sm font-normal leading-6 text-slate-400">{type.description}</span>
                    </th>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-gold-300">
                      {money(low(startingEstimate(config, type), currency), currency)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-200">{formatWeeks(typicalEstimate(config, type))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section>
          <SectionHeading
            align="left"
            eyebrow="After launch"
            title="Running costs to plan for"
            description="These are paid to other providers, so they aren't part of the estimate."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {RUNNING_COSTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="border border-white/10 bg-white/[0.03] p-6">
                <Icon aria-hidden className="h-6 w-6 text-violet-300" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
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

        <Section className="pt-0">
          <div className="flex flex-col items-start gap-6 border-t border-white/10 pt-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">Prefer to talk it through?</h2>
              <p className="mt-2 text-slate-300">
                Call us on{" "}
                <a href={siteConfig.contact.phonePrimary.href} className="text-violet-300 hover:text-white">
                  {siteConfig.contact.phonePrimary.display}
                </a>{" "}
                or send a brief, and we'll scope it with you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
                <Link to="/contact">
                  Send a brief <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
                <Link to="/projects">See our work</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Footer />
      </PageShell>

      {showBar && estimate && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111114]/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Your estimate · {formatWeeks(estimate)}</p>
              <p className="truncate font-display text-xl font-bold text-white">{formatRange(estimate, currency)}</p>
            </div>
            <Button asChild className="h-10 flex-shrink-0 bg-violet-600 px-4 text-white hover:bg-violet-500">
              <a href="#estimate">See details</a>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CostCalculator;
