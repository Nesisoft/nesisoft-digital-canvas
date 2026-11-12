import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import bundledPosts from "virtual:blog-index";
import { Section, SectionHeading } from "@/components/ui/section";
import { fetchPostSummaries, resolveImage, type BlogIndexEntry } from "@/lib/api";
import { formatPostDate } from "@/lib/postDate";

const SHOWN = 3;

/**
 * The newest articles, on the homepage. Prerendered from the bundled posts'
 * frontmatter (virtual:blog-index, without the article text), so the links
 * are in the HTML crawlers first see; the live list from the API replaces it,
 * so posts written or unpublished in /admin show as they are.
 */
const LatestPosts = () => {
  const { data: posts = bundledPosts } = useQuery<BlogIndexEntry[]>({
    queryKey: ["posts", "summary"],
    queryFn: fetchPostSummaries,
    placeholderData: bundledPosts,
  });
  const latest = posts.slice(0, SHOWN);
  if (latest.length === 0) return null;

  return (
    <Section id="writing">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          align="left"
          eyebrow="Writing"
          title="Guides for building in Ghana"
          description="Practical answers on what software costs, taking payments, using AI and choosing what to build."
        />
        <Link to="/blog" className="shrink-0 text-sm font-medium text-violet-300 hover:text-violet-200">
          All articles →
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {latest.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition-colors hover:border-violet-500/30 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
          >
            {post.image && (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={resolveImage(post.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={360}
                  className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold-300">{post.category}</p>
              <h3 className="mt-3 text-lg font-semibold leading-7 text-white">{post.title}</h3>
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-300">{post.excerpt}</p>
              <p className="mt-5 text-xs text-slate-400">{formatPostDate(post.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
};

export default LatestPosts;
