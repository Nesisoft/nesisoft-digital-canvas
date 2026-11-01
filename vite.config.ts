import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { seoPlugin } from "./scripts/seo-plugin";
import { prerenderPlugin } from "./scripts/prerender-plugin";
import { siteConfig } from "./src/config/site";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Same PORT the API reads (from the shell or .env), so the proxy follows it.
  const apiPort = process.env.PORT || loadEnv(mode, process.cwd(), "").PORT || 5050;

  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      proxy: {
        // Dev-only proxy for the Blog Studio's Groq calls. Keeps requests
        // same-origin (no browser CORS) — the studio sends "/groq-api/...".
        "/groq-api": {
          target: "https://api.groq.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/groq-api/, ""),
        },
        // Dev-only proxy to the monolith API process. Lets the app call
        // "/api/..." same-origin in local development too.
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      seoPlugin(siteConfig.url),
      prerenderPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
