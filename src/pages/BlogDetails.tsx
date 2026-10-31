import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, blogPostingJsonLd, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { getPostBySlug } from "@/lib/blog";
import { fetchPost, resolveImage } from "@/lib/api";

const BlogDetails = () => {
  const { postId } = useParams();
  // A bundled Markdown post with this slug renders instantly (as placeholder
  // data, so isLoading stays false) and stays up if the API can't serve it;
  // the API's version replaces it once it arrives.
  const bundledPost = getPostBySlug(postId);
  const { data: blogPost = bundledPost, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId!),
    enabled: !!postId,
    retry: false,
    placeholderData: bundledPost,
  });

  if (isLoading) {
    return (
      <>
        <Seo title="Loading…" noindex />
        <PageShell>
          <Navbar />
          <PageHeader
            backTo="/blog"
            backLabel="Back to blog"
            eyebrow="Article"
            title="Loading article…"
            description="Fetching the latest version of this post."
          />
          <Footer />
        </PageShell>
      </>
    );
  }

  if (!blogPost) {
    return (
      <>
        <Seo title="Post Not Found" noindex />
        <PageShell>
          <Navbar />
          <PageHeader
            backTo="/blog"
            backLabel="Back to blog"
            eyebrow="Article"
            title="Post not found"
            description="That article does not exist or may have moved."
          />
          <Section className="pt-0">
            <EmptyState
              title="No matching article"
              description="Return to the blog to browse the available posts."
              action={
                <Button asChild className="rounded-lg bg-violet-600 text-white hover:bg-violet-500">
                  <Link to="/blog">
                    View blog
                  </Link>
                </Button>
              }
            />
          </Section>
          <Footer />
        </PageShell>
      </>
    );
  }

  return (
    <>
      <Seo
        title={blogPost.title}
        description={blogPost.excerpt}
        image={blogPost.image}
        type="article"
        article={{
          publishedTime: blogPost.date,
          modifiedTime: blogPost.date,
          author: blogPost.author,
          section: blogPost.category,
        }}
        jsonLd={[
          blogPostingJsonLd(blogPost),
          breadcrumbsJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: blogPost.title, path: `/blog/${blogPost.slug}` },
          ]),
        ]}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          backTo="/blog"
          backLabel="Back to blog"
          eyebrow={blogPost.category}
          title={blogPost.title}
          description={blogPost.excerpt}
        >
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <User className="h-4 w-4 text-violet-300" />
              {blogPost.author}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Calendar className="h-4 w-4 text-violet-300" />
              {new Date(blogPost.date).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Clock className="h-4 w-4 text-violet-300" />
              {blogPost.readTime}
            </span>
          </div>
        </PageHeader>

        {blogPost.image && (
          <Section className="pt-0">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <img
                src={resolveImage(blogPost.image)}
                alt={blogPost.title}
                className="h-[22rem] w-full object-cover opacity-90 md:h-[34rem]"
              />
            </div>
          </Section>
        )}

        <Section className="pt-0" containerClassName="max-w-3xl">
          <article className="prose prose-lg prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-p:leading-8 prose-p:text-slate-300 prose-a:text-violet-300 prose-strong:text-white prose-li:text-slate-300 prose-li:marker:text-violet-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blogPost.content}
            </ReactMarkdown>
          </article>
        </Section>

        <Section className="pt-0" containerClassName="max-w-3xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Building something similar?
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Tell us what you are working on and we will help you shape it
                  into a clear build plan.
                </p>
              </div>
              <Button asChild className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500">
                <Link to="/contact">
                  Start a project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default BlogDetails;

