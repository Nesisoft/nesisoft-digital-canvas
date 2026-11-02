import { cn } from "@/lib/utils";

/** The "n" of the Nesisoft mark, traced from the brand logo (512 × 512 box). */
const N_PATH =
  "M 284.31 123.62 C 259.79 126.62 238.92 136.27 222.62 152.22 C 220.41 154.44 218.49 156.11 218.39 156.01 C 218.29 155.91 214.74 148.87 210.51 140.41 L 202.78 125.05 L 171.52 125.05 L 140.31 125.05 L 140.31 258.22 L 140.31 391.38 L 179.99 391.38 L 219.67 391.38 L 219.37 345.7 C 219.22 320.59 218.93 285 218.78 266.58 C 218.58 242.9 218.63 231.63 219.08 228.04 C 221.78 203.67 236.75 189.34 260.68 188.21 C 283.27 187.18 299.13 199.48 304.15 221.98 C 304.94 225.43 304.98 232.22 304.94 308.58 L 304.94 391.38 L 345.06 391.29 L 385.23 391.14 L 385.38 303.02 C 385.53 211.69 385.38 203.03 383.51 192 C 377.06 153.65 350.42 128.39 311.63 123.82 C 305.03 123.03 290.07 122.93 284.31 123.62 Z";

/**
 * The Nesisoft logo mark: the white "n" on a brand-purple circle, inline so it
 * stays crisp at any size. The same artwork ships as public/brand/*.svg and
 * the favicons. Decorative here: the links around it carry the label.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden
      focusable="false"
      className={cn("h-8 w-8 flex-shrink-0", className)}
    >
      <circle cx="256" cy="256" r="256" fill="#621DAF" />
      <path fill="#FFFFFF" d={N_PATH} />
    </svg>
  );
}
