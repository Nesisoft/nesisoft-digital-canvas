import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LabeledDivider } from "@/components/ui/labeled-divider";
import FloatingActionButton from "@/components/ui/FloatingActionButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
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
