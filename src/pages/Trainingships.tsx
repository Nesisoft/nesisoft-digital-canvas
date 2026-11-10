import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LayoutTemplate,
  MessagesSquare,
  Palette,
  Server,
  Smartphone,
  TrendingUp,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import { Paragraphs } from "@/components/AboutBits";
import { ApplicationForm } from "@/components/ApplicationForm";
import { useTrainingships } from "@/hooks/useTrainingships";
import { cn } from "@/lib/utils";

const TRACK_ICONS: Record<string, LucideIcon> = {
  frontend: LayoutTemplate,
  backend: Server,
  mobile: Smartphone,
  design: Palette,
};
const HIGHLIGHT_ICONS = [Briefcase, Workflow, MessagesSquare, TrendingUp];

const STEPS = [
  { title: "Apply online", description: "Tell us about yourself and choose a track. It takes about ten minutes." },
  { title: "We read every application", description: "We look at what you've learnt, built or designed so far, and why you want to join." },
  { title: "Meet the team", description: "Shortlisted applicants are invited to talk with our team about their goals and their track." },
];

/**
 * /trainingships: the programme (content from /admin → Trainingships →
 * Page, defaults in shared/trainingships.js) and its application form.
 * Applications land in /admin → Trainingships.
 */
const Trainingships = () => {
  const page = useTrainingships();
  const [track, setTrack] = useState("");
  const facts = (
    [
      ["Intake", page.intake],
      ["Apply by", page.deadline],
      ["Duration", page.duration],
      ["Where", page.format],
      ["Time", page.commitment],
    ] as [string, string][]
  ).filter(([, value]) => value);

  const chooseTrack = (id: string) => {
    setTrack(id);
    document.getElementById("apply")?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <Seo
        title="Trainingships: Learn Software Development in Accra"
        description="Train with Nesisoft's team on real software projects in Accra, Ghana. Apply for a Trainingship in web or mobile development, or in design."
        jsonLd={[
          breadcrumbsJsonLd([
            { name: "Home", path: "/" },
            { name: "Company", path: "/company" },
            { name: "Trainingships", path: "/trainingships" },
          ]),
          ...(page.faqs.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: page.faqs.map((faq) => ({
                    "@type": "Question",
                    name: faq.question,
                    acceptedAnswer: { "@type": "Answer", text: faq.answer },
                  })),
                },
              ]
            : []),
        ]}
      />
      <PageShell>
        <Navbar />
        <PageHeader backTo="/company" backLabel="Company" eyebrow="Trainingships" title="Learn to build software on real projects">
          <p
            className={cn(
              "mt-6 inline-flex items-center gap-2 border px-3 py-1.5 text-sm font-medium",
              page.open ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/15 bg-white/[0.04] text-slate-300"
            )}
          >
            <span aria-hidden className={cn("h-2 w-2", page.open ? "bg-emerald-300" : "bg-slate-500")} />
            {page.open ? "Applications open" : "Applications closed"}
            {page.open && page.intake ? ` · ${page.intake}` : ""}
          </p>
          <Paragraphs text={page.intro} className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300" />
          <div className="mt-8 flex flex-wrap gap-3">
            {page.open && (
              <Button asChild className="h-11 bg-violet-600 px-5 text-white hover:bg-violet-500">
                <a href="#apply">
                  Apply now <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            <Button asChild variant="outline" className="h-11 border-white/15 bg-transparent px-5 text-white hover:bg-white/[0.06]">
              <a href="#tracks">See the tracks</a>
            </Button>
          </div>
          {facts.length > 0 && (
            <dl className="mt-12 grid max-w-4xl gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
              {facts.map(([term, value]) => (
                <div key={term} className="bg-[#0c0c0f] p-5">
                  <dt className="font-mono text-xs uppercase tracking-[0.14em] text-gold-300">{term}</dt>
                  <dd className="mt-2 font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </PageHeader>

        {page.highlights.length > 0 && (
          <Section className="pt-4">
            <SectionHeading align="left" eyebrow="What you'll do" title="Real work, real feedback" />
            <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {page.highlights.map((item, i) => {
                const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
                return (
                  <div key={item.title} className="bg-[#0c0c0f] p-6">
                    <Icon aria-hidden className="h-6 w-6 text-violet-300" strokeWidth={1.5} />
                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                    {item.description && <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <Section id="tracks" className="scroll-mt-16">
          <SectionHeading
            align="left"
            eyebrow="Tracks"
            title="Choose what you want to learn"
            description="Each track pairs you with people from our team who do that work every day."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {page.tracks.map((t) => {
              const Icon = TRACK_ICONS[t.id] ?? GraduationCap;
              return (
                <div key={t.id} className="flex flex-col border border-white/10 bg-white/[0.03] p-6 md:p-7">
                  <Icon aria-hidden className="h-7 w-7 text-violet-300" strokeWidth={1.5} />
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">{t.name}</h3>
                  {t.description && <p className="mt-2 flex-1 leading-relaxed text-slate-300">{t.description}</p>}
                  {page.open && (
                    <button
                      type="button"
                      onClick={() => chooseTrack(t.id)}
                      className="mt-6 inline-flex items-center self-start text-sm font-medium text-violet-300 transition-colors hover:text-white"
                    >
                      Apply for this track <ArrowRight aria-hidden className="ml-1.5 h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {page.requirements.length > 0 && (
              <div>
                <SectionHeading align="left" eyebrow="Who can apply" title="Is it for you?" />
                <ul className="mt-8 space-y-4">
                  {page.requirements.map((requirement) => (
                    <li key={requirement} className="flex gap-3 text-slate-200">
                      <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-300" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <SectionHeading align="left" eyebrow="How it works" title="From application to day one" />
              <ol className="mt-8 space-y-6">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-white/15 font-mono text-sm text-gold-300">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>

        <Section id="apply" className="scroll-mt-16">
          <div className="grid gap-10 border border-white/10 bg-gradient-to-br from-violet-600/20 via-white/[0.03] to-transparent p-6 md:p-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300">Apply</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                {page.open ? "Apply for a Trainingship" : "Applications are closed"}
              </h2>
              {page.open ? (
                <p className="mt-4 leading-relaxed text-slate-300">
                  Tell us about yourself and the track you'd like to join. Attach a CV if you have one: it helps, but
                  it isn't required.
                </p>
              ) : (
                <Paragraphs text={page.closedMessage} className="mt-4 leading-relaxed text-slate-300" />
              )}
              <p className="mt-6 text-sm text-slate-400">
                A school, university or organisation that wants to partner with us?{" "}
                <Link to="/contact" className="font-medium text-violet-300 hover:text-white">
                  Get in touch
                </Link>
                .
              </p>
            </div>
            <div>
              {page.open ? (
                <ApplicationForm tracks={page.tracks} track={track} onTrackChange={setTrack} />
              ) : (
                <div className="flex h-full flex-col items-start justify-center border border-dashed border-white/15 p-6">
                  <p className="text-slate-300">Want to hear when the next intake opens?</p>
                  <Button asChild variant="outline" className="mt-4 border-white/15 bg-transparent text-white hover:bg-white/[0.06]">
                    <Link to="/contact">Contact us</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Section>

        {page.faqs.length > 0 && (
          <Section id="faq">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
              <SectionHeading align="left" eyebrow="Questions" title="Good to know" />
              <div className="divide-y divide-white/10 border-y border-white/10">
                {page.faqs.map((faq) => (
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
        )}

        <Footer />
      </PageShell>
    </>
  );
};

export default Trainingships;
