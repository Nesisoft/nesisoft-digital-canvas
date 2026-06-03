import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "./ImageField";
import { Field, FormRow } from "./formBits";
import type { AdminProject } from "@/lib/adminApi";

const TYPES = ["Internal platform", "Client work"] as const;
const STATUSES = ["Completed", "In development", "Beta testing"] as const;

const selectClass =
  "w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white";

interface ProjectFormProps {
  project: AdminProject | null;
  saving: boolean;
  onSave: (payload: Partial<AdminProject>) => void;
  onDelete: () => void;
}

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
};

const lines = (arr?: string[]) => (arr ?? []).join("\n");
const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

export function ProjectForm({ project, saving, onSave, onDelete }: ProjectFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "", slug: "", category: "", type: "Client work", status: "In development",
    description: "", fullDescription: "", image: "", gallery: "", technologies: "",
    features: "", timeline: "", teamSize: "", challenge: "", solution: "", result: "",
    order: 0, published: true,
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
    });
  }, [project]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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
        <Field label="Type">
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={selectClass}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </FormRow>
      <Field label="Short description" hint="Shown on cards">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-[4rem]" />
      </Field>
      <Field label="Full description" hint="Shown at the top of the case study">
        <Textarea value={form.fullDescription} onChange={(e) => set("fullDescription", e.target.value)} className="min-h-[5rem]" />
      </Field>
      <Field label="Cover image" hint="Paste a URL or upload (stored in MongoDB)">
        <ImageField value={form.image} onChange={(url) => set("image", url)} />
      </Field>
      <Field label="Gallery image URLs" hint="One per line">
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
        <Field label="Timeline">
          <Input value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="6 months" />
        </Field>
        <Field label="Team size">
          <Input value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} placeholder="5 specialists" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Display order" hint="Lower shows first">
          <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
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
