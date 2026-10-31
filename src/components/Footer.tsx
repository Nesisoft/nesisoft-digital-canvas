import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { services } from "@/data/services";
import { internalProjects } from "@/data/projects";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-[#09090b] text-white">
      {/* Gold hairline that fades out at the edges. */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-gold-300/60 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link
              to="/"
              className="text-xl font-bold tracking-[-0.02em] text-white"
            >
              Nesisoft
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Full-cycle software design and development for teams building
              practical web, mobile, and custom systems across Africa.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              <a
                href={`mailto:${siteConfig.contact.emailGeneral}`}
                className="inline-flex items-center gap-3 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-violet-300" />
                {siteConfig.contact.emailGeneral}
              </a>
              <a
                href={siteConfig.contact.phonePrimary.href}
                className="inline-flex items-center gap-3 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 text-violet-300" />
                {siteConfig.contact.phonePrimary.display}
              </a>
              <span className="inline-flex items-center gap-3">
                <MapPin className="h-4 w-4 text-violet-300" />
                {siteConfig.contact.location}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>
                  <Link to="/#about" className="transition-colors hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#services"
                    className="transition-colors hover:text-white"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#projects"
                    className="transition-colors hover:text-white"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition-colors hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Services</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {services.slice(0, 4).map((service) => (
                  <li key={service.slug}>
                    <Link
                      to={`/services/${service.slug}`}
                      className="transition-colors hover:text-white"
                    >
                      {service.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Platforms</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {internalProjects.slice(0, 4).map((project) => (
                  <li key={project.slug}>
                    <Link
                      to={`/projects/${project.slug}`}
                      className="transition-colors hover:text-white"
                    >
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>
                  <Link to="/blog" className="transition-colors hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.contact.emailSales}`}
                    className="transition-colors hover:text-white"
                  >
                    Sales
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.contact.phonePrimary.href}
                    className="transition-colors hover:text-white"
                  >
                    Book a call
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>© {currentYear} Nesisoft. All rights reserved.</p>
            <Link to="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
          </div>
          <p>{siteConfig.contact.region}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
