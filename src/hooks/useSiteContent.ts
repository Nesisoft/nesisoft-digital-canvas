import { useQuery } from "@tanstack/react-query";
import { fetchContent, DEFAULT_CONTENT, withContentDefaults, type SiteContent } from "@/lib/api";

/**
 * Editable marketing copy. Seeds with DEFAULT_CONTENT as placeholder data so
 * components render the correct text instantly (no flash, works offline) and
 * swap to the API's version once it arrives.
 */
export function useSiteContent(): SiteContent {
  const { data } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
    placeholderData: DEFAULT_CONTENT,
  });
  return data ? withContentDefaults(data) : DEFAULT_CONTENT;
}
