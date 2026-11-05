import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TeamGrid } from "@/components/Team";
import { Seo } from "@/components/Seo";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { useTeam } from "@/hooks/useTeam";

const Team = () => {
  const { members, loading } = useTeam();

  return (
    <>
      {/* Kept out of search results only once the API says there's nobody to
          show, so the page would just be the "coming soon" placeholder. */}
      <Seo
        title="Meet Our Software Engineers & Designers in Accra"
        description="Meet the designers, engineers and strategists behind Nesisoft, a software development company in Accra, Ghana, building web and mobile products for Africa."
        noindex={!loading && !members.length}
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
