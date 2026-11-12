/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key — enables contact-form and newsletter-signup delivery. */
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
  /** Plausible analytics domain — enables privacy-friendly analytics. */
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  /** Groq API key — DEV ONLY, powers the Blog Studio. Never deploy with this set. */
  readonly VITE_GROQ_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** The bundled posts' frontmatter, newest first (scripts/blog-index-plugin.ts). */
declare module "virtual:blog-index" {
  const posts: import("@/lib/api").BlogIndexEntry[];
  export default posts;
}
