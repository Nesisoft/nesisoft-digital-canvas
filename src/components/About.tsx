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
    <section id="about" className="relative py-24 overflow-hidden">
      {/* Base gradient background from Hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Subtle grid pattern overlay from Hero */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary glow - top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

        {/* Secondary glow - right side */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Accent glow - bottom */}
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Gradient overlay for depth from Hero */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header Section - Updated text colors for dark background */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
            Who We Are
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
              Nesisoft
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We are committed to transforming innovative ideas into
            <span className=" font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              {" "}
              practical, impactful digital solutions{" "}
            </span>
            tailored to meet the evolving needs of businesses across Africa and
            beyond.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch mb-20">
          {/* Mission Card - Updated for dark background */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm border border-white/10 hover:shadow-md transition-shadow duration-300 hover:border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Our Mission
              </h3>
            </div>

            <div className="space-y-5">
              <p className="text-gray-300 leading-relaxed">
                Our services empower clients to innovate, grow, and thrive in
                the digital economy. We don't just provide solutions; we create
                jobs, increase digital inclusion, and build long-term economic
                value on the continent.
              </p>

              <p className="text-gray-300 leading-relaxed">
                Through our ventures like
                <span className=" font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  {" "}
                  Agoo, Sua, Adesuapa, and Jua,{" "}
                </span>
                we actively develop scalable digital platforms that solve local
                and regional problems while supporting our client-based
                development work.
              </p>
            </div>
          </div>

          {/* Why Choose Us Card - Updated for dark background */}
          <div className="bg-gradient-to-br from-purple-500/90 via-purple-600/90 to-purple-400/90 rounded-3xl p-8 md:p-10 shadow-lg shadow-purple-500/20 backdrop-blur-sm">
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
                  <CheckCircle2 className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0 group-hover:text-purple-200 transition-colors" />

                  <span className="text-purple-200 group-hover:text-white transition-colors">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats Section - Updated for dark background */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="group relative text-center">
              {/* Hover glow */}

              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-3xl blur-xl transition-colors duration-500" />

              <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 group-hover:border-purple-500/30 group-hover:bg-white/[0.06] transition-all duration-500">
                <div className="relative mx-auto mb-5 w-16 h-16 md:w-20 md:h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />

                  <div className="relative w-full h-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                    <stat.icon
                      className="text-purple-400 group-hover:text-purple-300 transition-colors"
                      size={28}
                    />
                  </div>
                </div>

                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>

                <div className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
