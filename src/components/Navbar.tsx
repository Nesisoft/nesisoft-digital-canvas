import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  User,
  Briefcase,
  FolderOpen,
  BookOpen,
  Mail,
  ArrowRight,
  Sparkles,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  type: "anchor" | "route";
}

interface NavLinkProps {
  item: NavItem;
  isMobile?: boolean;
  isScrolled?: boolean;
  onClick?: () => void;
}

// Create a custom hook for navigation
const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string, onClick?: () => void) => {
    if (onClick) onClick();

    // Check if it's an anchor link (starts with #)
    if (href.startsWith("#")) {
      const hash = href;

      if (location.pathname === "/") {
        // Already on homepage, scroll to section
        scrollToSection(hash);
      } else {
        // Not on homepage, navigate to homepage with hash
        navigate(`/${hash}`);
        // The Home component will handle the scroll via useEffect
      }
    } else {
      // Regular route navigation
      navigate(href);
    }
  };

  const scrollToSection = (hash: string) => {
    // Remove # from hash to get element id
    const elementId = hash.replace("#", "");
    const element = document.getElementById(elementId);

    if (element) {
      // Smooth scroll to element
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update URL hash without triggering navigation
      window.history.pushState(null, "", hash);
    } else {
      // If element not found, scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return { handleNavigation, scrollToSection };
};

// Add this helper function to your main App/Home component
export const useHashScroll = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if URL has a hash
    if (location.hash) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const elementId = location.hash.replace("#", "");
        const element = document.getElementById(elementId);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [location]);
};

// NavLink component
const NavLink: React.FC<NavLinkProps> = ({
  item,
  isMobile = false,
  isScrolled = false,
  onClick,
}) => {
  const Icon = item.icon;
  const { handleNavigation } = useNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleNavigation(item.href, onClick);
  };

  if (isMobile) {
    const mobileClassName =
      "group flex items-center gap-4 px-6 py-4 text-xl font-medium text-gray-100 transition-all duration-300 hover:bg-white/10 hover:pl-8 rounded-xl w-full text-left";

    const content = (
      <>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
          <Icon size={20} className="text-purple-300" />
        </div>
        <span className="flex-1">{item.name}</span>
        <ArrowRight
          size={18}
          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-purple-300"
        />
      </>
    );

    return (
      <button onClick={handleClick} className={mobileClassName}>
        {content}
      </button>
    );
  }

  // Desktop link
  const desktopClassName =
    "group relative flex items-center gap-2 px-3 py-4 text-sm font-medium transition-all duration-300 overflow-hidden cursor-pointer";

  const content = (
    <>
      <Icon
        size={14}
        className={`transition-all duration-300 ${
          isScrolled
            ? "text-gray-300 group-hover:text-purple-400"
            : "text-gray-200 group-hover:text-purple-300"
        } opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0`}
      />
      <span
        className={`transition-all duration-300 ${
          isScrolled
            ? "text-gray-100 group-hover:text-purple-400"
            : "text-white group-hover:text-purple-300"
        }`}
      >
        {item.name}
      </span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-purple-300 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
    </>
  );

  return (
    <button onClick={handleClick} className={desktopClassName}>
      {content}
    </button>
  );
};

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home, type: "route" },
  { name: "About", href: "#about", icon: User, type: "anchor" },
  { name: "Services", href: "#services", icon: Briefcase, type: "anchor" },
  { name: "Projects", href: "#projects", icon: FolderOpen, type: "anchor" },
  { name: "Blog", href: "/blog", icon: BookOpen, type: "route" },
  { name: "Contact", href: "#contact", icon: Mail, type: "anchor" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { handleNavigation } = useNavigation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleStartProject = () => {
    handleNavigation("#contact", closeMenu);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-xl border-b border-white/10 py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => handleNavigation("/")}
                className="group flex items-center gap-2"
              >
                {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles size={20} className="text-white" />
                </div> */}
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-purple-200 transition-all duration-300">
                  Nesisoft
                </h1>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    item={item}
                    isScrolled={isScrolled}
                  />
                ))}
                <button
                  onClick={() => handleNavigation("/contact")}
                  className="
    px-6 py-2.5 
    bg-gradient-to-r from-purple-600 to-purple-700 
    text-white font-medium rounded-full 
    hover:from-purple-500 hover:to-purple-600 
    transition-all duration-300 
    hover:shadow-lg hover:shadow-purple-500/25
    animate-pulse-button
  "
                >
                  Get Started
                </button>

                <style>{`
                  @keyframes pulseButton {
                    0%,
                    100% {
                      transform: scale(1);
                      box-shadow: 0 0 0px rgba(128, 90, 255, 0.4);
                    }
                    50% {
                      transform: scale(1.05);
                      box-shadow: 0 0 20px rgba(128, 90, 255, 0.6);
                    }
                  }

                  .animate-pulse-button {
                    animation: pulseButton 1.5s infinite;
                  }
                `}</style>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isScrolled
                    ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white"
                    : "bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-white border border-white/20"
                } hover:scale-105 active:scale-95`}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Full Page Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        {/* Menu Content */}
        <div
          className={`relative h-full flex flex-col justify-between transition-all duration-500 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close button */}
          <div className="absolute top-6 right-6">
            {/* <button
              onClick={closeMenu}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-700/30 flex items-center justify-center border border-white/10 hover:scale-105 transition-transform duration-300"
            >
              <X size={24} className="text-white" />
            </button> */}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col justify-center px-6 space-y-2">
            {navItems.map((item, index) => (
              <div
                key={item.name}
                className="transition-all duration-500"
                style={{
                  transitionDelay: isOpen ? `${index * 100}ms` : "0ms",
                  transform: isOpen ? "translateX(0)" : "translateX(50px)",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <NavLink item={item} isMobile onClick={closeMenu} />
              </div>
            ))}

            {/* Mobile CTA Button */}
            <div
              className="mt-8 px-6 transition-all duration-500"
              style={{
                transitionDelay: isOpen ? `${navItems.length * 100}ms` : "0ms",
                transform: isOpen ? "translateY(0)" : "translateY(30px)",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <button
                onClick={handleStartProject}
                className="block w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium text-lg rounded-2xl text-center hover:from-purple-500 hover:to-purple-600 transition-all duration-300 hover:scale-105"
              >
                Start Your Project →
              </button>
            </div>
          </div>

          {/* Tagline Footer */}
          <div
            className={`px-6 pb-10 pt-6 border-t border-white/10 backdrop-blur-sm transition-all duration-500 ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{
              transitionDelay: isOpen
                ? `${(navItems.length + 1) * 100}ms`
                : "0ms",
            }}
          >
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                Crafting Digital Excellence
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-gray-300 text-base font-medium">
                  Transforming Africa through Innovation
                </p>
              </div>
              <p className="text-gray-500 text-xs mt-4">
                © {new Date().getFullYear()} Nesisoft. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
