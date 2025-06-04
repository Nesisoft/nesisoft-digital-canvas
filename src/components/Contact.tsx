
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-purple-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get In <span className="text-purple-400">Touch</span>
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Ready to transform your ideas into digital reality? Let's discuss your project and see how we can help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      First Name
                    </label>
                    <Input 
                      className="bg-white/10 border-white/30 text-white placeholder-purple-200 rounded-xl"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <Input 
                      className="bg-white/10 border-white/30 text-white placeholder-purple-200 rounded-xl"
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
                    className="bg-white/10 border-white/30 text-white placeholder-purple-200 rounded-xl"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Subject
                  </label>
                  <Input 
                    className="bg-white/10 border-white/30 text-white placeholder-purple-200 rounded-xl"
                    placeholder="Project Discussion"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea 
                    className="bg-white/10 border-white/30 text-white placeholder-purple-200 rounded-xl min-h-[120px]"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-105">
                  Send Message
                  <Send className="ml-2" size={20} />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-full p-3">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Email</h4>
                    <p className="text-purple-200">info@nesisoft.com</p>
                    <p className="text-purple-200">hello@nesisoft.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-full p-3">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Phone</h4>
                    <p className="text-purple-200">+233 123 456 7890</p>
                    <p className="text-purple-200">+233 098 765 4321</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-full p-3">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Location</h4>
                    <p className="text-purple-200">Accra, Ghana</p>
                    <p className="text-purple-200">Serving Africa & Beyond</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-purple-500/30 to-purple-700/30 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin size={48} className="mx-auto mb-4 text-purple-300" />
                  <p className="text-lg font-semibold">Interactive Map</p>
                  <p className="text-purple-200">Coming Soon</p>
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
