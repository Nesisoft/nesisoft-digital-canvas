// Simpler version without the loader issue
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LabeledDivider } from "@/components/ui/labeled-divider";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash scrolling
    if (location.hash) {
      const elementId = location.hash.replace("#", "");

      // Wait for components to render
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="">
      <FloatingActionButton />
      <Navbar />
      <Hero />
      <LabeledDivider label="About" />
      <About />
      <LabeledDivider label="Services" />
      <Services />
      <LabeledDivider label="Projects" />
      <Projects />
      <LabeledDivider label="Contact" />
      <Contact />
      <LabeledDivider label="Helpful Links" />
      <Footer />
    </div>
  );
};

export default Index;
