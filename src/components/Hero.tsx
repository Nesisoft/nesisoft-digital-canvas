import React from "react";

import { Link } from "react-router-dom";

import { ArrowRight, ChevronDown, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 md:pt-16"
    >
      {/* Base gradient background */}

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-violet-950" />

      {/* Subtle grid pattern overlay */}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow effects */}

      <div className="absolute inset-0 overflow-hidden">
        {/* Primary glow - top left */}

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />

        {/* Secondary glow - right side */}

        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

        {/* Accent glow - bottom */}

        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Gradient overlay for depth */}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Badge */}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />

            <span className="text-sm text-slate-300">
              Crafting Digital Excellence
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
            Transform Ideas Into
            <span className="block mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Digital Reality
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            We are Nesisoft - a full-cycle software development company
            specializing in web, mobile, and custom solutions that drive
            innovation across Africa and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/contact">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 group">
                Get Started
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform group-hover:text-purple-50"
                  size={20}
                />
              </Button>
            </Link>
            ˀˀ
            <Button
              variant="outline"
              className="border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm hover:text-white group"
            >
              <Play
                size={20}
                className="mr-2 transition-transform group-hover:scale-110 group-hover:text-purple-500"
              />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                10+
              </div>

              <div className="text-slate-400 text-sm">Projects Completed</div>
            </div>

            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                5+
              </div>

              <div className="text-slate-400 text-sm">Happy Clients</div>
            </div>

            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                5+
              </div>

              <div className="text-slate-400 text-sm">Years Experience</div>
            </div>

            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                5+
              </div>

              <div className="text-slate-400 text-sm">Team Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown
          className="w-8 h-8 text-purple-400 animate-pulse"
          strokeWidth={2.5}
        />
      </div>
    </section>
  );
};

export default Hero;
