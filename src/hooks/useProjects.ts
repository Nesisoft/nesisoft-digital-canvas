import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/api";
import { projects as defaultProjects, type Project } from "@/data/projects";

/**
 * Projects are editable in /admin and served live from the API. The bundled
 * `src/data/projects.ts` acts as instant placeholder data (and the seed source)
 * so the homepage/nav render correctly with no flash and keep working offline.
 */
export function useProjects(): Project[] {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    placeholderData: defaultProjects,
  });
  return data ?? defaultProjects;
}
