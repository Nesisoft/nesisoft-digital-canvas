import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/config/site";

interface ArticleMeta {
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

interface SeoProps {
  title?: string;
  description?: string;
  /** Path-relative or absolute image URL for social cards. */
  image?: string;
  /** "website" | "article" — drives og:type. */
  type?: "website" | "article";
  /** Set true on pages that should not be indexed (e.g. 404, thank-you). */
  noindex?: boolean;
  /** Optional JSON-LD structured data — pass a single object or an array. */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Per-article metadata, used when `type === "article"`. */
  article?: ArticleMeta;
  /** Override the canonical URL (rare — defaults to siteConfig.url + pathname). */
  canonical?: string;
}

/**
 * Client-side head management — sets <title>, meta description, canonical,
 * Open Graph / Twitter tags and optional JSON-LD per route.
 *
 * NOTE: Effect-based. Googlebot executes JS so it picks these up, but social
 * scrapers (Slack/iMessage/older crawlers) only read the static index.html.
 * For perfect non-JS link previews we need SSR/prerender (Phase 4).
 *
 * Companion helpers below build JSON-LD payloads for each page type.
 */
export function Seo({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  type = "website",
  noindex = false,
  jsonLd,
  article,
  canonical,
}: SeoProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${siteConfig.name}`
      : `${siteConfig.name} | ${siteConfig.tagline}`;
    document.title = fullTitle;

    const url = canonical ?? `${siteConfig.url}${pathname}`;
    const absoluteImage = image.startsWith("http")
      ? image
      : `${siteConfig.url}${image}`;

    const tags: Array<[string, string, string | undefined]> = [
      ["name", "description", description],
      ["name", "robots", noindex ? "noindex, nofollow" : "index, follow"],
      // Open Graph
      ["property", "og:title", fullTitle],
      ["property", "og:description", description],
      ["property", "og:type", type],
      ["property", "og:url", url],
      ["property", "og:image", absoluteImage],
      ["property", "og:site_name", siteConfig.name],
      ["property", "og:locale", "en_US"],
      // Twitter
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", fullTitle],
      ["name", "twitter:description", description],
      ["name", "twitter:image", absoluteImage],
      ["name", "twitter:site", siteConfig.social.twitter || undefined],
      // Article-specific (only emitted when present)
      ["property", "article:published_time", article?.publishedTime],
      ["property", "article:modified_time", article?.modifiedTime],
      ["property", "article:author", article?.author],
      ["property", "article:section", article?.section],
    ];

    tags.forEach(([attr, key, value]) => {
      const selector = `meta[${attr}="${key}"]`;
      const existing = document.head.querySelector<HTMLMetaElement>(selector);
      if (value === undefined || value === "") {
        existing?.remove();
        return;
      }
      const el = existing ?? document.createElement("meta");
      if (!existing) {
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    });

    let link = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);

    // JSON-LD structured data — one or many schemas per page.
    document
      .querySelectorAll('script[data-seo-jsonld="true"]')
      .forEach((node) => node.remove());
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.seoJsonld = "true";
        script.text = JSON.stringify(block);
        document.head.appendChild(script);
      });
    }
  }, [title, description, image, type, noindex, jsonLd, article, canonical, pathname]);

  return null;
}

/* ------------------------------ JSON-LD helpers ------------------------------ */

/** Reused on the homepage. Describes the company itself. */
export const organizationJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: siteConfig.ogImage,
  description: siteConfig.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Accra",
    addressCountry: "GH",
  },
  email: siteConfig.contact.emailGeneral,
  telephone: siteConfig.contact.phonePrimary.display,
  sameAs: Object.values(siteConfig.social).filter(Boolean),
};

/** Tells Google what the site is + enables sitelinks search box. */
export const websiteJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "en",
};

/** Crumb trail for nested pages — improves "in-result" navigation in SERPs. */
export function breadcrumbsJsonLd(
  trail: Array<{ name: string; path: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${siteConfig.url}${step.path}`,
    })),
  };
}

/** Per-blog-post schema — enables rich results for articles. */
export function blogPostingJsonLd(post: {
  title: string;
  excerpt: string;
  image?: string;
  date: string;
  author: string;
  slug: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image
      ? post.image.startsWith("http")
        ? post.image
        : `${siteConfig.url}${post.image}`
      : siteConfig.ogImage,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: siteConfig.ogImage },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

/** Per-service schema — describes what we offer for service pages. */
export function serviceJsonLd(service: {
  title: string;
  description: string;
  slug: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    url: `${siteConfig.url}/services/${service.slug}`,
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    areaServed: "Africa",
  };
}
