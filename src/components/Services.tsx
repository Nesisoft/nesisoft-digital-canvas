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

      gradient: "from-violet-600 via-purple-600 to-fuchsia-600",

      iconBg: "bg-violet-500/10",

      slug: "mobile-development",
    },

    {
      icon: Globe,

      title: "Web Development",

      description:
        "We develop responsive, secure, and scalable web applications tailored to your business needs.",

      gradient: "from-blue-600 via-indigo-600 to-purple-600",

      iconBg: "bg-blue-500/10",

      slug: "web-development",
    },

    {
      icon: Code,

      title: "Custom Software Development",

      description:
        "From concept to deployment, we create software solutions tailored to your unique challenges and goals.",

      gradient: "from-emerald-600 via-teal-600 to-cyan-600",

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

      gradient: "from-purple-600 via-violet-600 to-indigo-600",

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

      gradient: "from-indigo-600 via-blue-600 to-cyan-600",

      iconBg: "bg-indigo-500/10",
    },
  ];

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Subtle background pattern */}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/50 to-slate-100">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.15]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="#8b5cf6" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Floating gradient orbs */}

        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>

        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}

        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            What We Offer
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Services
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
                className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 hover:border-purple-200/50 overflow-hidden"
              >
                {/* Hover gradient overlay */}

                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                ></div>

                {/* Animated corner accent */}

                <div
                  className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${service.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`}
                ></div>

                <div className="relative">
                  {/* Icon */}

                  <div
                    className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
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
                            <stop offset="0%" stopColor="#8b5cf6" />

                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Title */}

                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* Learn More Link */}

                  {service.slug ? (
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 group/link"
                    >
                      <span className="relative">
                        Learn More
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover/link:w-full transition-all duration-300"></span>
                      </span>

                      <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center text-sm font-medium text-gray-400">
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
          <p className="text-gray-600 mb-4">Need a custom solution?</p>

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
