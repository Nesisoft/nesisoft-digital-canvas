import { useQuery } from "@tanstack/react-query";
import { fetchTeam, type TeamMember } from "@/lib/api";
import { team as bundledTeam } from "@/data/team";

/**
 * Team members are managed in /admin and served live from the API (published
 * members only, in display order). The bundled `src/data/team.ts` stands in
 * until the API answers, and if it can't.
 *
 * `loading` is true while that first answer is still coming and there's
 * nothing bundled to show meanwhile: render a placeholder then, not "no
 * team", so pages don't flash an empty state before the real list arrives.
 */
export function useTeam(): { members: TeamMember[]; loading: boolean } {
  const { data, isPlaceholderData } = useQuery({
    queryKey: ["team"],
    queryFn: fetchTeam,
    placeholderData: bundledTeam,
  });
  const members = [...(data ?? bundledTeam)].sort((a, b) => a.order - b.order);
  return { members, loading: isPlaceholderData && members.length === 0 };
}
