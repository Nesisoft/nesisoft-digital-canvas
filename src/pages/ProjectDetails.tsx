
import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, ExternalLink, Github, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProjectDetails = () => {
  const { projectId } = useParams();

  const projects = {
    "agoo": {
      name: "Agoo",
      category: "Platform",
      type: "Internal Project",
      description: "An errand-running platform connecting service seekers and runners, targeting middle and upper-income individuals with a scalable commission-based model.",
      fullDescription: "Agoo is a comprehensive platform that bridges the gap between people who need errands done and those willing to do them. Our platform focuses on providing reliable, efficient, and affordable errand services while creating economic opportunities for service runners.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
      ],
      technologies: ["React Native", "Node.js", "MongoDB", "Express", "Firebase"],
      features: [
        "Real-time matching system",
        "Secure payment processing",
        "GPS tracking and navigation",
        "Rating and review system",
        "Commission-based pricing model",
        "Multi-platform support"
      ],
      timeline: "6 months",
      teamSize: "5 developers",
      status: "In Development",
      challenges: "Building a scalable matching algorithm and ensuring reliable service delivery across different locations.",
      solutions: "Implemented machine learning algorithms for optimal matching and created a comprehensive rating system to maintain service quality."
    },
    "sua": {
      name: "Sua",
      category: "Education",
      type: "Internal Project",
      description: "A platform bridging parents with trusted teachers for personalized home and virtual tutoring services.",
      fullDescription: "Sua revolutionizes the tutoring industry by connecting qualified teachers with students who need personalized learning support. Our platform ensures quality education delivery through comprehensive teacher verification and student progress tracking.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
      ],
      technologies: ["React", "Python", "Django", "PostgreSQL", "WebRTC"],
      features: [
        "Teacher verification system",
        "Virtual classroom integration",
        "Progress tracking and analytics",
        "Flexible scheduling system",
        "Payment and billing management",
        "Parent-teacher communication tools"
      ],
      timeline: "8 months",
      teamSize: "6 developers",
      status: "Beta Testing",
      challenges: "Creating a seamless virtual learning experience and building trust between parents and teachers.",
      solutions: "Developed comprehensive background checks for teachers and implemented interactive tools for virtual sessions."
    },
    "fintech-app": {
      name: "FinTech Mobile App",
      category: "Mobile App",
      type: "Client Project",
      description: "A comprehensive mobile banking solution with biometric authentication and AI-powered insights.",
      fullDescription: "This mobile banking application provides users with a complete financial management experience, featuring advanced security measures, real-time transactions, and personalized financial insights powered by artificial intelligence.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
      ],
      technologies: ["React Native", "Node.js", "MongoDB", "AI/ML APIs", "Blockchain"],
      features: [
        "Biometric authentication",
        "Real-time transactions",
        "AI-powered financial insights",
        "Multi-currency support",
        "Investment tracking",
        "Expense categorization"
      ],
      timeline: "12 months",
      teamSize: "8 developers",
      status: "Completed",
      challenges: "Implementing robust security measures while maintaining user-friendly interfaces and ensuring regulatory compliance.",
      solutions: "Integrated multiple layers of security including biometric authentication, encryption, and AI-based fraud detection."
    }
  };

  const project = projects[projectId as keyof typeof projects];

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link to="/" className="text-purple-600 hover:text-purple-700">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-4">
                  {project.category}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {project.type}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {project.name}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {project.fullDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <Clock size={20} className="mr-2" />
                  <span>{project.timeline}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users size={20} className="mr-2" />
                  <span>{project.teamSize}</span>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-80 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {project.features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-3"></div>
                    <span className="text-gray-800 font-medium">{feature}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Technologies Used
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {project.technologies.map((tech, index) => (
              <span 
                key={index}
                className="bg-purple-100 text-purple-800 px-6 py-3 rounded-full font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges & Solutions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8 rounded-3xl">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Challenges</h3>
                <p className="text-gray-600 leading-relaxed">{project.challenges}</p>
              </CardContent>
            </Card>
            <Card className="p-8 rounded-3xl">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Solutions</h3>
                <p className="text-gray-600 leading-relaxed">{project.solutions}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Project Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {project.gallery.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <img 
                  src={image} 
                  alt={`${project.name} screenshot ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-110 transition-transform duration-500"
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
