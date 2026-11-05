import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FormRow } from "./formBits";
import { ImageField } from "./ImageField";
import { getContent, updateContent } from "@/lib/adminApi";
import { DEFAULT_CONTENT, withContentDefaults, type SiteContent } from "@/lib/api";

const PHOTO_SLOTS = 3;

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-300">{children}</h3>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ContentForm() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "content"],
    queryFn: getContent,
  });
  const [form, setForm] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    if (data) setForm(withContentDefaults(data));
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateContent(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      qc.invalidateQueries({ queryKey: ["content"] }); // public site
      toast.success("Content saved");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const setHero = (k: keyof SiteContent["hero"], v: string) =>
    setForm((f) => ({ ...f, hero: { ...f.hero, [k]: v } }));
  const setAbout = <K extends keyof SiteContent["about"]>(k: K, v: SiteContent["about"][K]) =>
    setForm((f) => ({ ...f, about: { ...f.about, [k]: v } }));

  // Three fixed photo slots; empty ones are dropped when saved.
  const photos = Array.from(
    { length: PHOTO_SLOTS },
    (_, i) => form.about.photos[i] ?? { url: "", alt: "" }
  );
  const setPhoto = (i: number, patch: Partial<{ url: string; alt: string }>) =>
    setAbout(
      "photos",
      photos.map((photo, j) => (j === i ? { ...photo, ...patch } : photo))
    );

  const programs = form.about.csrPrograms;
  const setProgram = (i: number, patch: Partial<{ title: string; description: string }>) =>
    setAbout(
      "csrPrograms",
      programs.map((program, j) => (j === i ? { ...program, ...patch } : program))
    );

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading content…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:text-white [&_textarea]:border-white/10 [&_textarea]:bg-black/20 [&_textarea]:text-white">
      <section className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-300">
          Hero
        </h3>
        <Field label="Headline">
          <Input value={form.hero.titleLead} onChange={(e) => setHero("titleLead", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <Textarea
            value={form.hero.subtitle}
            onChange={(e) => setHero("subtitle", e.target.value)}
            className="min-h-[5rem]"
          />
        </Field>
      </section>

      <section className="space-y-5 border-t border-white/10 pt-8">
        <SectionTitle hint="The homepage's short About block, which links to the Company page. The same title and text open the Company page.">
          About (homepage and Company page)
        </SectionTitle>
        <FormRow>
          <Field label="Eyebrow">
            <Input value={form.about.eyebrow} onChange={(e) => setAbout("eyebrow", e.target.value)} />
          </Field>
          <Field label="Title">
            <Input value={form.about.title} onChange={(e) => setAbout("title", e.target.value)} />
          </Field>
        </FormRow>
        <Field label="Short intro" hint="Two or three sentences: the homepage shows only this">
          <Textarea
            value={form.about.description}
            onChange={(e) => setAbout("description", e.target.value)}
            className="min-h-[4.5rem]"
          />
        </Field>
        <Field
          label="Photos"
          hint="Up to three photos of the team at work. The homepage shows them in a row: wide photos suit the first and third."
        >
          <div className="space-y-4">
            {photos.map((photo, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                <ImageField value={photo.url} onChange={(url) => setPhoto(i, { url })} />
                <Input
                  value={photo.alt}
                  placeholder="Describe the photo, e.g. The team planning a release"
                  aria-label={`Photo ${i + 1} description`}
                  onChange={(e) => setPhoto(i, { alt: e.target.value })}
                />
              </div>
            ))}
          </div>
        </Field>
      </section>

      <section className="space-y-5 border-t border-white/10 pt-8">
        <SectionTitle hint="Shown on the Company page (/company).">Company page</SectionTitle>
        <FormRow>
          <Field label="Vision heading">
            <Input value={form.about.visionTitle} onChange={(e) => setAbout("visionTitle", e.target.value)} />
          </Field>
          <Field label="Mission heading">
            <Input value={form.about.missionTitle} onChange={(e) => setAbout("missionTitle", e.target.value)} />
          </Field>
        </FormRow>
        <Field label="Vision" hint="Leave a blank line between paragraphs">
          <Textarea
            value={form.about.visionBody}
            onChange={(e) => setAbout("visionBody", e.target.value)}
            className="min-h-[5rem]"
          />
        </Field>
        <Field label="Mission" hint="Leave a blank line between paragraphs">
          <Textarea
            value={form.about.missionBody}
            onChange={(e) => setAbout("missionBody", e.target.value)}
            className="min-h-[9rem]"
          />
        </Field>
        <Field label='"Why work with us" heading'>
          <Input value={form.about.whyTitle} onChange={(e) => setAbout("whyTitle", e.target.value)} />
        </Field>
        <Field label="Reasons to work with us" hint="One per line">
          <Textarea
            value={form.about.benefits.join("\n")}
            onChange={(e) =>
              setAbout(
                "benefits",
                e.target.value.split("\n").map((l) => l.trim()).filter(Boolean)
              )
            }
            className="min-h-[7rem]"
          />
        </Field>

        <Field label="Stats">
          <div className="space-y-2">
            {form.about.stats.map((stat, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={stat.number}
                  placeholder="10+"
                  className="w-28"
                  onChange={(e) => {
                    const stats = [...form.about.stats];
                    stats[i] = { ...stats[i], number: e.target.value };
                    setAbout("stats", stats);
                  }}
                />
                <Input
                  value={stat.label}
                  placeholder="Projects delivered"
                  onChange={(e) => {
                    const stats = [...form.about.stats];
                    stats[i] = { ...stats[i], label: e.target.value };
                    setAbout("stats", stats);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAbout("stats", form.about.stats.filter((_, j) => j !== i))}
                  className="flex-shrink-0 border-white/15 bg-transparent text-slate-400 hover:bg-white/[0.06] hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbout("stats", [...form.about.stats, { number: "", label: "" }])}
              className="border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add stat
            </Button>
          </div>
        </Field>

        <Field label="Corporate social responsibility heading">
          <Input value={form.about.csrTitle} onChange={(e) => setAbout("csrTitle", e.target.value)} />
        </Field>
        <Field label="Corporate social responsibility intro" hint="Leave a blank line between paragraphs">
          <Textarea
            value={form.about.csrBody}
            onChange={(e) => setAbout("csrBody", e.target.value)}
            className="min-h-[4.5rem]"
          />
        </Field>
        <Field label="Programmes" hint="e.g. Trainingships. Each gets its own card.">
          <div className="space-y-3">
            {programs.map((program, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                <div className="flex gap-2">
                  <Input
                    value={program.title}
                    placeholder="Trainingships"
                    aria-label={`Programme ${i + 1} name`}
                    onChange={(e) => setProgram(i, { title: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`Remove programme ${i + 1}`}
                    onClick={() => setAbout("csrPrograms", programs.filter((_, j) => j !== i))}
                    className="flex-shrink-0 border-white/15 bg-transparent text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={program.description}
                  placeholder="What it is and who it's for"
                  aria-label={`Programme ${i + 1} description`}
                  onChange={(e) => setProgram(i, { description: e.target.value })}
                  className="min-h-[4.5rem]"
                />
              </div>
            ))}
            {programs.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setAbout("csrPrograms", [...programs, { title: "", description: "" }])}
                className="border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add programme
              </Button>
            )}
          </div>
        </Field>
      </section>

      <div className="border-t border-white/10 pt-6">
        <Button
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="rounded-lg bg-violet-600 text-white hover:bg-violet-500"
        >
          {save.isPending ? "Saving…" : "Save content"}
        </Button>
      </div>
    </div>
  );
}
