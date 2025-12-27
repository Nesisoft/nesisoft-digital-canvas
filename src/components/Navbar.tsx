
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  User,
  Briefcase,
  FolderOpen,
  BookOpen,
  Mail
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#home", icon: Home },
    { name: "About", href: "#about", icon: User },
    { name: "Services", href: "#services", icon: Briefcase },
    { name: "Projects", href: "#projects", icon: FolderOpen },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Contact", href: "#contact", icon: Mail },
  ];

  const NavLink = ({
    item,
    isMobile = false,
    onClick
  }: {
    item: typeof navItems[0];
    isMobile?: boolean;
    onClick?: () => void;
  }) => {
    const Icon = item.icon;

    const baseClasses = isMobile
      ? "group flex items-center gap-3 text-gray-800 px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 hover:bg-purple-50 hover:text-purple-600 hover:pl-5"
      : "group relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 overflow-hidden";

    const desktopTextClasses = isScrolled
      ? "text-gray-800 hover:text-purple-600"
      : "text-white hover:text-purple-300";

    const content = (
      <>
        <Icon
          size={isMobile ? 18 : 14}
          className={`transition-all duration-300 ${
            isMobile
              ? "group-hover:scale-110"
              : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
          }`}
        />
        <span className={`${!isMobile && "transition-transform duration-300 group-hover:translate-x-1"}`}>
          {item.name}
        </span>
        {!isMobile && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
        )}
      </>
    );

    if (item.href.startsWith("#")) {
      return (
        <a
          href={item.href}
          className={`${baseClasses} ${!isMobile && desktopTextClasses}`}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        to={item.href}
        className={`${baseClasses} ${!isMobile && desktopTextClasses}`}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Nesisoft
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-purple-600 text-white p-2 rounded-lg transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden bg-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item, index) => (
            <div
              key={item.name}
              className="transition-all duration-300"
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <NavLink
                item={item}
                isMobile
                onClick={() => setIsOpen(false)}
              />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
