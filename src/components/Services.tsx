import React from "react";
import { Link } from "react-router-dom";
import { Smartphone, Globe, Code, Users, Settings, TestTube, Palette, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Services = () => {
  const services = [
    {
      icon: Smartphone,
      title: "Mobile Development",
      description: "We build native and cross-platform mobile applications that deliver seamless performance across devices.",
      gradient: "from-purple-500 to-pink-500",
      slug: "mobile-development"
    },
    {
      icon: Globe,
      title: "Web Development", 
      description: "We develop responsive, secure, and scalable web applications tailored to your business needs.",
      gradient: "from-blue-500 to-purple-500",
      slug: "web-development"
    },
    {
      icon: Code,
      title: "Custom Software Development",
      description: "From concept to deployment, we create software solutions tailored to your unique challenges and goals.",
      gradient: "from-green-500 to-blue-500",
      slug: "custom-software"
    },
    {
      icon: Users,
      title: "Software Consulting",
      description: "We provide expert advice to help you make smart technology decisions and optimize your software strategy.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Settings,
      title: "IT Consulting",
      description: "We offer strategic IT planning and implementation to align technology with your business objectives.",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      icon: TestTube,
      title: "Software Testing",
      description: "Our comprehensive QA services ensure your applications are reliable, bug-free, and ready for production.",
      gradient: "from-teal-500 to-green-500"
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "We design intuitive, user-focused interfaces that enhance engagement and usability.",
      gradient: "from-pink-500 to-purple-500"
    },
    {
      icon: GraduationCap,
      title: "Staff Training",
      description: "We deliver customized technical training programs to build your team's skills and confidence.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-purple-600">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive software development services to help your business thrive in the digital world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>
                {service.slug && (
                  <Link to={`/services/${service.slug}`}>
                    <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0">
                      Learn More →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
