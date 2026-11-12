import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import Services from "@/components/Services";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import LatestPosts from "@/components/LatestPosts";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { PageShell } from "@/components/ui/page-shell";
import { Seo, organizationJsonLd, websiteJsonLd } from "@/components/Seo";
import { lazy, Suspense } from "react";

// The contact section is the last thing on the page and brings the form's
// code (react-hook-form, validation), so it loads on its own instead of
// holding up the first screen. It's still prerendered: the HTML is there at
// once and becomes interactive when its code arrives.
const Contact = lazy(() => import("@/components/Contact"));

const Index = () => {
  return (
    <PageShell>
      <Seo jsonLd={[organizationJsonLd, websiteJsonLd]} />
      <Navbar />
      <Hero />
      <ClientLogos />
      <About />
      <Services />
      <Projects />
      <Testimonials />
      <LatestPosts />
      <Suspense fallback={<div id="contact" className="min-h-[56rem]" />}>
        <Contact />
      </Suspense>
      <Footer />
      <FloatingActionButton />
    </PageShell>
  );
};

export default Index;
