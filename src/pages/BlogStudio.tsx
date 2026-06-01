import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, Download, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  generateBlogPost,
  assembleMarkdown,
  slugify,
  type BlogLength,
} from "@/lib/groq";
import { siteConfig } from "@/config/site";

const inputClass =
  "bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus-visible:ring-purple-500 focus-visible:border-purple-500";

const LENGTHS: { value: BlogLength; label: string }[] = [
  { value: "short", label: "Short (~450 words)" },
  { value: "medium", label: "Medium (~850 words)" },
  { value: "long", label: "Long (~1500 words)" },
];

/**
 * Dev-only AI authoring tool. Feed a topic + length, generate a draft with
 * Groq, tweak it, then download the ready-to-commit Markdown file into
 * src/content/blog/. Never bundled in production (route is gated on DEV).
 */
const BlogStudio = () => {
  // Generation inputs
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<BlogLength>("medium");
  const [category, setCategory] = useState("Technology");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);

  // Editable draft (populated by the model, then yours to refine)
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("Nesisoft Team");

  const hasDraft = title || body;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first.");
      return;
    }
    setLoading(true);
    try {
      const post = await generateBlogPost({ topic, length, category, tone });
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setBody(post.body);
      toast.success("Draft generated. Edit freely, then download.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const buildFile = () =>
    assembleMarkdown({
      title,
      excerpt,
      body,
      category,
      author,
      image,
      date: new Date().toISOString().split("T")[0],
    });

  const handleDownload = () => {
    const slug = slugify(title) || "untitled-post";
    const blob = new Blob([buildFile()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Saved ${slug}.md — drop it into src/content/blog/`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildFile());
    toast.success("Markdown copied to clipboard.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center text-purple-300 hover:text-purple-200 mb-8 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-violet-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Blog Studio
          </h1>
        </div>
        <p className="text-slate-300 mb-8 max-w-2xl">
          Draft a post with AI, refine it, then download the Markdown into{" "}
          <code className="text-violet-300">src/content/blog/</code>. This tool is
          local-only — your Groq key never ships to production.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ---- Controls + editor ---- */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="font-semibold text-lg">1. Generate</h2>
              <div>
                <label htmlFor="topic" className="block text-sm text-slate-300 mb-1">
                  Topic
                </label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`${inputClass} min-h-[72px]`}
                  placeholder="e.g. How mobile money is reshaping retail in Ghana"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="length" className="block text-sm text-slate-300 mb-1">
                    Length
                  </label>
                  <select
                    id="length"
                    value={length}
                    onChange={(e) => setLength(e.target.value as BlogLength)}
                    className={`${inputClass} w-full h-10 px-3`}
                  >
                    {LENGTHS.map((l) => (
                      <option key={l.value} value={l.value} className="bg-slate-900">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm text-slate-300 mb-1">
                    Category
                  </label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="tone" className="block text-sm text-slate-300 mb-1">
                  Tone <span className="text-slate-400">(optional)</span>
                </label>
                <Input
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={inputClass}
                  placeholder="professional yet approachable"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl"
              >
                {loading ? (
                  <>
                    Generating… <Loader2 className="ml-2 animate-spin" size={18} />
                  </>
                ) : (
                  <>
                    Generate draft <Wand2 className="ml-2" size={18} />
                  </>
                )}
              </Button>
            </div>

            {hasDraft && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <h2 className="font-semibold text-lg">2. Refine</h2>
                <div>
                  <label htmlFor="title" className="block text-sm text-slate-300 mb-1">Title</label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="excerpt" className="block text-sm text-slate-300 mb-1">Excerpt</label>
                  <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={`${inputClass} min-h-[60px]`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="author" className="block text-sm text-slate-300 mb-1">Author</label>
                    <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="image" className="block text-sm text-slate-300 mb-1">Image URL</label>
                    <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="https://…" />
                  </div>
                </div>
                <div>
                  <label htmlFor="body" className="block text-sm text-slate-300 mb-1">Body (Markdown)</label>
                  <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className={`${inputClass} min-h-[260px] font-mono text-sm`} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-500 rounded-xl">
                    Download .md <Download className="ml-2" size={18} />
                  </Button>
                  <Button onClick={handleCopy} variant="outline" className="border-white/20 hover:bg-white/10 rounded-xl">
                    Copy <Copy className="ml-2" size={18} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ---- Live preview ---- */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold text-lg mb-4">Preview</h2>
            {hasDraft ? (
              <article>
                <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
                {excerpt && <p className="text-slate-300 italic mb-6">{excerpt}</p>}
                <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-violet-400 prose-strong:text-white prose-li:marker:text-violet-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                </div>
              </article>
            ) : (
              <p className="text-slate-400">Your generated post will appear here.</p>
            )}
          </div>
        </div>

        <p className="text-slate-400 text-xs mt-8">
          Powered by Groq · {siteConfig.name} Blog Studio · development tool
        </p>
      </div>
    </div>
  );
};

export default BlogStudio;
