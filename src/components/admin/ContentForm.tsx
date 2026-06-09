import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FormRow } from "./formBits";
import { getContent, updateContent } from "@/lib/adminApi";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/api";

export function ContentForm() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "content"],
    queryFn: getContent,
  });
  const [form, setForm] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    if (data) setForm(data);
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
        <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-300">
          About section
        </h3>
        <FormRow>
          <Field label="Eyebrow">
            <Input value={form.about.eyebrow} onChange={(e) => setAbout("eyebrow", e.target.value)} />
          </Field>
          <Field label="Title">
            <Input value={form.about.title} onChange={(e) => setAbout("title", e.target.value)} />
          </Field>
        </FormRow>
        <Field label="Description">
          <Textarea
            value={form.about.description}
            onChange={(e) => setAbout("description", e.target.value)}
            className="min-h-[4.5rem]"
          />
        </Field>
        <FormRow>
          <Field label="Mission heading">
            <Input value={form.about.missionTitle} onChange={(e) => setAbout("missionTitle", e.target.value)} />
          </Field>
          <Field label='"Why work with us" heading'>
            <Input value={form.about.whyTitle} onChange={(e) => setAbout("whyTitle", e.target.value)} />
          </Field>
        </FormRow>
        <Field label="Mission body" hint="Leave a blank line between paragraphs">
          <Textarea
            value={form.about.missionBody}
            onChange={(e) => setAbout("missionBody", e.target.value)}
            className="min-h-[9rem]"
          />
        </Field>
        <Field label="Benefits" hint="One per line">
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
