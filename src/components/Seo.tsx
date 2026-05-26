import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/config/site";

interface SeoProps {
  title?: string;
  description?: string;
  /** Path-relative or absolute image URL for social cards. */
  image?: string;
  /** "website" | "article" — drives og:type. */
  type?: "website" | "article";
  /** Set true on pages that should not be indexed (e.g. thank-you pages). */
  noindex?: boolean;
  /** Optional JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>;
}

/**
 * Client-side head management — sets <title>, meta description, canonical,
 * Open Graph / Twitter tags and optional JSON-LD per route.
 *
 * NOTE: This runs in the browser. Googlebot executes JS so it will pick these
 * up, but non-JS social scrapers (Slack/iMessage/old crawlers) read the static
 * index.html. For perfect link previews per-route we need SSR/prerender — that
 * is Phase 4 (Next.js migration). Until then index.html carries sane defaults.
 */
export function Seo({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${siteConfig.name}`
      : `${siteConfig.name} | ${siteConfig.tagline}`;
    document.title = fullTitle;

    const canonical = `${siteConfig.url}${pathname}`;
    const absoluteImage = image.startsWith("http")
      ? image
      : `${siteConfig.url}${image}`;

    const tags: Array<[string, string, string]> = [
      ["name", "description", description],
      ["name", "robots", noindex ? "noindex, nofollow" : "index, follow"],
      ["property", "og:title", fullTitle],
      ["property", "og:description", description],
      ["property", "og:type", type],
      ["property", "og:url", canonical],
      ["property", "og:image", absoluteImage],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", fullTitle],
      ["name", "twitter:description", description],
      ["name", "twitter:image", absoluteImage],
    ];

    tags.forEach(([attr, key, value]) => {
      let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`
      );
      if (!el) {
        el = document.createElement("meta");
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
    link.setAttribute("href", canonical);

    // JSON-LD structured data (managed in a dedicated, removable node).
    const LD_ID = "seo-jsonld";
    document.getElementById(LD_ID)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = LD_ID;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, image, type, noindex, jsonLd, pathname]);

  return null;
}

/** Organization schema for the homepage. */
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
};
