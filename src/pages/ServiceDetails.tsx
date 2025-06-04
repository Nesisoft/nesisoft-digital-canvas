
import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Users, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ServiceDetails = () => {
  const { serviceId } = useParams();

  const services = {
    "mobile-development": {
      title: "Mobile Development",
      description: "We build native and cross-platform mobile applications that deliver seamless performance across devices.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
      fullDescription: "Our mobile development team specializes in creating high-performance, user-friendly mobile applications for iOS and Android platforms. We use the latest technologies and frameworks to ensure your app stands out in the competitive mobile marketplace.",
      features: [
        "Native iOS and Android Development",
        "Cross-platform Development with React Native",
        "Mobile App UI/UX Design",
        "App Store Optimization",
        "Mobile App Testing",
        "Maintenance and Support"
      ],
      technologies: ["Swift", "Kotlin", "React Native", "Flutter", "Xamarin"],
      process: [
        "Discovery and Planning",
        "UI/UX Design",
        "Development",
        "Testing",
        "Deployment",
        "Maintenance"
      ]
    },
    "web-development": {
      title: "Web Development",
      description: "We develop responsive, secure, and scalable web applications tailored to your business needs.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      fullDescription: "Our web development services encompass everything from simple websites to complex web applications. We focus on creating responsive, fast, and secure solutions that provide excellent user experiences across all devices.",
      features: [
        "Responsive Web Design",
        "E-commerce Solutions",
        "Content Management Systems",
        "Progressive Web Apps",
        "API Development",
        "Web Security Implementation"
      ],
      technologies: ["React", "Node.js", "Python", "PHP", "MongoDB", "PostgreSQL"],
      process: [
        "Requirements Analysis",
        "Architecture Design",
        "Frontend Development",
        "Backend Development",
        "Integration & Testing",
        "Deployment & Monitoring"
      ]
    },
    "custom-software": {
      title: "Custom Software Development",
      description: "From concept to deployment, we create software solutions tailored to your unique challenges and goals.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      fullDescription: "We understand that every business has unique requirements. Our custom software development services are designed to create solutions that perfectly fit your specific needs and business processes.",
      features: [
        "Business Process Automation",
        "Enterprise Software Solutions",
        "Desktop Application Development",
        "Cloud-based Solutions",
        "Legacy System Modernization",
        "Software Integration"
      ],
      technologies: ["Python", "Java", "C#", ".NET", "Spring", "Django"],
      process: [
        "Business Analysis",
        "Solution Design",
        "Prototyping",
        "Development",
        "Quality Assurance",
        "Deployment & Training"
      ]
    }
  };

  const service = services[serviceId as keyof typeof services];

  if (!service) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Service Not Found</h1>
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
      <section className="pt-24 pb-12 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {service.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {service.fullDescription}
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full">
                Get Started
              </Button>
            </div>
            <div className="relative">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-80 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="text-purple-600 mt-1" size={24} />
                    <span className="text-gray-800 font-medium">{feature}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.process.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{step}</h3>
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
            Technologies We Use
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {service.technologies.map((tech, index) => (
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

      <Footer />
    </div>
  );
};

export default ServiceDetails;
