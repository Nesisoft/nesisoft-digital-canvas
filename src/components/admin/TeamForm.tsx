import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "./ImageField";
import { Field, FormRow } from "./formBits";
import type { AdminTeamMember } from "@/lib/adminApi";

interface TeamFormProps {
  member: AdminTeamMember | null;
  saving: boolean;
  onSave: (payload: Partial<AdminTeamMember>) => void;
  onDelete: () => void;
}

export function TeamForm({ member, saving, onSave, onDelete }: TeamFormProps) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    order: 0,
    linkedin: "",
    twitter: "",
    github: "",
    published: true,
  });

  useEffect(() => {
    setForm({
      name: member?.name ?? "",
      role: member?.role ?? "",
      bio: member?.bio ?? "",
      image: member?.image ?? "",
      order: member?.order ?? 0,
      linkedin: member?.socials?.linkedin ?? "",
      twitter: member?.socials?.twitter ?? "",
      github: member?.socials?.github ?? "",
      published: member?.published ?? true,
    });
  }, [member]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () =>
    onSave({
      name: form.name,
      role: form.role,
      bio: form.bio,
      image: form.image,
      order: Number(form.order) || 0,
      published: form.published,
      socials: { linkedin: form.linkedin, twitter: form.twitter, github: form.github },
    });

  return (
    <div className="space-y-5">
      <FormRow>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Role">
          <Input value={form.role} onChange={(e) => set("role", e.target.value)} />
        </Field>
      </FormRow>
      <Field label="Bio">
        <Textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          className="min-h-[6rem]"
        />
      </Field>
      <Field label="Photo" hint="Paste a URL or upload (stored in MongoDB)">
        <ImageField value={form.image} onChange={(url) => set("image", url)} round />
      </Field>
      <FormRow>
        <Field label="LinkedIn URL">
          <Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
        </Field>
        <Field label="Display order" hint="Lower shows first">
          <Input
            type="number"
            value={form.order}
            onChange={(e) => set("order", Number(e.target.value))}
          />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Twitter / X URL">
          <Input value={form.twitter} onChange={(e) => set("twitter", e.target.value)} />
        </Field>
        <Field label="GitHub URL">
          <Input value={form.github} onChange={(e) => set("github", e.target.value)} />
        </Field>
      </FormRow>
      <label className="flex items-center gap-3">
        <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
        <span className="text-sm text-slate-300">Published</span>
      </label>

      <div className="flex items-center gap-3 border-t border-white/10 pt-5">
        <Button
          disabled={saving}
          onClick={submit}
          className="rounded-lg bg-violet-600 text-white hover:bg-violet-500"
        >
          {saving ? "Saving…" : member ? "Save changes" : "Add member"}
        </Button>
        <span className="flex-1" />
        {member && (
          <Button
            variant="outline"
            onClick={onDelete}
            className="rounded-lg border-red-500/40 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
