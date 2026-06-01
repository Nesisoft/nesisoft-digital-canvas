import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteFallback } from "@/components/RouteFallback";
import Index from "./pages/Index";

// Secondary routes are code-split so the landing page (the primary entry
// point) ships without their bundles. Index stays eager for a flash-free LCP.
const ServiceDetails = lazy(() => import("./pages/ServiceDetails"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// AI Blog Studio — authoring tool, only mounted during local development so
// neither the route nor the Groq key ever reaches a production bundle.
const BlogStudio = import.meta.env.DEV
  ? lazy(() => import("./pages/BlogStudio"))
  : null;

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services/:serviceId" element={<ServiceDetails />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:postId" element={<BlogDetails />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/contact" element={<Contact />} />
              {BlogStudio && (
                <Route path="/studio" element={<BlogStudio />} />
              )}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
