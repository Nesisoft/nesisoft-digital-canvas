import { siteConfig } from "@/config/site";

/**
 * Keyless Google Maps embed centered on the company location. Uses the
 * `output=embed` endpoint (no API key / billing required), lazy-loaded so it
 * never blocks initial paint. Replaces the old "Interactive Map — Coming Soon"
 * placeholder. Google's embed is light-only, so a CSS filter inverts it into
 * a dark map that sits naturally on the site's near-black canvas.
 */
export function MapEmbed({ className = "" }: { className?: string }) {
  const query = encodeURIComponent(siteConfig.contact.location);
  return (
    <iframe
      title={`Map of ${siteConfig.contact.location}`}
      src={`https://maps.google.com/maps?q=${query}&z=12&output=embed`}
      className={`w-full h-64 border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.55)_brightness(0.95)_contrast(0.9)] ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
