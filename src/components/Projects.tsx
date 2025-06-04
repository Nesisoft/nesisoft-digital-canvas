
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";

const Projects = () => {
  const internalProjects = [
    {
      name: "Agoo",
      description: "An errand-running platform connecting service seekers and runners, targeting middle and upper-income individuals with a scalable commission-based model.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      category: "Platform",
      slug: "agoo"
    },
    {
      name: "Sua", 
      description: "A platform bridging parents with trusted teachers for personalized home and virtual tutoring services.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
      category: "Education",
      slug: "sua"
    },
    {
      name: "Adesuapa",
      description: "An African-centered online learning platform offering mobile money payments and institutional collaborations.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      category: "E-Learning"
    },
    {
      name: "Jua",
      description: "An e-commerce marketplace enabling installment payments and B2B trade across Africa.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      category: "E-Commerce"
    }
  ];

  const externalProjects = [
    {
      name: "FinTech Mobile App",
      description: "A comprehensive mobile banking solution with biometric authentication and AI-powered insights.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
      category: "Mobile App",
      slug: "fintech-app"
    },
    {
      name: "Healthcare Portal",
      description: "A telemedicine platform connecting patients with healthcare providers across rural Africa.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop", 
      category: "Web Platform"
    },
    {
      name: "Logistics Dashboard",
      description: "Real-time tracking and management system for delivery services with route optimization.",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop",
      category: "Dashboard"
    }
  ];

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-purple-600">Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our innovative internal projects and successful client solutions that are making a difference across Africa.
          </p>
        </div>

        {/* Internal Projects */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Internal Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {internalProjects.map((project, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden border-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{project.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{project.description}</p>
                  {project.slug ? (
                    <Link to={`/projects/${project.slug}`}>
                      <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0">
                        Learn More <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0">
                      Learn More <ArrowRight size={16} className="ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* External Projects */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Client Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {externalProjects.map((project, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden border-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{project.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{project.description}</p>
                  {project.slug ? (
                    <Link to={`/projects/${project.slug}`}>
                      <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0">
                        View Project <ExternalLink size={16} className="ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0">
                      View Project <ExternalLink size={16} className="ml-2" />
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
