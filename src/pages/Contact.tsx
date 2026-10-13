import { Mail, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { MapEmbed } from "@/components/MapEmbed";
import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";

const Contact = () => {

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with Nesisoft to discuss your web, mobile, or custom software project. Based in Accra, Ghana and serving Africa and beyond."
      />
      <PageShell>
        <Navbar />
        <PageHeader
          backTo="/"
          backLabel="Back to home"
          eyebrow="Contact"
          title="Tell us what you want to build"
          description="Send the project context, timeline, and business goal. We will respond with the right next step instead of a generic sales pitch."
        />

        <Section className="pt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-2xl border-white/10 bg-white/[0.03]">
              <CardContent className="p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white">
                    Project brief
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    A few clear details are enough. If the scope is early, say
                    that and we will help shape it.
                  </p>
                </div>
                <ContactForm />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-2xl border-white/10 bg-white/[0.03] p-6 md:p-8">
                <h2 className="text-xl font-semibold text-white">
                  Direct channels
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Prefer a direct conversation? Use the channels below.
                </p>

                <div className="mt-8 space-y-5">
                  <a
                    href={`mailto:${siteConfig.contact.emailGeneral}`}
                    className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                      <Mail className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-white">
                        Email
                      </span>
                      <span className="mt-1 block text-sm text-slate-300">
                        {siteConfig.contact.emailGeneral}
                      </span>
                    </span>
                  </a>

                  <a
                    href={siteConfig.contact.phonePrimary.href}
                    className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                      <Phone className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-white">
                        Phone
                      </span>
                      <span className="mt-1 block text-sm text-slate-300">
                        {siteConfig.contact.phonePrimary.display}
                      </span>
                    </span>
                  </a>

                  <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-white">
                        Location
                      </span>
                      <span className="mt-1 block text-sm text-slate-300">
                        {siteConfig.contact.location}
                      </span>
                      <span className="block text-sm text-slate-400">
                        {siteConfig.contact.region}
                      </span>
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden rounded-2xl border-white/10 bg-white/[0.03]">
                <MapEmbed />
              </Card>
            </div>
          </div>
        </Section>
        <Footer />
      </PageShell>
    </>
  );
};

export default Contact;

