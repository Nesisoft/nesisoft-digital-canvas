import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, MessageSquare, Send, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, blogPostingJsonLd, breadcrumbsJsonLd } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { fetchPost, resolveImage } from "@/lib/api";

const BlogDetails = () => {
  const { postId } = useParams();
  const { data: blogPost, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId!),
    enabled: !!postId,
    retry: false,
  });
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentData, setCommentData] = useState({ fullName: "", comment: "" });
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      comment:
        "Great article. The African market constraints angle is especially useful.",
      date: "2024-01-16",
    },
    {
      id: 2,
      name: "Michael Osei",
      comment: "Clear and practical. Looking forward to more posts like this.",
      date: "2024-01-17",
    },
  ]);


  const handleCommentSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentData.fullName.trim() || !commentData.comment.trim()) return;

    setComments((current) => [
      ...current,
      {
        id: current.length + 1,
        name: commentData.fullName.trim(),
        comment: commentData.comment.trim(),
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    setCommentData({ fullName: "", comment: "" });
    setShowCommentForm(false);
  };

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

        <Section className="border-t border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center text-2xl font-semibold text-white">
                  <MessageSquare className="mr-3 h-5 w-5 text-violet-300" />
                  Comments ({comments.length})
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Local comments are for frontend interaction only.
                </p>
              </div>
              <Button
                onClick={() => setShowCommentForm((value) => !value)}
                className="h-10 rounded-lg bg-violet-600 px-4 text-white hover:bg-violet-500"
              >
                Add comment
              </Button>
            </div>

            {showCommentForm && (
              <form
                onSubmit={handleCommentSubmit}
                className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="grid gap-5">
                  <div>
                    <label
                      htmlFor="comment-name"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Full name
                    </label>
                    <Input
                      id="comment-name"
                      value={commentData.fullName}
                      onChange={(event) =>
                        setCommentData((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      className="rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-400"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="comment-body"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Comment
                    </label>
                    <Textarea
                      id="comment-body"
                      value={commentData.comment}
                      onChange={(event) =>
                        setCommentData((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                      className="min-h-[8rem] rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-400"
                      placeholder="Share your thoughts..."
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      className="rounded-lg bg-violet-600 text-white hover:bg-violet-500"
                    >
                      Post comment
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCommentForm(false)}
                      className="rounded-lg border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[999px] border border-white/10 bg-white/[0.05] text-sm font-semibold text-white">
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-medium text-white">
                          {comment.name}
                        </h3>
                        <time className="text-xs text-slate-400">
                          {new Date(comment.date).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default BlogDetails;

