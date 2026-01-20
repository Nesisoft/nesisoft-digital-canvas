import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";

const Projects = () => {
  const internalProjects = [
    {
      name: "Agoo",
      description:
        "An errand-running platform connecting service seekers and runners, targeting middle and upper-income individuals with a scalable commission-based model.",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      category: "Platform",
      slug: "agoo",
    },
    {
      name: "Sua",
      description:
        "A platform bridging parents with trusted teachers for personalized home and virtual tutoring services.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
      category: "Education",
      slug: "sua",
    },
    {
      name: "Adesuapa",
      description:
        "An African-centered online learning platform offering mobile money payments and institutional collaborations.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      category: "E-Learning",
      slug: "adesuapa",
    },
    {
      name: "Jua",
      description:
        "An e-commerce marketplace enabling installment payments and B2B trade across Africa.",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      category: "E-Commerce",
      slug: "jua",
    },
  ];

  const externalProjects = [
    {
      name: "FinTech Mobile App",
      description:
        "A comprehensive mobile banking solution with biometric authentication and AI-powered insights.",
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
      category: "Mobile App",
      slug: "fintech-app",
    },
    {
      name: "Healthcare Portal",
      description:
        "A telemedicine platform connecting patients with healthcare providers across rural Africa.",
      image:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhbHRoY2FyZXxlbnwwfHwwfHx8MA%3D%3D",
      category: "Web Platform",
    },
    {
      name: "Logistics Dashboard",
      description:
        "Real-time tracking and management system for delivery services with route optimization.",
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop",
      category: "Dashboard",
    },
  ];

  return (
    <section id="projects" className="relative py-20 overflow-hidden">
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
        {/* Primary glow - top center */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

        {/* Secondary glow - left side */}
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />

        {/* Accent glow - right bottom */}
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Gradient overlay for depth */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" /> */}
      {/* ========== BACKGROUND END ========== */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
            Our Work
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
              Projects
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover our innovative internal projects and successful client
            solutions that are making a difference across Africa.
          </p>
        </div>

        {/* Internal Projects */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Internal Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {internalProjects.map((project, index) => (
              <Card
                key={index}
                className="group bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-white mb-3">
                    {project.name}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>
                  {project.slug ? (
                    <Link to={`/projects/${project.slug}`}>
                      <Button
                        variant="ghost"
                        className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 p-0 group/btn"
                      >
                        Learn More{" "}
                        <ArrowRight
                          size={16}
                          className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                        />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 p-0 group/btn"
                    >
                      Learn More{" "}
                      <ArrowRight
                        size={16}
                        className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* External Projects */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Client Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {externalProjects.map((project, index) => (
              <Card
                key={index}
                className="group bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-gray-800 to-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-white mb-3">
                    {project.name}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>
                  {project.slug ? (
                    <Link to={`/projects/${project.slug}`}>
                      <Button
                        variant="ghost"
                        className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 p-0 group/btn"
                      >
                        View Project{" "}
                        <ExternalLink
                          size={16}
                          className="ml-2 group-hover/btn:scale-110 transition-transform"
                        />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 p-0 group/btn"
                    >
                      View Project{" "}
                      <ExternalLink
                        size={16}
                        className="ml-2 group-hover/btn:scale-110 transition-transform"
                      />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
