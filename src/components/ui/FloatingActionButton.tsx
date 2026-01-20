import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Home,
  Users,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Users, label: "About", href: "/#about" },
    { icon: FileText, label: "Services", href: "/#services" },
    { icon: MessageSquare, label: "Contact", href: "/#contact" },
    { icon: Phone, label: "Call", href: "tel:+233555351068" },
    { icon: Mail, label: "Email", href: "mailto:info@nesisoft.com" },
  ];

  return (
    <>
      {/* Dimmed overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-8 right-8 z-50">
        {/* Action Links */}
        <div className="relative">
          {links.map((link, index) => {
            const offset = (index + 1) * 64;

            return (
              <Link
                key={index}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="absolute right-0 flex items-center gap-3 transition-all duration-300 ease-out"
                style={{
                  transform: isOpen
                    ? `translateY(-${offset}px)`
                    : "translateY(0)",
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? "auto" : "none",
                  transitionDelay: isOpen ? `${index * 60}ms` : "0ms",
                }}
              >
                {/* Label */}
                <span
                  className="
                    px-3 py-1 text-xs font-medium uppercase tracking-wide
                    rounded-md
                    bg-slate-900/80 text-slate-200
                    backdrop-blur-md
                    border border-white/10
                  "
                >
                  {link.label}
                </span>

                {/* Icon Button */}
                <div
                  className="
                    w-11 h-11 rounded-full flex items-center justify-center
                    bg-slate-900 border border-white/10
                    text-purple-400
                    shadow-lg
                    transition-transform duration-200
                    hover:scale-110
                  "
                >
                  <link.icon size={18} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Main FAB */}
        <Button
          onClick={() => setIsOpen((v) => !v)}
          className={`
    w-16 h-16 rounded-full
    bg-gradient-to-br from-blue-600 to-purple-600
    hover:from-blue-500 hover:to-purple-500
    text-white shadow-2xl shadow-blue-500/25
    border-2 border-white/20
    transition-all duration-300
    ${isOpen ? "rotate-12" : ""}
    group
  `}
        >
          <MessageSquare
            className={`transition-all duration-500 ${
              isOpen ? "rotate-12 scale-110" : ""
            }`}
            size={24}
          />
        </Button>
      </div>
    </>
  );
};

export default FloatingActionButton;
