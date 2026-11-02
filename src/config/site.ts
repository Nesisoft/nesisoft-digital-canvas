/**
 * Single source of truth for company / contact / brand data.
 *
 * Anything that appears in more than one place (email, phone, location,
 * social links, SEO defaults) lives here so it can never drift out of sync
 * again. Previously these were duplicated across Hero, Contact, Footer and
 * index.html — with three different phone numbers and a broken `info@nesisoft`
 * email. Import from here instead of hardcoding.
 */

export const siteConfig = {
  name: "Nesisoft",
  legalName: "Nesisoft",
  tagline: "Digital Solutions for Africa",

  /**
   * Homepage title and default meta description, worded around what people
   * actually search for. The Seo component appends " | Nesisoft" to the
   * title, as it does on every page. index.html repeats both in its static
   * title / description / og / twitter tags for non-JS crawlers and link
   * previews — keep them in sync, and the description within 160 characters.
   */
  seoTitle: "Software & App Development Company in Accra, Ghana",
  description:
    "Nesisoft is a software development company in Accra, Ghana, building web platforms, mobile apps and custom software for businesses across Africa.",

  /**
   * Public site URL — used for canonical links, sitemap and OG tags. The host
   * 301-redirects the apex (nesisoft.com) to www, so this must stay on www.
   * index.html repeats it in its static canonical / og:url tags.
   */
  url: "https://www.nesisoft.com",

  /** Default social-share image (1200 × 630), generated from the brand mark. */
  ogImage: "https://www.nesisoft.com/og-image.png",

  /** Square logo for structured data (Google's Organization / publisher logo). */
  logo: "https://www.nesisoft.com/brand/nesisoft-logo-512.png",

  contact: {
    // Display strings and their machine-readable hrefs are paired so a tel:
    // or mailto: can never disagree with the text shown to the user.
    emailGeneral: "info@nesisoft.com",
    emailSales: "sales@nesisoft.com",
    phonePrimary: { display: "+233 553 140 807", href: "tel:+233553140807" },
    phoneSecondary: { display: "+233 555 351 068", href: "tel:+233555351068" },
    location: "Accra, Ghana",
    region: "Serving Africa & Beyond",
    // Scheduling page for "Book a call": a Cal.com or Calendly link such as
    // "https://cal.com/your-name/30min". When set, the footer and /contact
    // open it in a new tab; leave it empty to keep the phone link instead.
    bookingUrl: "https://cal.com/nesisoft" as string,
  },

  social: {
    twitter: "@nesisoft_inc",
    facebook: "",
    linkedin: "",
    instagram: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
