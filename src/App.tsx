import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteFallback } from "@/components/RouteFallback";
import { ScrollToTop } from "@/components/ScrollToTop";
import { createQueryClient } from "@/lib/queryClient";
import Index from "./pages/Index";

// Secondary routes are code-split so the landing page (the primary entry
// point) ships without their bundles. Index stays eager for a flash-free LCP.
const ServiceDetails = lazy(() => import("./pages/ServiceDetails"));
const Company = lazy(() => import("./pages/Company"));
const Platforms = lazy(() => import("./pages/Platforms"));
const ClientProjects = lazy(() => import("./pages/ClientProjects"));
const ServicesPage = lazy(() => import("./pages/Services"));
const Industries = lazy(() => import("./pages/Industries"));
const Industry = lazy(() => import("./pages/Industry"));
const Platform = lazy(() => import("./pages/Platform"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const CostCalculator = lazy(() => import("./pages/CostCalculator"));
const AiDevelopment = lazy(() => import("./pages/AiDevelopment"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// AI Blog Studio — authoring tool, only mounted during local development so
// neither the route nor the Groq key ever reaches a production bundle.
const BlogStudio = import.meta.env.DEV
  ? lazy(() => import("./pages/BlogStudio"))
  : null;

const browserQueryClient = createQueryClient();

interface AppProps {
  /**
   * The prerender (src/entry-server.tsx) renders this same tree with a
   * StaticRouter for the page's URL and a query client of its own, so the
   * browser can hydrate that markup instead of rendering the page again.
   */
  router?: ComponentType<{ children?: ReactNode }>;
  queryClient?: QueryClient;
}

const App = ({ router: Router = BrowserRouter, queryClient = browserQueryClient }: AppProps) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Sonner />
      <Router>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/ai-assisted-development" element={<AiDevelopment />} />
            <Route path="/services/:serviceId" element={<ServiceDetails />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/:slug" element={<Industry />} />
            <Route path="/company" element={<Company />} />
            {/* The team moved onto the Company page. */}
            <Route path="/team" element={<Navigate to={{ pathname: "/company", hash: "#team" }} replace />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:postId" element={<BlogDetails />} />
            <Route path="/projects" element={<ClientProjects />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/platforms/:slug" element={<Platform />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/app-cost-calculator" element={<CostCalculator />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<Admin />} />
            {BlogStudio && (
              <Route path="/studio" element={<BlogStudio />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
