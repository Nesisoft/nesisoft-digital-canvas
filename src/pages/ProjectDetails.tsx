import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Tag,
  ExternalLink,
  Github,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const location = useLocation();

  // Add this useEffect to handle scroll on mount
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [projectId, location.pathname]);

  const projects = {
    agoo: {
      name: "Agoo",
      category: "Platform",
      type: "Internal Project",
      description:
        "An errand-running platform connecting service seekers and runners, targeting middle and upper-income individuals with a scalable commission-based model.",
      fullDescription:
        "Agoo is a comprehensive platform that bridges the gap between people who need errands done and those willing to do them. Our platform focuses on providing reliable, efficient, and affordable errand services while creating economic opportunities for service runners.",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      ],
      technologies: [
        "React Native",
        "Node.js",
        "MongoDB",
        "Express",
        "Firebase",
      ],
      features: [
        "Real-time matching system",
        "Secure payment processing",
        "GPS tracking and navigation",
        "Rating and review system",
        "Commission-based pricing model",
        "Multi-platform support",
      ],
      timeline: "6 months",
      teamSize: "5 developers",
      status: "In Development",
      challenges:
        "Building a scalable matching algorithm and ensuring reliable service delivery across different locations.",
      solutions:
        "Implemented machine learning algorithms for optimal matching and created a comprehensive rating system to maintain service quality.",
    },
    sua: {
      name: "Sua",
      category: "Education",
      type: "Internal Project",
      description:
        "A platform bridging parents with trusted teachers for personalized home and virtual tutoring services.",
      fullDescription:
        "Sua revolutionizes the tutoring industry by connecting qualified teachers with students who need personalized learning support. Our platform ensures quality education delivery through comprehensive teacher verification and student progress tracking.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      ],
      technologies: ["React", "Python", "Django", "PostgreSQL", "WebRTC"],
      features: [
        "Teacher verification system",
        "Virtual classroom integration",
        "Progress tracking and analytics",
        "Flexible scheduling system",
        "Payment and billing management",
        "Parent-teacher communication tools",
      ],
      timeline: "8 months",
      teamSize: "6 developers",
      status: "Beta Testing",
      challenges:
        "Creating a seamless virtual learning experience and building trust between parents and teachers.",
      solutions:
        "Developed comprehensive background checks for teachers and implemented interactive tools for virtual sessions.",
    },
    "fintech-app": {
      name: "FinTech Mobile App",
      category: "Mobile App",
      type: "Client Project",
      description:
        "A comprehensive mobile banking solution with biometric authentication and AI-powered insights.",
      fullDescription:
        "This mobile banking application provides users with a complete financial management experience, featuring advanced security measures, real-time transactions, and personalized financial insights powered by artificial intelligence.",
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      ],
      technologies: [
        "React Native",
        "Node.js",
        "MongoDB",
        "AI/ML APIs",
        "Blockchain",
      ],
      features: [
        "Biometric authentication",
        "Real-time transactions",
        "AI-powered financial insights",
        "Multi-currency support",
        "Investment tracking",
        "Expense categorization",
      ],
      timeline: "12 months",
      teamSize: "8 developers",
      status: "Completed",
      challenges:
        "Implementing robust security measures while maintaining user-friendly interfaces and ensuring regulatory compliance.",
      solutions:
        "Integrated multiple layers of security including biometric authentication, encryption, and AI-based fraud detection.",
    },
  };

  const project = projects[projectId as keyof typeof projects];

  if (!project) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-violet-950" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Navbar />
        <div className="relative pt-24 pb-20 text-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Project Not Found
            </h1>
            <Link to="/" className="text-purple-300 hover:text-purple-200">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-violet-950" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-purple-300 hover:text-purple-200 mb-8 group"
          >
            <ArrowLeft
              size={20}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            Back to Projects
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-medium mr-4 backdrop-blur-sm">
                  {project.category}
                </span>
                <span className="bg-white/10 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
                  {project.type}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {project.name}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {project.fullDescription}
              </p>
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center text-gray-400">
                  <Clock size={20} className="mr-3 text-purple-400" />
                  <span>{project.timeline}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users size={20} className="mr-3 text-purple-400" />
                  <span>{project.teamSize}</span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${
                      project.status === "Completed"
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : project.status === "In Development"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                  Start a Project
                </Button>
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-500"></div>
              <img
                src={project.image}
                alt={project.name}
                className="relative w-full h-80 object-cover rounded-3xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Key{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {project.features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 border border-white/10"
              >
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-3"></div>
                    <span className="text-gray-100 font-medium">{feature}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="relative py-20 bg-white/5 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
              Tech Stack
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Technologies{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Used
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="bg-white/10 backdrop-blur-sm text-purple-300 px-6 py-3 rounded-full font-medium border border-white/10 hover:border-purple-500/30 hover:bg-white/15 transition-all duration-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges & Solutions */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
              Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Challenges &{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Solutions
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 border border-white/10">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-xl flex items-center justify-center mr-4 border border-rose-500/30">
                    <Sparkles className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Challenges</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {project.challenges}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 border border-white/10">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center mr-4 border border-emerald-500/30">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Solutions</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {project.solutions}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative py-20 bg-white/5 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
              Visuals
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Project{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Gallery
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {project.gallery.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <img
                  src={image}
                  alt={`${project.name} screenshot ${index + 1}`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 border border-white/10"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
