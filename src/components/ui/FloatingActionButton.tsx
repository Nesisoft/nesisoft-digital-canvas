import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * One quiet WhatsApp shortcut. Calling is already in the navbar and hero, so a
 * second floating button only added clutter over the content.
 */
const FloatingActionButton = () => {
  const whatsappHref = `https://wa.me/${siteConfig.contact.phonePrimary.display.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    "Hi Nesisoft, I would like to discuss a software project."
  )}`;

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Message Nesisoft on WhatsApp"
      className="group fixed bottom-4 right-4 z-40 flex h-12 items-center gap-2 rounded-[999px] bg-violet-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-violet-950/40 transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp us</span>
    </a>
  );
};

export default FloatingActionButton;
