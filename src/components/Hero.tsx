import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Hero = () => {
  // State to manage which modal is open
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Stats data with modal content
  const stats = [
    {
      id: "projects",
      title: "10+",
      subtitle: "Projects Completed",
      modalTitle: "Projects Completed",
      videoUrl:
        "https://cdnl.iconscout.com/lottie/premium/thumb/document-approved-with-thumbs-up-animation-gif-download-10823809.mp4",
      description:
        "We've successfully delivered over 10 innovative projects across various industries including fintech, e-commerce, healthcare, and education.",
      highlights: [
        "Custom web applications with modern frameworks",
        "Mobile apps for iOS and Android platforms",
        "Enterprise solutions for businesses",
        "UI/UX design and prototyping",
      ],
      achievements: [
        "95% client satisfaction rate",
        "All projects delivered on time",
        "Post-launch support and maintenance",
      ],
    },
    {
      id: "clients",
      title: "5+",
      subtitle: "Happy Clients",
      modalTitle: "Client Success Stories",
      videoUrl:
        "https://cdnl.iconscout.com/lottie/premium/thumb/positive-feedback-animation-gif-download-10727118.mp4",
      description:
        "Our growing portfolio of satisfied clients ranges from startups to established enterprises across Africa and beyond.",
      highlights: [
        "Long-term partnerships with clients",
        "Regular communication and updates",
        "Flexible collaboration models",
        "Transparent project management",
      ],
      achievements: [
        "80% repeat business rate",
        "Referrals from satisfied clients",
        "Industry-specific expertise",
      ],
    },
    {
      id: "experience",
      title: "5+",
      subtitle: "Years Experience",
      modalTitle: "Industry Experience",
      videoUrl:
        "https://cdnl.iconscout.com/lottie/premium/thumb/5-year-animation-gif-download-6477950.mp4",
      description:
        "With over 5 years in the software development industry, we've honed our skills and processes to deliver exceptional results.",
      highlights: [
        "Agile development methodologies",
        "Modern tech stack expertise",
        "Cross-functional team collaboration",
        "Continuous learning and improvement",
      ],
      achievements: [
        "Stayed current with industry trends",
        "Multiple successful project lifecycles",
        "Mentored junior developers",
      ],
    },
    {
      id: "team",
      title: "5+",
      subtitle: "Team Members",
      modalTitle: "Our Expert Team",
      videoUrl:
        "https://cdnl.iconscout.com/lottie/premium/thumb/business-team-animation-gif-download-7612966.mp4",
      description:
        "Our diverse team of skilled professionals brings together expertise from various domains to create comprehensive solutions.",
      highlights: [
        "Frontend and backend developers",
        "UI/UX designers",
        "Quality assurance engineers",
        "Project managers and analysts",
      ],
      achievements: [
        "Cross-disciplinary collaboration",
        "Regular skill development sessions",
        "Collaborative problem-solving approach",
      ],
    },
  ];

  return (
    <>
      <section
        id="home"
        className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 md:pt-16"
      >
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://cdnl.iconscout.com/lottie/premium/preview-watermark/business-team-generating-idea-animation-gif-download-5293511.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          {/* Video overlay to dull out the video */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/85 to-slate-950/90" />
        </div>

        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-70" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary glow - top left */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />

          {/* Secondary glow - right side */}
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-0" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">
                Crafting Digital Excellence
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
              Transform Ideas Into
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Digital Reality
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              We are{" "}
              <span className="font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Nesisoft
              </span>{" "}
              - a full-cycle software development company specializing in web,
              mobile, and custom solutions that drive innovation across Africa
              and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 group">
                  Get Started
                  <ArrowRight
                    className="ml-2 group-hover:translate-x-1 transition-transform group-hover:text-purple-50"
                    size={20}
                  />
                </Button>
              </Link>

              <a href="tel:+233553140807">
                <Button
                  variant="outline"
                  className="border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm hover:text-white group"
                >
                  <Phone
                    size={20}
                    className="mr-2 transition-transform group-hover:scale-110 group-hover:text-purple-500"
                  />
                  Schedule Call
                </Button>
              </a>
            </div>

            {/* Stats - Now clickable */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              {stats.map((stat) => (
                <button
                  key={stat.id}
                  onClick={() => setOpenModal(stat.id)}
                  className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group relative overflow-hidden"
                >
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-violet-500/10 group-hover:via-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500" />

                  {/* Stat content */}
                  <div className="relative z-10">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:via-fuchsia-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition-all duration-300">
                      {stat.title}
                    </div>
                    <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                      {stat.subtitle}
                    </div>

                    {/* Click hint indicator - Animated fade-in on hover */}
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none scale-95 group-hover:scale-100 hidden sm:block">
                      <div className="text-xs text-white font-medium px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-400/40 backdrop-blur-xl shadow-lg shadow-violet-900/30 whitespace-nowrap">
                        Click to learn more
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute w-full flex items-center justify-center bottom-8 animate-bounce z-10">
          <ChevronDown
            className="w-8 h-8 text-purple-400 animate-pulse"
            strokeWidth={2.5}
          />
        </div>
      </section>

      {/* Modal for each stat */}
      {stats.map((stat) => (
        <Dialog
          key={stat.id}
          open={openModal === stat.id}
          onOpenChange={(open) => setOpenModal(open ? stat.id : null)}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-lg md:rounded-2xl overflow-hidden mx-2 sm:mx-4">
            {/* Close button */}
            <button
              onClick={() => setOpenModal(null)}
              className="absolute right-2 top-2 sm:right-4 sm:top-4 z-50 rounded-full p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 backdrop-blur-sm transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
            </button>

            {/* Modal Header with gradient */}
            <DialogHeader className="relative pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10" />
              <div className="relative z-10">
                <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {stat.modalTitle}
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-sm sm:text-base md:text-lg">
                  Discover more about our achievements
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6">
              {/* Left column: Video and main description */}
              <div className="space-y-4 sm:space-y-6">
                {/* Video container with overlay */}
                <div className="relative rounded-lg md:rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-48 sm:h-56 md:h-64 object-cover"
                  >
                    <source src={stat.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* Video overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
                </div>

                {/* Description */}
                <div className="bg-slate-800/30 rounded-lg md:rounded-xl p-4 sm:p-5 border border-slate-700/30">
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>

              {/* Right column: Highlights and achievements */}
              <div className="space-y-4 sm:space-y-6">
                {/* Highlights section */}
                <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-lg md:rounded-xl p-4 sm:p-5 border border-violet-500/20">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse flex-shrink-0" />
                    Key Highlights
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {stat.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <div className="mt-1 sm:mt-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-400/70 flex-shrink-0" />
                        <span className="text-slate-300 text-sm sm:text-base">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Achievements section */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg md:rounded-xl p-4 sm:p-5 border border-emerald-500/20">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                    Notable Achievements
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {stat.achievements.map((achievement, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <div className="mt-1 sm:mt-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400/70 flex-shrink-0" />
                        <span className="text-slate-300 text-sm sm:text-base">
                          {achievement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to action */}
                <div className="text-center pt-2 sm:pt-4">
                  <Link to="/contact">
                    <Button
                      onClick={() => setOpenModal(null)}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 sm:py-6 rounded-lg md:rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25"
                    >
                      Start Your Project
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer with gradient border */}
            <div className="border-t border-slate-700/50 pt-3 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6 mt-2 sm:mt-4">
              <div className="text-center">
                <p className="text-slate-400 text-xs sm:text-sm">
                  Ready to discuss how we can help with your next project?
                </p>
                <a
                  href="tel:+233553140807"
                  className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors mt-1 sm:mt-2 font-medium text-sm sm:text-base"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>+233 553 140 807</span>
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default Hero;
