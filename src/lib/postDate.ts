/**
 * "15 Jan 2025". A fixed locale and UTC (ISO dates parse as UTC midnight), so
 * the prerendered HTML and every visitor's browser show the same day. On its
 * own so lists can show dates without importing src/lib/blog.ts, which
 * bundles every article.
 */
export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
