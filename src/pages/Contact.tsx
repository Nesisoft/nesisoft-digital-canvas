import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Send, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the form data to your backend
    alert("Message sent successfully!");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <>
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

            <div className="text-center">
              <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
                Contact Us
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Get In{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
                  Touch
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Ready to transform your ideas into digital reality? Let's
                discuss your project and see how we can help you succeed.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="relative py-20 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="bg-white/10 backdrop-blur-sm border border-white/10 shadow-2xl rounded-3xl hover:border-purple-500/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mr-4 border border-purple-500/30">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Send us a message
                    </h3>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          First Name
                        </label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Project Discussion"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Message
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl min-h-[120px] focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Tell us about your project..."
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                    >
                      Send Message
                      <Send className="ml-2" size={20} />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Contact Information
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3">
                        <Mail className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Email</h4>
                        <p className="text-purple-200 hover:text-purple-100 transition-colors cursor-pointer">
                          info@nesisoft.com
                        </p>
                        <p className="text-purple-200 hover:text-purple-100 transition-colors cursor-pointer">
                          sales@nesisoft.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3">
                        <Phone className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Phone</h4>
                        <p className="text-purple-200 hover:text-purple-100 transition-colors cursor-pointer">
                          +233 055 314 0807
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3">
                        <MapPin className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Location
                        </h4>
                        <p className="text-purple-200">Accra, Ghana</p>
                        <p className="text-purple-200 text-sm">
                          Serving Africa & Beyond
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Map Placeholder */}
                <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-300">
                  <div className="h-64 bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <MapPin
                        size={48}
                        className="mx-auto mb-4 text-purple-300"
                      />
                      <p className="text-lg font-semibold">Interactive Map</p>
                      <p className="text-purple-300/80">Coming Soon</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
