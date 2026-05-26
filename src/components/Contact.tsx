import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ContactForm } from "@/components/ContactForm";
import { MapEmbed } from "@/components/MapEmbed";
import { siteConfig } from "@/config/site";

const Contact = () => {
  return (
    <Section id="contact">
      <SectionHeading
        eyebrow="Contact"
        title="Let's talk about your project"
        description="Tell us what you're building and we'll get back to you within one business day."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card className="rounded-2xl border-white/10 bg-white/[0.03]">
          <CardContent className="p-6 md:p-8">
            <h3 className="mb-6 text-xl font-semibold text-white">
              Send us a message
            </h3>
            <ContactForm />
          </CardContent>
        </Card>

        {/* Info + map */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h3 className="mb-6 text-xl font-semibold text-white">
              Contact information
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-white">Email</h4>
                  <a
                    href={`mailto:${siteConfig.contact.emailGeneral}`}
                    className="block text-sm text-slate-300 transition-colors hover:text-violet-400"
                  >
                    {siteConfig.contact.emailGeneral}
                  </a>
                  <a
                    href={`mailto:${siteConfig.contact.emailSales}`}
                    className="block text-sm text-slate-300 transition-colors hover:text-violet-400"
                  >
                    {siteConfig.contact.emailSales}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-white">Phone</h4>
                  <a
                    href={siteConfig.contact.phonePrimary.href}
                    className="block text-sm text-slate-300 transition-colors hover:text-violet-400"
                  >
                    {siteConfig.contact.phonePrimary.display}
                  </a>
                  <a
                    href={siteConfig.contact.phoneSecondary.href}
                    className="block text-sm text-slate-300 transition-colors hover:text-violet-400"
                  >
                    {siteConfig.contact.phoneSecondary.display}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-white">
                    Location
                  </h4>
                  <p className="text-sm text-slate-300">
                    {siteConfig.contact.location}
                  </p>
                  <p className="text-sm text-slate-400">
                    {siteConfig.contact.region}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-white/10 bg-white/[0.03]">
            <MapEmbed />
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default Contact;
