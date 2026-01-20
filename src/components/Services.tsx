import React from "react";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Globe,
  Code,
  Users,
  Settings,
  TestTube,
  Palette,
  GraduationCap,
  ArrowRight,
  LucideIcon,
} from "lucide-react";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  slug?: string;
}

const Services = () => {
  const services: Service[] = [
    {
      icon: Smartphone,
      title: "Mobile Development",
      description:
        "We build native and cross-platform mobile applications that deliver seamless performance across devices.",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      iconBg: "bg-violet-500/10",
      slug: "mobile-development",
    },
    {
      icon: Globe,
      title: "Web Development",
      description:
        "We develop responsive, secure, and scalable web applications tailored to your business needs.",
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      iconBg: "bg-blue-500/10",
      slug: "web-development",
    },
    {
      icon: Code,
      title: "Custom Software Development",
      description:
        "From concept to deployment, we create software solutions tailored to your unique challenges and goals.",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      iconBg: "bg-emerald-500/10",
      slug: "custom-software",
    },
    {
      icon: Users,
      title: "Software Consulting",
      description:
        "We provide expert advice to help you make smart technology decisions and optimize your software strategy.",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      iconBg: "bg-amber-500/10",
    },
    {
      icon: Settings,
      title: "IT Consulting",
      description:
        "We offer strategic IT planning and implementation to align technology with your business objectives.",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
      iconBg: "bg-purple-500/10",
    },
    {
      icon: TestTube,
      title: "Software Testing",
      description:
        "Our comprehensive QA services ensure your applications are reliable, bug-free, and ready for production.",
      gradient: "from-teal-500 via-emerald-500 to-green-500",
      iconBg: "bg-teal-500/10",
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description:
        "We design intuitive, user-focused interfaces that enhance engagement and usability.",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      iconBg: "bg-pink-500/10",
    },
    {
      icon: GraduationCap,
      title: "Staff Training",
      description:
        "We deliver customized technical training programs to build your team's skills and confidence.",
      gradient: "from-indigo-500 via-blue-500 to-cyan-500",
      iconBg: "bg-indigo-500/10",
    },
  ];

  return (
    <section id="services" className="relative py-24 overflow-hidden">
      {/* ========== BACKGROUND ADDED ========== */}
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary glow - center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />

        {/* Secondary glow - left */}
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Accent glow - right */}
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      {/* ========== BACKGROUND END ========== */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-900/30 text-purple-300 text-sm font-medium mb-4 backdrop-blur-sm border border-purple-500/20">
            What We Offer
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Services
            </span>
          </h2>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Comprehensive software development services to help your business
            thrive in the digital world.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;

            return (
              <div
                key={index}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-3 border border-white/10 hover:border-purple-500/30 overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500`}
                ></div>

                {/* Animated corner accent */}
                <div
                  className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${service.gradient} opacity-5 rounded-full blur-xl group-hover:opacity-15 group-hover:scale-150 transition-all duration-500`}
                ></div>

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/10`}
                  >
                    <div
                      className={`bg-gradient-to-br ${service.gradient} bg-clip-text`}
                    >
                      <IconComponent
                        className="w-7 h-7 text-transparent"
                        style={{
                          stroke: "url(#icon-gradient-" + index + ")",
                        }}
                        strokeWidth={1.5}
                      />

                      {/* SVG gradient for icons */}
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient
                            id={`icon-gradient-${index}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#c084fc" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  {service.slug ? (
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center text-sm font-medium text-purple-300 hover:text-purple-200 group/link"
                    >
                      <span className="relative">
                        Learn More
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover/link:w-full transition-all duration-300"></span>
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center text-sm font-medium text-gray-500">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-4">Need a custom solution?</p>
          <Link to="/contact">
            <button className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 group">
              Get in Touch
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
