import React, { useState } from "react";

import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  X,
  ArrowRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface ModalContent {
  title: string;

  description: string;

  ctaText: string;

  ctaAction: () => void;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const [modalOpen, setModalOpen] = useState(false);

  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const scrollToContact = () => {
    setModalOpen(false);

    const contactSection = document.getElementById("contact");

    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openModal = (content: ModalContent) => {
    setModalContent(content);

    setModalOpen(true);
  };

  const modalConfigs: Record<string, ModalContent> = {
    team: {
      title: "Meet Our Team",

      description:
        "We're a passionate team of developers, designers, and innovators dedicated to transforming Africa's digital landscape. Our diverse expertise spans web development, mobile apps, and custom software solutions. Want to learn more about working with us?",

      ctaText: "Get in Touch",

      ctaAction: scrollToContact,
    },

    careers: {
      title: "Join Our Team",

      description:
        "We're always looking for talented individuals who share our passion for technology and innovation. Whether you're a developer, designer, or project manager, we'd love to hear from you. Ready to start your journey with Nesisoft?",

      ctaText: "Apply Now",

      ctaAction: scrollToContact,
    },

    "case-studies": {
      title: "Case Studies",

      description:
        "Discover how we've helped businesses across Africa achieve their digital transformation goals. Our case studies showcase real-world solutions and measurable results. Interested in seeing what we can do for your business?",

      ctaText: "Discuss Your Project",

      ctaAction: scrollToContact,
    },

    docs: {
      title: "Documentation",

      description:
        "Our comprehensive documentation and developer resources are coming soon. We're working hard to provide you with the best resources to integrate with our platforms and solutions. Want early access or have specific documentation needs?",

      ctaText: "Request Early Access",

      ctaAction: scrollToContact,
    },

    support: {
      title: "Support Center",

      description:
        "Need help with one of our products or services? Our dedicated support team is here to assist you. We offer technical support, troubleshooting, and guidance to ensure your success with our solutions.",

      ctaText: "Contact Support",

      ctaAction: scrollToContact,
    },

    facebook: {
      title: "Follow Us on Facebook",

      description:
        "Stay connected with Nesisoft on Facebook! Get the latest updates on our projects, tech insights, and company news. Our Facebook page is launching soon. In the meantime, reach out to us directly!",

      ctaText: "Contact Us Instead",

      ctaAction: scrollToContact,
    },

    twitter: {
      title: "Follow Us on Twitter",

      description:
        "Join the conversation on Twitter! We share tech tips, industry insights, and updates about our latest projects. Our Twitter account is coming soon. Want to stay in the loop?",

      ctaText: "Contact Us Instead",

      ctaAction: scrollToContact,
    },

    linkedin: {
      title: "Connect on LinkedIn",

      description:
        "Network with Nesisoft on LinkedIn! Discover career opportunities, company updates, and professional insights. Our LinkedIn presence is growing. Connect with us today!",

      ctaText: "Contact Us Instead",

      ctaAction: scrollToContact,
    },

    instagram: {
      title: "Follow Us on Instagram",

      description:
        "Get a behind-the-scenes look at Nesisoft on Instagram! See our team in action, project highlights, and company culture. Our Instagram is launching soon. Stay connected!",

      ctaText: "Contact Us Instead",

      ctaAction: scrollToContact,
    },
  };

  const handleLinkClick = (
    e: React.MouseEvent,
    href: string,
    modalKey?: string
  ) => {
    if (modalKey && modalConfigs[modalKey]) {
      e.preventDefault();

      openModal(modalConfigs[modalKey]);
    }
  };

  const footerLinks = {
    company: [
      { name: "About Us", href: "#about" },

      { name: "Our Team", href: "#team", modalKey: "team" },

      { name: "Careers", href: "#careers", modalKey: "careers" },

      { name: "Contact", href: "#contact" },
    ],

    services: [
      { name: "Web Development", href: "#services" },

      { name: "Mobile Apps", href: "#services" },

      { name: "Custom Software", href: "#services" },

      { name: "IT Consulting", href: "#services" },
    ],

    projects: [
      { name: "Agoo Platform", href: "#projects" },

      { name: "Sua Education", href: "#projects" },

      { name: "Adesuapa Learning", href: "#projects" },

      { name: "Jua Marketplace", href: "#projects" },
    ],

    resources: [
      { name: "Blog", href: "/blog" },

      { name: "Case Studies", href: "#case-studies", modalKey: "case-studies" },

      { name: "Documentation", href: "#docs", modalKey: "docs" },

      { name: "Support", href: "#support", modalKey: "support" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", name: "Facebook", modalKey: "facebook" },

    { icon: Twitter, href: "#", name: "Twitter", modalKey: "twitter" },

    { icon: Linkedin, href: "#", name: "LinkedIn", modalKey: "linkedin" },

    { icon: Instagram, href: "#", name: "Instagram", modalKey: "instagram" },
  ];

  return (
    <>
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}

            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
                Nesisoft
              </h3>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Transforming innovative ideas into practical, impactful digital
                solutions across Africa and beyond. We create jobs, increase
                digital inclusion, and build long-term economic value.
              </p>

              <div className="space-y-3">
                <a
                  href="mailto:info@nesisoft.com"
                  className="flex items-center space-x-3 hover:text-purple-400 transition-colors duration-300"
                >
                  <Mail size={16} className="text-purple-400" />

                  <span className="text-gray-300 text-sm hover:text-purple-400">
                    info@nesisoft.com
                  </span>
                </a>

                <a
                  href="tel:+233553140807"
                  className="flex items-center space-x-3 hover:text-purple-400 transition-colors duration-300"
                >
                  <Phone size={16} className="text-purple-400" />

                  <span className="text-gray-300 text-sm hover:text-purple-400">
                    +233 055 314 0807
                  </span>
                </a>

                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-purple-400" />

                  <span className="text-gray-300 text-sm">Accra, Ghana</span>
                </div>
              </div>
            </div>

            {/* Company Links */}

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>

              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) =>
                        handleLinkClick(e, link.href, link.modalKey)
                      }
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-300 text-sm cursor-pointer"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>

              <ul className="space-y-2">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projects Links */}

            <div>
              <h4 className="text-lg font-semibold mb-4">Projects</h4>

              <ul className="space-y-2">
                {footerLinks.projects.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>

              <ul className="space-y-2">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) =>
                        handleLinkClick(e, link.href, link.modalKey)
                      }
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-300 text-sm cursor-pointer"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © {currentYear} Nesisoft. All rights reserved.
              </div>

              {/* Social Links */}

              <div className="flex space-x-6">
                {socialLinks.map((social, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();

                      if (social.modalKey && modalConfigs[social.modalKey]) {
                        openModal(modalConfigs[social.modalKey]);
                      }
                    }}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                    aria-label={social.name}
                  >
                    <social.icon size={20} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Full Screen Modal */}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-full sm:h-full md:max-w-2xl md:h-auto bg-gradient-to-br from-gray-900 via-purple-900 to-black border-purple-500/30 text-white fixed inset-0 md:inset-auto md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%] flex flex-col justify-center items-center p-8 md:rounded-2xl">
          <div className="max-w-lg w-full text-center space-y-8">
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse" />
              </div>

              <DialogTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {modalContent?.title}
              </DialogTitle>

              <DialogDescription className="text-gray-300 text-lg leading-relaxed">
                {modalContent?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="pt-6">
              <Button
                onClick={modalContent?.ctaAction}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105 group"
              >
                {modalContent?.ctaText}

                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Button>
            </div>

            <p className="text-gray-500 text-sm">
              Or explore other sections of our website
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
