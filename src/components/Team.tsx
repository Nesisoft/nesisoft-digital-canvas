import { Github, Linkedin, Twitter } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { resolveImage, type TeamMember } from "@/lib/api";
import { initials } from "@/lib/utils";
import { useTeam } from "@/hooks/useTeam";

const GRID = "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3";
// Portrait photos, as large as the column allows.
const PHOTO = "aspect-[4/5] w-full";

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "twitter", label: "X", Icon: Twitter },
  { key: "github", label: "GitHub", Icon: Github },
] as const;

function MemberCard({ member }: { member: TeamMember }) {
  const image = resolveImage(member.image);
  const socials = member.socials || {};
  const links = SOCIALS.filter(({ key }) => socials[key]);
  return (
    <article className="group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition-colors hover:border-violet-500/30">
      {image ? (
        <img
          src={image}
          alt={member.name}
          loading="lazy"
          decoding="async"
          className={`${PHOTO} object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]`}
        />
      ) : (
        <div
          aria-hidden="true"
          className={`${PHOTO} flex items-center justify-center bg-gradient-to-br from-violet-600/35 via-violet-900/20 to-transparent font-display text-5xl font-bold text-violet-100 sm:text-6xl`}
        >
          {initials(member.name)}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-base font-bold leading-snug tracking-tight text-white sm:text-xl">
          {member.name}
        </h3>
        {member.role && (
          <p className="mt-1 text-xs font-medium leading-5 text-violet-300 sm:text-sm">{member.role}</p>
        )}
        {links.length > 0 && (
          <div className="mt-auto flex gap-2 pt-4">
            {links.map(({ key, label, Icon }) => (
              <a
                key={key}
                href={socials[key]}
                target="_blank"
                rel="noreferrer"
                aria-label={`${member.name} on ${label}`}
                className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-violet-400/40 hover:text-violet-200"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/** Card-shaped placeholders while the team loads (the same size, so nothing jumps). */
function TeamSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading the team">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="animate-pulse border border-white/10 bg-white/[0.03]">
          <div className={`${PHOTO} bg-white/[0.05]`} />
          <div className="p-4 sm:p-5">
            <div className="h-5 w-3/4 bg-white/[0.06]" />
            <div className="mt-2 h-3 w-1/2 bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The team grid: placeholders while loading, then the published members in order. */
export function TeamGrid() {
  const { members, loading } = useTeam();
  if (loading) return <TeamSkeleton />;
  return (
    <div className={GRID}>
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

/**
 * The Company page's Team section: placeholders while the team loads, then
 * the team; left out entirely when nobody is published.
 */
export function TeamSection() {
  const { members, loading } = useTeam();
  if (!loading && !members.length) return null;

  return (
    <Section id="team">
      <SectionHeading
        align="left"
        eyebrow="Team"
        title="The people behind the work"
        description="Designers, engineers and strategists who turn ideas into reliable software."
      />
      <div className="mt-12">
        <TeamGrid />
      </div>
    </Section>
  );
}
