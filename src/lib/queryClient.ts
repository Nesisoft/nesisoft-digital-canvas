import { QueryClient } from "@tanstack/react-query";

// Cache fetched content so navigating between pages doesn't refetch on every
// mount. Data stays "fresh" for 5 min and is served from cache meanwhile;
// admin edits call invalidateQueries to refresh immediately.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
