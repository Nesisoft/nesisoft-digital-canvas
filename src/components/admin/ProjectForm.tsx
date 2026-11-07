import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "./ImageField";
import { Field, FormRow } from "./formBits";
import type { AdminProject } from "@/lib/adminApi";
import type { Faq, Step } from "@/data/projects";

const TYPES = ["Internal platform", "Client work"] as const;
const STATUSES = ["Completed", "In development", "Beta testing"] as const;

const selectClass =
  "w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white";

const smallButton =
  "border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white";

interface ProjectFormProps {
  project: AdminProject | null;
  saving: boolean;
  onSave: (payload: Partial<AdminProject>) => void;
  onDelete: () => void;
}

/** An audience while editing: its points as one per line. */
type AudienceDraft = { role: string; title: string; description: string; points: string };

type FormState = {
  name: string;
  slug: string;
  category: string;
  type: string;
  status: string;
  description: string;
  fullDescription: string;
  image: string;
  gallery: string;
  technologies: string;
  features: string;
  timeline: string;
  teamSize: string;
  challenge: string;
  solution: string;
  result: string;
  order: number;
  published: boolean;
  nda: boolean;
  tagline: string;
  logo: string;
  websiteUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
  audiences: AudienceDraft[];
  steps: Step[];
  faqs: Faq[];
};

const lines = (arr?: string[]) => (arr ?? []).join("\n");
const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

const LIMITS = { audiences: 4, steps: 6, faqs: 12 };

