import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Linkedin, Twitter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page-shell";
import { Section, SectionHeading } from "@/components/ui/section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resolveImage, type TeamMember } from "@/lib/api";
import { initials } from "@/lib/utils";
import { team as teamData } from "@/data/team";

function MemberCard({ member }: { member: TeamMember }) {
  const image = resolveImage(member.image);
  const socials = member.socials || {};
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex h-full min-h-[13.5rem] flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center transition-colors hover:border-violet-500/30 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:min-h-[16rem] sm:p-6"
        >
          {image ? (
            <img
              src={image}
              alt={member.name}
              loading="lazy"
              className="h-20 w-20 rounded-full border border-white/10 object-cover sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-violet-500/15 text-lg font-semibold text-violet-100 sm:h-24 sm:w-24 sm:text-xl">
              {initials(member.name)}
            </div>
          )}
          <h3 className="mt-4 line-clamp-2 text-sm font-semibold leading-5 text-white sm:mt-5 sm:text-lg sm:leading-6">
            {member.name}
          </h3>
          {member.role && (
            <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-violet-300 sm:text-sm">
              {member.role}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-medium text-slate-400 transition-colors group-hover:text-violet-200">
            View profile
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-white/10 bg-[#0f0f12] p-0 text-white shadow-2xl shadow-black/40">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {image ? (
              <img
                src={image}
                alt={member.name}
                className="h-20 w-20 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-violet-500/15 text-lg font-semibold text-violet-100">
                {initials(member.name)}
              </div>
            )}
            <div className="min-w-0 flex-1 pt-1">
              <DialogTitle className="text-xl leading-7 text-white">
                {member.name}
              </DialogTitle>
              {member.role && (
                <DialogDescription className="mt-1 text-sm font-medium text-violet-300">
                  {member.role}
                </DialogDescription>
              )}
            </div>
          </div>

          {member.bio && (
            <p className="mt-5 text-sm leading-7 text-slate-300">{member.bio}</p>
          )}

          {(socials.linkedin || socials.twitter || socials.github) && (
            <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-violet-400/40 hover:text-violet-200"
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-violet-400/40 hover:text-violet-200"
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-violet-400/40 hover:text-violet-200"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// The team is bundled with the frontend (src/data/team.ts) for now, so there
// is no loading or error state — just the list, in display order.
const sortedTeam = [...teamData].sort((a, b) => a.order - b.order);

/** Bare grid of team members — used on both the homepage and the Team page. */
export function TeamGrid() {
  const team = sortedTeam;

  if (!team.length) {
    return (
      <EmptyState
        title="Team profiles are coming soon"
        description="We're putting faces to names. In the meantime, say hello."
        icon={<Users className="h-5 w-5" />}
        action={
          <Button asChild className="rounded-lg bg-violet-600 text-white hover:bg-violet-500">
            <Link to="/contact">Get in touch</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {team.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

/** Homepage "Team" section — omitted entirely until there are members to show. */
const Team = () => {
  if (!sortedTeam.length) return null;

  return (
    <Section id="team">
      <SectionHeading
        eyebrow="Team"
        title="The people behind the work"
        description="A multi-disciplinary team that designs, builds, and ships software for African markets."
      />
      <div className="mt-12">
        <TeamGrid />
      </div>
    </Section>
  );
};

export default Team;
