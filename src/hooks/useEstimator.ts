import { useQuery } from "@tanstack/react-query";
import { fetchEstimator } from "@/lib/api";
import { DEFAULT_ESTIMATOR, type EstimatorConfig } from "@shared/estimator.js";

/**
 * The cost calculator's price list, edited in /admin → Pricing. The starting
 * prices (shared/estimator.js) stand in until the live list arrives, so the
 * calculator works at once (and in the prerendered page).
 */
export function useEstimator(): EstimatorConfig {
  const { data } = useQuery({
    queryKey: ["estimator"],
    queryFn: fetchEstimator,
    placeholderData: DEFAULT_ESTIMATOR,
  });
  return data ?? DEFAULT_ESTIMATOR;
}
