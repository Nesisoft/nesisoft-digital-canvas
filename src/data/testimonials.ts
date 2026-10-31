export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  link?: string;
}

/**
 * Client testimonials for the homepage, shown in this order. The section is
 * omitted entirely while this list is empty. Only use real quotes from real
 * clients, with their permission.
 *
 * Photos go in `public/testimonials/` and are referenced as
 * "/testimonials/<file>" — square, at least 200×200, JPG or WebP. Leave
 * `image` out to show the person's initials instead. `link` is optional; when
 * set, the person's name links to it (opens in a new tab).
 *
 * Example:
 *   {
 *     quote: "Nesisoft took our idea from a whiteboard sketch to a live app in …",
 *     name: "Kwame Asante",
 *     role: "Operations Director",
 *     company: "Asante Logistics",
 *     image: "/testimonials/kwame-asante.jpg",
 *     link: "https://linkedin.com/in/…",
 *   },
 */
export const testimonials: Testimonial[] = [];
