export interface Client {
  name: string;
  logo: string;
  url?: string;
}

/**
 * Client logos for the strip under the homepage hero, shown in this order.
 * The strip is omitted entirely while this list is empty. Only list clients
 * who are happy to be named.
 *
 * Logos go in `public/clients/` and are referenced as "/clients/<file>" — SVG
 * preferred, otherwise a transparent PNG at least 80px tall. They're shown at
 * a fixed height (grayscale until hovered), so trim any padding around the
 * mark and use a version that reads on a dark background (light or full
 * colour, not black). `name` is the logo's alt text. `url` is optional; when
 * set, the logo links to it (opens in a new tab).
 *
 * Example:
 *   {
 *     name: "Asante Logistics",
 *     logo: "/clients/asante-logistics.svg",
 *     url: "https://…",
 *   },
 */
export const clients: Client[] = [];
