import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TeamGrid } from "@/components/Team";
import { Seo } from "@/components/Seo";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { team } from "@/data/team";

const Team = () => {

  return (
    <>
      {/* Still reachable, but kept out of search results while it would only
          show the "coming soon" placeholder (src/data/team.ts is empty). */}
      <Seo
        title="Meet Our Software Engineers & Designers in Accra"
        description="Meet the designers, engineers and strategists behind Nesisoft, a software development company in Accra, Ghana, building web and mobile products for Africa."
        noindex={!team.length}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          align="center"
          eyebrow="Our people"
          title="The team behind Nesisoft"
          description="Designers, engineers, and strategists who turn ideas into reliable software."
        />
        <Section className="pt-0">
          <TeamGrid />
        </Section>
        <Footer />
      </PageShell>
    </>
  );
};

export default Team;
