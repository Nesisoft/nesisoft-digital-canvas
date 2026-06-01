import { CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";

const About = () => {
  const stats = [
    { number: "10+", label: "Projects delivered" },
    { number: "5+", label: "Clients served" },
    { number: "5+", label: "Years building" },
    { number: "2+", label: "Countries served" },
  ];

  const benefits = [
    "Full-cycle development, from concept to deployment",
    "A senior team with a proven track record",
    "Deep understanding of African markets",
    "Practical solutions to real-world problems",
  ];

  return (
    <Section id="about">
      <SectionHeading
        eyebrow="About"
        title="A studio built for Africa's digital growth"
        description="We turn ideas into practical software — tailored to how businesses across Africa actually operate, and built to last."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mission */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <h3 className="mb-6 text-xl font-semibold text-white">Our mission</h3>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              We help clients innovate, grow and thrive in the digital economy.
              Beyond delivering software, we create jobs, widen digital
              inclusion and build lasting economic value on the continent.
            </p>
            <p>
              Through ventures like Agoo, Sua, Adesuapa and Jua, we build
              scalable platforms that solve regional problems — alongside our
              client work.
            </p>
          </div>
        </div>

        {/* Why choose us */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <h3 className="mb-6 text-xl font-semibold text-white">Why work with us</h3>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-400" />
                <span className="text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-950/40 p-8 text-center">
            <div className="text-3xl font-semibold text-white md:text-4xl">
              {stat.number}
            </div>
            <div className="mt-2 text-sm text-slate-300">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default About;
