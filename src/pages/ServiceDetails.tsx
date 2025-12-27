import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Users,
  Clock,
  Target,
  Sparkles,
  Code,
  Settings,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React from "react";

const ServiceDetails = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);
  const { serviceId } = useParams();

  const services = {
    "mobile-development": {
      title: "Mobile Development",
      description:
        "We build native and cross-platform mobile applications that deliver seamless performance across devices.",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
      fullDescription:
        "Our mobile development team specializes in creating high-performance, user-friendly mobile applications for iOS and Android platforms. We use the latest technologies and frameworks to ensure your app stands out in the competitive mobile marketplace.",
      features: [
        "Native iOS and Android Development",
        "Cross-platform Development with React Native",
        "Mobile App UI/UX Design",
        "App Store Optimization",
        "Mobile App Testing",
        "Maintenance and Support",
      ],
      technologies: ["Swift", "Kotlin", "React Native", "Flutter", "Xamarin"],
      process: [
        "Discovery and Planning",
        "UI/UX Design",
        "Development",
        "Testing",
        "Deployment",
        "Maintenance",
      ],
      icon: Code,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    "web-development": {
      title: "Web Development",
      description:
        "We develop responsive, secure, and scalable web applications tailored to your business needs.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      fullDescription:
        "Our web development services encompass everything from simple websites to complex web applications. We focus on creating responsive, fast, and secure solutions that provide excellent user experiences across all devices.",
      features: [
        "Responsive Web Design",
        "E-commerce Solutions",
        "Content Management Systems",
        "Progressive Web Apps",
        "API Development",
        "Web Security Implementation",
      ],
      technologies: [
        "React",
        "Node.js",
        "Python",
        "PHP",
        "MongoDB",
        "PostgreSQL",
      ],
      process: [
        "Requirements Analysis",
        "Architecture Design",
        "Frontend Development",
        "Backend Development",
        "Integration & Testing",
        "Deployment & Monitoring",
      ],
      icon: Settings,
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
    },
    "custom-software": {
      title: "Custom Software Development",
      description:
        "From concept to deployment, we create software solutions tailored to your unique challenges and goals.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      fullDescription:
        "We understand that every business has unique requirements. Our custom software development services are designed to create solutions that perfectly fit your specific needs and business processes.",
      features: [
        "Business Process Automation",
        "Enterprise Software Solutions",
        "Desktop Application Development",
        "Cloud-based Solutions",
        "Legacy System Modernization",
        "Software Integration",
      ],
      technologies: ["Python", "Java", "C#", ".NET", "Spring", "Django"],
      process: [
        "Business Analysis",
        "Solution Design",
        "Prototyping",
        "Development",
        "Quality Assurance",
        "Deployment & Training",
      ],
      icon: Zap,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    },
  };

  const service = services[serviceId as keyof typeof services];

  if (!service) {
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
              Service Not Found
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

  const ServiceIcon = service.icon;

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
            Back to Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mr-4`}
                >
                  <ServiceIcon className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-purple-300 uppercase tracking-widest">
                  Our Service
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {service.title}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {service.fullDescription}
              </p>
              <div className="flex space-x-4">
                <Link to="/#contact">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                    Start a Project
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="px-8 py-3 rounded-full border-purple-500/30 text-purple-300  bg-black hover:bg-purple-500/10 hover:text-purple-200 hover:border-purple-500/50"
                >
                  Request Quote
                </Button>
              </div>
            </div>
            <div className="relative group">
              <div
                className={`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-500`}
              ></div>
              <img
                src={service.image}
                alt={service.title}
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
              What We{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Offer
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 rounded-2xl border border-white/10 group"
              >
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="text-purple-400" size={20} />
                      </div>
                    </div>
                    <span className="text-gray-100 font-medium">{feature}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-20 bg-white/5 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
              Methodology
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Process
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We follow a structured approach to ensure quality and efficiency
              in every project.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.process.map((step, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 text-center hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 rounded-2xl border border-white/10 group"
              >
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{step}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
              Tech Stack
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Technologies We{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Use
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {service.technologies.map((tech, index) => (
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

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-900/20 via-transparent to-violet-900/20 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's discuss your requirements and create a custom solution that
              perfectly fits your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#contact">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                  Contact Us Now
                </Button>
              </Link>
              <Link to="/services">
                <Button
                  variant="outline"
                  className="px-8 py-3 rounded-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 hover:border-purple-500/50"
                >
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetails;
