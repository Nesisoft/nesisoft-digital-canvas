import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { seoPlugin } from "./scripts/seo-plugin";

const SITE_URL = "https://nesisoft.com";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Dev-only proxy for the Blog Studio's Groq calls. Keeps requests
      // same-origin (no browser CORS) — the studio sends "/groq-api/...".
      "/groq-api": {
        target: "https://api.groq.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/groq-api/, ""),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    seoPlugin(SITE_URL),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
