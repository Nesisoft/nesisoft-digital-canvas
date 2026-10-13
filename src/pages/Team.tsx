import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TeamGrid } from "@/components/Team";
import { Seo } from "@/components/Seo";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";

const Team = () => {

  return (
    <>
      <Seo
        title="Team"
        description="Meet the people behind Nesisoft — the senior, multi-disciplinary team designing and building software across Africa."
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
