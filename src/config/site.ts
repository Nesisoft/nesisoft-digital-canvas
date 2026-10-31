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
  description:
    "Nesisoft is a full-cycle software development company building custom web, mobile, desktop, and IoT applications, as well as impactful platforms like Agoo, Sua, Adesuapa, and Jua for Africa's digital growth.",

  /**
   * Public site URL — used for canonical links, sitemap and OG tags. The host
   * 301-redirects the apex (nesisoft.com) to www, so this must stay on www.
   * index.html repeats it in its static canonical / og:url tags.
   */
  url: "https://www.nesisoft.com",

  /** Default social-share image. Replace with a hosted brand asset. */
  ogImage: "https://i.ibb.co/8nvq5Kx2/appstore.png",

  contact: {
    // Display strings and their machine-readable hrefs are paired so a tel:
    // or mailto: can never disagree with the text shown to the user.
    emailGeneral: "info@nesisoft.com",
    emailSales: "sales@nesisoft.com",
    phonePrimary: { display: "+233 553 140 807", href: "tel:+233553140807" },
    phoneSecondary: { display: "+233 555 351 068", href: "tel:+233555351068" },
    location: "Accra, Ghana",
    region: "Serving Africa & Beyond",
  },

  social: {
    twitter: "@nesisoft_inc",
    facebook: "",
    linkedin: "",
    instagram: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
