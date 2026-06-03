import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { PageShell } from "@/components/ui/page-shell";
import { Seo, organizationJsonLd, websiteJsonLd } from "@/components/Seo";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash scrolling after the page renders.
    if (location.hash) {
      const elementId = location.hash.replace("#", "");
      setTimeout(() => {
        document
          .getElementById(elementId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location]);

  return (
    <PageShell>
      <Seo jsonLd={[organizationJsonLd, websiteJsonLd]} />
      <FloatingActionButton />
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Projects />
      <Team />
      <Contact />
      <Footer />
    </PageShell>
  );
};

export default Index;
