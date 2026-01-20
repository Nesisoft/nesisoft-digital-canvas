import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="relative py-20 overflow-hidden">
      {/* ========== BACKGROUND ADDED ========== */}
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-violet-950" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary glow - bottom left */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

        {/* Secondary glow - top right */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />

        {/* Accent glow - center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      {/* ========== BACKGROUND END ========== */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
            Contact Us
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get In{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
              Touch
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to transform your ideas into digital reality? Let's discuss
            your project and see how we can help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-3xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Send us a message
              </h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      First Name
                    </label>
                    <Input
                      className="bg-white/10 border-white/20 text-white placeholder-purple-300/50 rounded-xl focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <Input
                      className="bg-white/10 border-white/20 text-white placeholder-purple-300/50 rounded-xl focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    className="bg-white/10 border-white/20 text-white placeholder-purple-300/50 rounded-xl focus-visible:ring-purple-500 focus-visible:border-purple-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Subject
                  </label>
                  <Input
                    className="bg-white/10 border-white/20 text-white placeholder-purple-300/50 rounded-xl focus-visible:ring-purple-500 focus-visible:border-purple-500"
                    placeholder="Project Discussion"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    className="bg-white/10 border-white/20 text-white placeholder-purple-300/50 rounded-xl min-h-[120px] focus-visible:ring-purple-500 focus-visible:border-purple-500"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20">
                  Send Message
                  <Send className="ml-2" size={20} />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-3xl p-8">
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
                      <a href="mailto:info@nesisoft">info@nesisoft.com</a>
                    </p>
                    <p className="text-purple-200 hover:text-purple-100 transition-colors cursor-pointer">
                      <a href="mailto:sales@nesisoft">sales@nesisoft.com</a>
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
                      <a href="tel:+233555351068">
                        (+233) 555 351 068 / 553 140 807
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Location</h4>
                    <p className="text-purple-200">Accra, Ghana</p>
                    <p className="text-purple-200 text-sm">
                      Serving Africa & Beyond
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Placeholder */}
            <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border-white/20 rounded-3xl overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin size={48} className="mx-auto mb-4 text-purple-300" />
                  <p className="text-lg font-semibold">Interactive Map</p>
                  <p className="text-purple-300/80">Coming Soon</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