/** A repeatable group of fields (an audience, a step, a question). */
function ItemCard({ label, onRemove, children }: { label: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border border-white/10 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
        <Button type="button" variant="outline" onClick={onRemove} aria-label={`Remove ${label}`} className={`h-8 px-2 ${smallButton}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className={smallButton}>
      <Plus className="mr-2 h-4 w-4" /> {children}
    </Button>
  );
}

export function ProjectForm({ project, saving, onSave, onDelete }: ProjectFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "", slug: "", category: "", type: "Client work", status: "In development",
    description: "", fullDescription: "", image: "", gallery: "", technologies: "",
    features: "", timeline: "", teamSize: "", challenge: "", solution: "", result: "",
    order: 0, published: true, nda: false,
    tagline: "", logo: "", websiteUrl: "", appStoreUrl: "", playStoreUrl: "",
    audiences: [], steps: [], faqs: [],
  });

  useEffect(() => {
    setForm({
      name: project?.name ?? "",
      slug: project?.slug ?? "",
      category: project?.category ?? "",
      type: project?.type ?? "Client work",
      status: project?.status ?? "In development",
      description: project?.description ?? "",
      fullDescription: project?.fullDescription ?? "",
      image: project?.image ?? "",
      gallery: lines(project?.gallery),
      technologies: lines(project?.technologies),
      features: lines(project?.features),
      timeline: project?.timeline ?? "",
      teamSize: project?.teamSize ?? "",
      challenge: project?.challenge ?? "",
      solution: project?.solution ?? "",
      result: project?.result ?? "",
      order: project?.order ?? 0,
      published: project?.published ?? true,
      nda: project?.nda ?? false,
      tagline: project?.tagline ?? "",
      logo: project?.logo ?? "",
      websiteUrl: project?.websiteUrl ?? "",
      appStoreUrl: project?.appStoreUrl ?? "",
      playStoreUrl: project?.playStoreUrl ?? "",
      audiences: (project?.audiences ?? []).map((a) => ({ ...a, points: lines(a.points) })),
      steps: project?.steps ?? [],
      faqs: project?.faqs ?? [],
    });
  }, [project]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** Changes one item of a list field (audiences, steps, faqs). */
  const setItem = <K extends "audiences" | "steps" | "faqs">(
    key: K,
    index: number,
    patch: Partial<FormState[K][number]>
  ) =>
    setForm((f) => ({
      ...f,
      [key]: (f[key] as FormState[K][number][]).map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  const removeItem = (key: "audiences" | "steps" | "faqs", index: number) =>
    setForm((f) => ({ ...f, [key]: (f[key] as unknown[]).filter((_, i) => i !== index) }));

  const isPlatform = form.type === "Internal platform";

  const submit = () =>
    onSave({
      name: form.name,
      slug: form.slug,
      category: form.category,
      type: form.type as AdminProject["type"],
      status: form.status as AdminProject["status"],
      description: form.description,
      fullDescription: form.fullDescription,
      image: form.image,
      gallery: toLines(form.gallery),
      technologies: toLines(form.technologies),
      features: toLines(form.features),
      timeline: form.timeline,
      teamSize: form.teamSize,
      challenge: form.challenge,
      solution: form.solution,
      result: form.result,
      order: Number(form.order) || 0,
      published: form.published,
      nda: isPlatform ? false : form.nda,
      tagline: form.tagline,
      logo: form.logo,
      websiteUrl: form.websiteUrl,
      appStoreUrl: form.appStoreUrl,
      playStoreUrl: form.playStoreUrl,
      audiences: form.audiences.map((a) => ({ ...a, points: toLines(a.points) })),
      steps: form.steps,
      faqs: form.faqs,
    });

  return (
    <div className="space-y-5">
      <FormRow>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Slug (URL)" hint="Leave blank to derive from name">
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Category">
          <Input value={form.category} onChange={(e) => set("category", e.target.value)} />
        </Field>
        <Field label="Type" hint={isPlatform ? "Our own product: gets a product page at /platforms/<slug>" : "A client project: gets a case study at /projects/<slug>"}>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={selectClass}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </FormRow>
      {project && (
        <a
          href={isPlatform ? `/platforms/${project.slug}` : `/projects/${project.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-violet-300 hover:text-violet-200"
        >
          View its page <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      <Field label="Short description" hint="Shown on cards">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-[4rem]" />
      </Field>
      <Field label="Full description" hint={isPlatform ? "Under the headline at the top of the product page" : "Shown at the top of the case study"}>
        <Textarea value={form.fullDescription} onChange={(e) => set("fullDescription", e.target.value)} className="min-h-[5rem]" />
      </Field>
      <Field label="Cover image" hint={isPlatform ? "The big image beside the headline: a screenshot or mockup of the product works best" : "Paste a URL or upload (stored in Supabase Storage)"}>
        <ImageField value={form.image} onChange={(url) => set("image", url)} />
      </Field>
      <Field label={isPlatform ? "Screenshots" : "Gallery image URLs"} hint="One image URL per line">
        <Textarea value={form.gallery} onChange={(e) => set("gallery", e.target.value)} className="min-h-[5rem] font-mono text-xs" />
      </Field>
      <FormRow>
        <Field label="Technologies" hint="One per line">
          <Textarea value={form.technologies} onChange={(e) => set("technologies", e.target.value)} className="min-h-[6rem]" />
        </Field>
        <Field label="Features" hint="One per line">
          <Textarea value={form.features} onChange={(e) => set("features", e.target.value)} className="min-h-[6rem]" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Status" hint={isPlatform ? "Completed shows as Live; until then the page offers early access" : undefined}>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Display order" hint="Lower shows first">
          <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
        </Field>
      </FormRow>

      {isPlatform ? (
        <section className="space-y-5 border-t border-white/10 pt-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-300">Product page</h3>
            <p className="mt-1 text-xs text-slate-500">Sections left empty are left off the page.</p>
          </div>
          <Field label="Tagline" hint="One line: the page's headline, e.g. Errands done by reliable runners.">
            <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={160} />
          </Field>
          <Field label="Logo" hint="Square, ideally on a white or transparent background">
            <ImageField value={form.logo} onChange={(url) => set("logo", url)} />
          </Field>
          <Field label="Website" hint="Once it's live: the page's main button links here">
            <Input value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://" />
          </Field>
          <FormRow>
            <Field label="App Store link">
              <Input value={form.appStoreUrl} onChange={(e) => set("appStoreUrl", e.target.value)} placeholder="https://apps.apple.com/…" />
            </Field>
            <Field label="Google Play link">
              <Input value={form.playStoreUrl} onChange={(e) => set("playStoreUrl", e.target.value)} placeholder="https://play.google.com/…" />
            </Field>
          </FormRow>

          <Field label="Who it's for" hint="e.g. customers and runners. The role names are the choices in the early-access form.">
            <div className="space-y-3">
              {form.audiences.map((audience, i) => (
                <ItemCard key={i} label={`Audience ${i + 1}`} onRemove={() => removeItem("audiences", i)}>
                  <FormRow>
                    <Input value={audience.role} placeholder="Role, e.g. Runner" aria-label={`Audience ${i + 1} role`} onChange={(e) => setItem("audiences", i, { role: e.target.value })} />
                    <Input value={audience.title} placeholder="Heading, e.g. For runners" aria-label={`Audience ${i + 1} heading`} onChange={(e) => setItem("audiences", i, { title: e.target.value })} />
                  </FormRow>
                  <Input value={audience.description} placeholder="One sentence for them" aria-label={`Audience ${i + 1} description`} onChange={(e) => setItem("audiences", i, { description: e.target.value })} />
                  <Textarea value={audience.points} placeholder="What they get, one per line" aria-label={`Audience ${i + 1} points`} onChange={(e) => setItem("audiences", i, { points: e.target.value })} className="min-h-[5.5rem]" />
                </ItemCard>
              ))}
              {form.audiences.length < LIMITS.audiences && (
                <AddButton onClick={() => set("audiences", [...form.audiences, { role: "", title: "", description: "", points: "" }])}>
                  Add audience
                </AddButton>
              )}
            </div>
          </Field>

          <Field label="How it works" hint="The steps, in order">
            <div className="space-y-3">
              {form.steps.map((step, i) => (
                <ItemCard key={i} label={`Step ${i + 1}`} onRemove={() => removeItem("steps", i)}>
                  <Input value={step.title} placeholder="e.g. Post an errand" aria-label={`Step ${i + 1} title`} onChange={(e) => setItem("steps", i, { title: e.target.value })} />
                  <Input value={step.description} placeholder="One short sentence" aria-label={`Step ${i + 1} description`} onChange={(e) => setItem("steps", i, { description: e.target.value })} />
                </ItemCard>
              ))}
              {form.steps.length < LIMITS.steps && (
                <AddButton onClick={() => set("steps", [...form.steps, { title: "", description: "" }])}>Add step</AddButton>
              )}
            </div>
          </Field>

          <Field label="Questions" hint="Shown as an FAQ, and given to search engines as one">
            <div className="space-y-3">
              {form.faqs.map((faq, i) => (
                <ItemCard key={i} label={`Question ${i + 1}`} onRemove={() => removeItem("faqs", i)}>
                  <Input value={faq.question} placeholder="Question" aria-label={`Question ${i + 1}`} onChange={(e) => setItem("faqs", i, { question: e.target.value })} />
                  <Textarea value={faq.answer} placeholder="Answer" aria-label={`Answer ${i + 1}`} onChange={(e) => setItem("faqs", i, { answer: e.target.value })} className="min-h-[4.5rem]" />
                </ItemCard>
              ))}
              {form.faqs.length < LIMITS.faqs && (
                <AddButton onClick={() => set("faqs", [...form.faqs, { question: "", answer: "" }])}>Add question</AddButton>
              )}
            </div>
          </Field>
        </section>
      ) : (
        <>
          <FormRow>
            <Field label="Timeline">
              <Input value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="6 months" />
            </Field>
            <Field label="Team size">
              <Input value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} placeholder="5 specialists" />
            </Field>
          </FormRow>
          <Field label="Challenge">
            <Textarea value={form.challenge} onChange={(e) => set("challenge", e.target.value)} className="min-h-[4.5rem]" />
          </Field>
          <Field label="Solution">
            <Textarea value={form.solution} onChange={(e) => set("solution", e.target.value)} className="min-h-[4.5rem]" />
          </Field>
          <Field label="Result">
            <Textarea value={form.result} onChange={(e) => set("result", e.target.value)} className="min-h-[3.5rem]" />
          </Field>
          <Field
            label="Non-disclosure agreement"
            hint="Shows an Under NDA badge on the card and case study, with a note that the client's details are left out. Keep the client's name and identifying details out of the text and images too."
          >
            <label className="flex items-center gap-3">
              <Switch checked={form.nda} onCheckedChange={(v) => set("nda", v)} aria-label="Under NDA" />
              <span className="text-sm text-slate-300">{form.nda ? "Under NDA" : "Not under NDA"}</span>
            </label>
          </Field>
        </>
      )}

      <label className="flex items-center gap-3">
        <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
        <span className="text-sm text-slate-300">Published</span>
      </label>

      <div className="flex items-center gap-3 border-t border-white/10 pt-5">
        <Button disabled={saving} onClick={submit} className="rounded-lg bg-violet-600 text-white hover:bg-violet-500">
          {saving ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
        <span className="flex-1" />
        {project && (
          <Button
            variant="outline"
            onClick={onDelete}
            className="rounded-lg border-red-500/40 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
      </div>
    </div>
  );
}
