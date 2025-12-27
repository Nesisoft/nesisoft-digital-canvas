import React from "react";
import { Users, Target, Award, Globe, CheckCircle2 } from "lucide-react";

const About = () => {
  const stats = [
    { icon: Users, number: "5+", label: "Happy Clients" },
    { icon: Target, number: "10+", label: "Projects Completed" },
    { icon: Award, number: "5+", label: "Years Experience" },
    { icon: Globe, number: "2+", label: "Countries Served" },
  ];

  const benefits = [
    "Full-cycle development from concept to deployment",
    "Expert team with proven track record",
    "Focus on African market understanding",
    "Innovative solutions for real-world problems",
  ];

  return (
    <section id="about" className="relative py-24 bg-gradient-to-b from-slate-50 via-gray-50 to-purple-50/30 overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-medium rounded-full mb-4">
            Who We Are
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-500">Nesisoft</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are committed to transforming innovative ideas into practical,
            impactful digital solutions tailored to meet the evolving needs of
            businesses across Africa and beyond.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch mb-20">
          {/* Mission Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Our Mission</h3>
            </div>
            <div className="space-y-5">
              <p className="text-gray-600 leading-relaxed">
                Our services empower clients to innovate, grow, and thrive in the
                digital economy. We don't just provide solutions; we create jobs,
                increase digital inclusion, and build long-term economic value on
                the continent.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through our ventures like Agoo, Sua, Adesuapa, and Jua, we
                actively develop scalable digital platforms that solve local and
                regional problems while supporting our client-based development
                work.
              </p>
            </div>
          </div>

          {/* Why Choose Us Card */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-600 to-purple-700 rounded-3xl p-8 md:p-10 shadow-lg shadow-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Why Choose Us?
              </h3>
            </div>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <CheckCircle2 className="w-5 h-5 text-purple-200 mt-0.5 flex-shrink-0 group-hover:text-white transition-colors" />
                  <span className="text-purple-100 group-hover:text-white transition-colors">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="relative mx-auto mb-5 w-20 h-20">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-purple-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl w-full h-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-100 transition-all duration-300 shadow-sm">
                    <stat.icon className="text-purple-600 group-hover:scale-110 transition-transform duration-300" size={32} />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
