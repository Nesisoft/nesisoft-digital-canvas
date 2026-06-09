import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, Search, User } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { fetchPosts, resolveImage } from "@/lib/api";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
  const categories = [
    "All",
    ...Array.from(new Set(blogPosts.map((p) => p.category))),
  ];
  const normalizedQuery = query.trim().toLowerCase();

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      !normalizedQuery ||
      [post.title, post.excerpt, post.category, post.author]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    toast.success("You're on the list. We'll only send useful updates.");
    setEmail("");
  };

  return (
    <>
      <Seo
        title="Blog"
        description="Insights on mobile, web, AI and software development across Africa from the Nesisoft team."
        type="article"
      />
      <PageShell>
        <Navbar />
        <PageHeader
          align="center"
          eyebrow="Insights"
          title="Engineering notes for practical product teams"
          description="Short, useful writing on building, launching, and operating software in African markets."
        />

        <Section className="pt-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <span className="sr-only">Search articles</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by topic, author, or category"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20"
                />
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`h-11 flex-shrink-0 rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                      selectedCategory === category
                        ? "border-violet-400/40 bg-violet-500/15 text-violet-100"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section className="pt-0">
          {isLoading ? (
            <EmptyState
              title="Loading articles…"
              description="Fetching the latest posts."
              icon={<FileText className="h-5 w-5" />}
            />
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]"
                >
                  {post.image && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={resolveImage(post.image)}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#080a0f]/75 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                        {post.category}
                      </span>
                    </div>
                  )}
                  <article className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {post.author}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold leading-7 text-white">
                      {post.title}
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">
                      {post.excerpt}
                    </p>
                    <span className="mt-5 text-sm font-medium text-violet-300">
                      Read article
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No articles found"
              description="Try another category or search term."
              icon={<FileText className="h-5 w-5" />}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory("All");
                  }}
                  className="rounded-lg border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-white"
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </Section>

        <Section className="pt-0">
          <form
            onSubmit={handleNewsletterSubmit}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
                  Newsletter
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Useful product and engineering notes, not spam.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Join for occasional writing on software delivery, product
                  quality, and building for African users.
                </p>
              </div>
              <div>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="newsletter-email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20"
                  />
                  <Button className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500">
                    Subscribe
                  </Button>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  No spam. Unsubscribe whenever you want.
                </p>
              </div>
            </div>
          </form>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default Blog;

