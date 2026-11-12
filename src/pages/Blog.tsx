import { useState } from "react";
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
import { formatPostDate, getAllPosts } from "@/lib/blog";
import { fetchPostSummaries, resolveImage, type PostSummary } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { WEB3FORMS_KEY, submitToWeb3Forms } from "@/lib/web3forms";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);


  // The bundled Markdown posts render instantly and stand in whenever the API
  // can't serve the list; a successful API response (managed in /admin) wins.
  // Without bundled posts, the skeleton and error state below still apply.
  const bundledPosts = getAllPosts();
  const { data: blogPosts = bundledPosts, isLoading, isError, refetch, isFetching } = useQuery<PostSummary[]>({
    queryKey: ["posts", "summary"],
    queryFn: fetchPostSummaries,
    placeholderData: bundledPosts.length > 0 ? bundledPosts : undefined,
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

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || subscribing) return;

    // Honeypot: hidden from people, so only bots ever tick it. They get the
    // usual success message, but nothing is sent.
    const isBot = new FormData(event.currentTarget).has("botcheck");
    if (!isBot) trackEvent("Newsletter Signup");

    setSubscribing(true);
    try {
      if (!isBot) {
        await submitToWeb3Forms({
          from_name: "Nesisoft website",
          subject: "[Website] Newsletter signup",
          email,
          message: `${email} signed up via the blog newsletter form.`,
        });
      }
      toast.success("You're on the list. We'll only send useful updates.");
      setEmail("");
    } catch (err) {
      console.error(err);
      toast.error("We couldn't sign you up just now. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <Seo
        title="Software Development Insights for African Businesses"
        description="Practical articles from the Nesisoft team in Accra on web and mobile app development, AI and launching software products for businesses across Africa."
      />
      <PageShell>
        <Navbar />
        <PageHeader
          align="center"
          eyebrow="Insights"
          title="Engineering notes for practical product teams"
          description="Short, useful writing on building, launching, and operating software in African markets."
        />

        {/* Filters only make sense once there is something to filter. */}
        {blogPosts.length > 0 && (
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
        )}

        <Section className="pt-0">
          {isLoading ? (
            <div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-busy="true"
              aria-label="Loading articles"
            >
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />
                  <div className="space-y-3 p-6">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-white/[0.08]" />
                    <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError && blogPosts.length === 0 ? (
            <EmptyState
              title="Articles didn't load"
              description="We couldn't reach the blog just now. Check your connection and try again."
              icon={<FileText className="h-5 w-5" />}
              action={
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="rounded-lg border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-white"
                >
                  {isFetching ? "Retrying…" : "Try again"}
                </Button>
              }
            />
          ) : blogPosts.length === 0 ? (
            <EmptyState
              title="New writing is on the way"
              description="We're preparing our first articles. In the meantime, tell us what you're building."
              icon={<FileText className="h-5 w-5" />}
              action={
                <Button asChild className="rounded-lg bg-violet-600 text-white hover:bg-violet-500">
                  <Link to="/contact">Start a conversation</Link>
                </Button>
              }
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
                      <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#09090b]/75 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                        {post.category}
                      </span>
                    </div>
                  )}
                  <article className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatPostDate(post.date)}
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

        {/* Signups are emailed via Web3Forms; without a key there's nowhere to send them. */}
        {WEB3FORMS_KEY && (
          <Section className="pt-0">
            <form
              onSubmit={handleNewsletterSubmit}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-end">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold-300">
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
                      readOnly={subscribing}
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="h-11 min-w-0 sm:flex-1 rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20"
                    />
                    <input
                      type="checkbox"
                      name="botcheck"
                      className="hidden"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <Button
                      type="submit"
                      disabled={subscribing}
                      className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500 disabled:opacity-70"
                    >
                      {subscribing ? "Subscribing…" : "Subscribe"}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    No spam. We only use your email for these updates; reply
                    to any of them to unsubscribe. See our{" "}
                    <Link
                      to="/privacy"
                      className="text-violet-300 underline underline-offset-2 transition-colors hover:text-violet-200"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </form>
          </Section>
        )}

        <Footer />
      </PageShell>
    </>
  );
};

export default Blog;

