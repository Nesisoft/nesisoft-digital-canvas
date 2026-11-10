import { useQuery } from "@tanstack/react-query";
import { fetchTrainingships } from "@/lib/api";
import { DEFAULT_TRAININGSHIPS, type TrainingshipsConfig } from "@shared/trainingships.js";

/**
 * The Trainingships page's content, edited in /admin → Trainingships. The
 * defaults (shared/trainingships.js) stand in until the live content arrives.
 */
export function useTrainingships(): TrainingshipsConfig {
  const { data } = useQuery({
    queryKey: ["trainingships"],
    queryFn: fetchTrainingships,
    placeholderData: DEFAULT_TRAININGSHIPS,
  });
  return data ?? DEFAULT_TRAININGSHIPS;
}
