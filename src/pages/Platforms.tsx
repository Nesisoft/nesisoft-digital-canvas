import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo, breadcrumbsJsonLd } from "@/components/Seo";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { PlatformMark, StatusPill } from "@/components/PlatformBits";
import { useProjects } from "@/hooks/useProjects";
import { resolveImage } from "@/lib/api";

/** /platforms: the products Nesisoft builds and runs, each linking to its page. */
const Platforms = () => {
  const platforms = useProjects().filter((p) => p.type === "Internal platform");

  return (
    <>
      <Seo
        title="Our Platforms: Products Built in Ghana for Africa"
        description={`Alongside client work, Nesisoft builds and runs its own platforms${
          platforms.length ? `: ${platforms.map((p) => p.name).join(", ")}` : ""
        }. See what each one does and get early access.`}
        jsonLd={breadcrumbsJsonLd([
          { name: "Home", path: "/" },
          { name: "Platforms", path: "/platforms" },
        ])}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          eyebrow="Platforms"
          title="Products we build and run"
          description="Alongside client work, we build our own platforms for everyday problems across Africa: errands, tutoring, online learning and commerce."
        />
        <Section className="pt-0">
          <div className="grid gap-6 md:grid-cols-2">
            {platforms.map((platform) => (
              <Link
                key={platform.slug}
                to={`/platforms/${platform.slug}`}
                className="group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition-colors hover:border-violet-500/30 hover:bg-white/[0.05]"
              >
                {platform.image && (
                  <div className="aspect-[16/9] overflow-hidden border-b border-white/10">
                    <img
                      src={resolveImage(platform.image)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <PlatformMark project={platform} />
                      <div>
                        <h2 className="font-display text-2xl font-bold text-white">{platform.name}</h2>
                        <p className="text-sm text-slate-400">{platform.category}</p>
                      </div>
                    </div>
                    <StatusPill status={platform.status} />
                  </div>
                  <p className="mt-5 flex-1 text-lg leading-relaxed text-slate-200">
                    {platform.tagline || platform.description}
                  </p>
                  <span className="mt-6 inline-flex items-center text-sm font-medium text-violet-300">
                    Explore {platform.name}
                    <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
        <Footer />
      </PageShell>
    </>
  );
};

export default Platforms;
