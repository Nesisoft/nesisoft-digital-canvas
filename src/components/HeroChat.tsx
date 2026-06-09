import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Animated hero panel: a simulated conversation that plays out "lead →
 * product ready for review" in three messages, then loops to a *different*
 * scenario each time (different request, product, and preview image). Honors
 * prefers-reduced-motion by showing one scenario statically.
 *
 * Corners stay square (the site's 90° look); only avatars and the chrome
 * dots are round.
 */

interface Scenario {
  lead: string;
  reply: string;
  product: string;
  image: string;
}

const scenarios: Scenario[] = [
  {
    lead: "We need a delivery app for our logistics business. Can you build it?",
    reply:
      "Yes. We'll scope it, design the flows, and ship an MVP — discovery starts today.",
    product: "Delivery app",
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=480&h=240&fit=crop",
  },
  {
    lead: "We're a fintech — we need a secure payments dashboard. How fast can you move?",
    reply:
      "Fast. We'll prototype the flows this week and harden security as we build.",
    product: "Payments dashboard",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=480&h=240&fit=crop",
  },
  {
    lead: "We want an e-learning platform with mobile money. Is that doable?",
    reply:
      "Absolutely. We'll integrate mobile money and ship a mobile-first experience.",
    product: "Learning platform",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&h=240&fit=crop",
  },
  {
    lead: "Our clinic needs online appointments and patient records in one place.",
    reply:
      "We can build that. We'll map the patient journey and secure the data layer first.",
    product: "Clinic portal",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&h=240&fit=crop",
  },
  {
    lead: "We run retail branches and need inventory, sales, and staff reports.",
    reply:
      "Yes. We'll centralize stock, connect branch sales, and make the reports scan fast.",
    product: "Retail operations system",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=240&fit=crop",
  },
  {
    lead: "Can you help our farm cooperative track harvests and buyer payments?",
    reply:
      "Definitely. We'll design simple field capture and dashboards for managers.",
    product: "Agri cooperative platform",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=480&h=240&fit=crop",
  },
  {
    lead: "Our school wants admissions, fees, grades, and parent updates online.",
    reply:
      "We can ship it in phases: admissions first, then finance, academics, and messaging.",
    product: "School management portal",
    image:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?w=480&h=240&fit=crop",
  },
  {
    lead: "We need a booking app for rides with driver tracking and payments.",
    reply:
      "Yes. We'll model dispatch, driver availability, fares, and a clean rider flow.",
    product: "Ride booking app",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=480&h=240&fit=crop",
  },
  {
    lead: "Our NGO needs to register field work and prove impact to donors.",
    reply:
      "We can help. We'll build offline-friendly forms and impact dashboards.",
    product: "Impact reporting platform",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=480&h=240&fit=crop",
  },
  {
    lead: "We sell online and need a faster store with mobile money checkout.",
    reply:
      "Absolutely. We'll optimize the storefront and keep checkout simple on mobile.",
    product: "Commerce storefront",
    image:
      "https://images.unsplash.com/photo-1557821552-17105176677c?w=480&h=240&fit=crop",
  },
  {
    lead: "Our team is buried in spreadsheets. Can you turn it into one tool?",
    reply:
      "Yes. We'll audit the workflow, remove duplicate entry, and build the internal app.",
    product: "Internal workflow tool",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=480&h=240&fit=crop",
  },
  {
    lead: "We want sensors and a dashboard for equipment performance.",
    reply:
      "We can do it. We'll define the device data, alerts, and operational views.",
    product: "IoT monitoring dashboard",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=480&h=240&fit=crop",
  },
];

interface Message {
  from: "lead" | "studio";
  text: string;
  delivery?: boolean;
  image?: string;
}

export function HeroChat() {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setCount(3);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const play = () => {
      setCount(0);
      setTyping(false);
      at(250, () => setCount(1)); // lead asks
      at(850, () => setTyping(true)); // studio composing…
      at(1450, () => {
        setTyping(false);
        setCount(2); // studio replies
      });
      at(2050, () => setTyping(true)); // composing again…
      at(2650, () => {
        setTyping(false);
        setCount(3); // delivery: ready for review
      });
    };

    play();
    const loop = setInterval(() => {
      setScenarioIndex((i) => (i + 1) % scenarios.length); // next scenario + image
      play();
    }, 5200);

    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, []);

  const scenario = scenarios[scenarioIndex];
  const thread: Message[] = [
    { from: "lead", text: scenario.lead },
    { from: "studio", text: scenario.reply },
    {
      from: "studio",
      text: scenario.product,
      delivery: true,
      image: scenario.image,
    },
  ];

  return (
    <Link
      to="/contact"
      aria-label="Start a conversation with Nesisoft"
      className="group mx-auto block w-full max-w-2xl overflow-hidden border border-white/10 bg-[#0b0d12]/90 text-left shadow-2xl shadow-black/30 backdrop-blur transition-colors hover:border-violet-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="font-mono text-xs text-slate-400">
          nesisoft / delivery
        </span>
        <span className="inline-flex items-center gap-1.5 bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors group-hover:bg-violet-500">
          Start a project
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>

      {/* Conversation — top-aligned + fixed height so new bubbles slide in
          without shoving the earlier ones around. */}
      <div className="flex h-[21rem] flex-col justify-start gap-3.5 overflow-hidden p-4 sm:gap-4 sm:p-5">
        {thread.slice(0, count).map((message, index) => (
          <Bubble key={`${scenarioIndex}-${index}`} message={message} />
        ))}
        {typing && <Typing />}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
        <p className="text-xs text-slate-400">
          From first message to a product ready for review.
        </p>
        <span className="inline-flex flex-shrink-0 items-center text-xs font-medium text-violet-300 transition-colors group-hover:text-violet-200">
          Open the conversation
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function Avatar({ studio }: { studio: boolean }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[999px] text-xs font-semibold",
        studio ? "bg-violet-600 text-white" : "bg-white/10 text-slate-200"
      )}
    >
      {studio ? "N" : "C"}
    </span>
  );
}

function Bubble({ message }: { message: Message }) {
  const studio = message.from === "studio";
  return (
    <div
      className={cn(
        "flex items-end gap-2.5 duration-300 ease-out animate-in fade-in slide-in-from-bottom-3",
        studio && "flex-row-reverse"
      )}
    >
      <Avatar studio={studio} />
      {message.delivery ? (
        <div className="max-w-[80%] overflow-hidden border border-violet-400/30 bg-violet-500/10">
          <img
            src={message.image}
            alt=""
            className="h-24 w-full object-cover sm:h-28"
          />
          <div className="p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              {message.text} ready for review
            </div>
            <span className="mt-1.5 inline-flex items-center text-xs font-medium text-violet-300">
              View staging
              <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[80%] px-3.5 py-2.5 text-sm leading-6",
            studio ? "bg-violet-600 text-white" : "bg-white/[0.06] text-slate-200"
          )}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

function Typing() {
  return (
    <div className="flex flex-row-reverse items-end gap-2.5 duration-200 ease-out animate-in fade-in">
      <Avatar studio />
      <div className="flex items-center gap-1 bg-violet-600/80 px-3.5 py-3.5">
        <span className="h-1.5 w-1.5 rounded-[999px] bg-white/80 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-[999px] bg-white/80 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-[999px] bg-white/80 animate-bounce" />
      </div>
    </div>
  );
}
