import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import Services from "@/components/Services";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { PageShell } from "@/components/ui/page-shell";
import { Seo, organizationJsonLd, websiteJsonLd } from "@/components/Seo";

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
      <Contact />
      <Footer />
      <FloatingActionButton />
    </PageShell>
  );
};

export default Index;
