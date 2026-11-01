import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "./ImageField";
import { Field, FormRow } from "./formBits";
import type { AdminPost } from "@/lib/adminApi";

const today = () => new Date().toISOString().slice(0, 10);

interface PostFormProps {
  post: AdminPost | null;
  saving: boolean;
  onSave: (payload: Partial<AdminPost>) => void;
  onDelete: () => void;
}

export function PostForm({ post, saving, onSave, onDelete }: PostFormProps) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    author: "Nesisoft Team",
    date: today(),
    excerpt: "",
    image: "",
    content: "",
    published: true,
  });

  useEffect(() => {
    setForm({
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      category: post?.category ?? "",
      author: post?.author ?? "Nesisoft Team",
      date: post?.date ? post.date.slice(0, 10) : today(),
      excerpt: post?.excerpt ?? "",
      image: post?.image ?? "",
      content: post?.content ?? "",
      published: post?.published ?? true,
    });
  }, [post]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-5">
      <Field label="Title">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <FormRow>
        <Field label="Slug (URL)" hint="Leave blank to derive from title">
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from title" />
        </Field>
        <Field label="Category">
          <Input value={form.category} onChange={(e) => set("category", e.target.value)} />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Author">
          <Input value={form.author} onChange={(e) => set("author", e.target.value)} />
        </Field>
        <Field label="Date">
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
      </FormRow>
      <Field label="Excerpt">
        <Textarea
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          className="min-h-[5rem]"
        />
      </Field>
      <Field label="Cover image" hint="Paste a URL or upload (stored in Supabase Storage)">
        <ImageField value={form.image} onChange={(url) => set("image", url)} />
      </Field>
      <Field label="Content (Markdown)">
        <Textarea
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          className="min-h-[16rem] font-mono text-sm"
        />
      </Field>
      <label className="flex items-center gap-3">
        <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
        <span className="text-sm text-slate-300">Published</span>
      </label>

      <div className="flex items-center gap-3 border-t border-white/10 pt-5">
        <Button
          disabled={saving}
          onClick={() => onSave(form)}
          className="rounded-lg bg-violet-600 text-white hover:bg-violet-500"
        >
          {saving ? "Saving…" : post ? "Save changes" : "Create post"}
        </Button>
        <span className="flex-1" />
        {post && (
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
