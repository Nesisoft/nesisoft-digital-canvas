import { useQuery } from "@tanstack/react-query";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { fetchTeam, resolveImage, type TeamMember } from "@/lib/api";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberCard({ member }: { member: TeamMember }) {
  const image = resolveImage(member.image);
  const socials = member.socials || {};
  return (
    <article className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition-colors hover:border-violet-500/30 hover:bg-white/[0.055]">
      {image ? (
        <img
          src={image}
          alt={member.name}
          loading="lazy"
          className="h-24 w-24 rounded-full border border-white/10 object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-violet-500/15 text-xl font-semibold text-violet-100">
          {initials(member.name)}
        </div>
      )}
      <h3 className="mt-5 text-lg font-semibold text-white">{member.name}</h3>
      {member.role && (
        <p className="mt-1 text-sm font-medium text-violet-300">{member.role}</p>
      )}
      {member.bio && (
        <p className="mt-3 text-sm leading-6 text-slate-300">{member.bio}</p>
      )}
      {(socials.linkedin || socials.twitter || socials.github) && (
        <div className="mt-5 flex gap-3">
          {socials.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="text-slate-400 transition-colors hover:text-violet-300"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {socials.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on X`}
              className="text-slate-400 transition-colors hover:text-violet-300"
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {socials.github && (
            <a
              href={socials.github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on GitHub`}
              className="text-slate-400 transition-colors hover:text-violet-300"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

/** Bare grid of team members — used on both the homepage and the Team page. */
export function TeamGrid() {
  const { data: team = [], isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: fetchTeam,
  });

  if (isLoading) {
    return (
      <p className="text-center text-sm text-slate-400">Loading the team…</p>
    );
  }
  if (!team.length) {
    return (
      <p className="text-center text-sm text-slate-400">
        Team members will appear here soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {team.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

/** Homepage "Team" section. */
const Team = () => (
  <Section id="team">
    <SectionHeading
      eyebrow="Team"
      title="The people behind the work"
      description="A senior, multi-disciplinary team that designs, builds, and ships software for African markets."
    />
    <div className="mt-16">
      <TeamGrid />
    </div>
  </Section>
);

export default Team;
