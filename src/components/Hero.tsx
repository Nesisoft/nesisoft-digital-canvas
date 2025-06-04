
import React from "react";
import { ArrowRight, Code, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
                {" "}Ideas
              </span>
              <br />
              Into Digital Reality
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Nesisoft is a full-cycle software development company specializing in web, mobile, desktop, and IoT applications. We transform innovative ideas into impactful digital solutions across Africa and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-purple-800 hover:bg-purple-50 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-purple-800 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                View Our Work
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-105 transition-all duration-300">
                  <Code className="text-purple-300 mb-4" size={40} />
                  <h3 className="text-white font-semibold text-lg mb-2">Custom Software</h3>
                  <p className="text-purple-100 text-sm">Tailored solutions for your unique business needs</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-105 transition-all duration-300 mt-8">
                  <Smartphone className="text-purple-300 mb-4" size={40} />
                  <h3 className="text-white font-semibold text-lg mb-2">Mobile Apps</h3>
                  <p className="text-purple-100 text-sm">Native and cross-platform mobile solutions</p>
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-105 transition-all duration-300">
                  <Globe className="text-purple-300 mb-4" size={40} />
                  <h3 className="text-white font-semibold text-lg mb-2">Web Development</h3>
                  <p className="text-purple-100 text-sm">Responsive and scalable web applications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
