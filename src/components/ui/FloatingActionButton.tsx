import { MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

const FloatingActionButton = () => {
  const whatsappHref = `https://wa.me/${siteConfig.contact.phonePrimary.display.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    "Hi Nesisoft, I would like to discuss a software project."
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
      <a
        href={siteConfig.contact.phonePrimary.href}
        aria-label="Call Nesisoft"
        className="flex h-11 w-11 items-center justify-center rounded-[999px] border border-white/10 bg-[#0b0d12]/90 text-slate-200 shadow-lg shadow-black/25 backdrop-blur transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <Phone className="h-4 w-4" />
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Message Nesisoft on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-[999px] bg-violet-600 text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
};

export default FloatingActionButton;

