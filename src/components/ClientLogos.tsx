import { Section } from "@/components/ui/section";
import { clients, type Client } from "@/data/clients";

function ClientLogo({ client }: { client: Client }) {
  // Muted grayscale by default; full colour on hover or keyboard focus.
  const logo = (
    <img
      src={client.logo}
      alt={client.name}
      loading="lazy"
      className="h-8 w-auto max-w-[min(100%,8rem)] object-contain opacity-70 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 md:h-9 md:max-w-[min(100%,9rem)]"
    />
  );

  if (!client.url) return <div className="group flex min-w-0 p-2">{logo}</div>;

  return (
    <a
      href={client.url}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
    >
      {logo}
    </a>
  );
}

/** Logo strip under the homepage hero — omitted entirely until there are clients to show. */
const ClientLogos = () => {
  if (!clients.length) return null;

  return (
    <Section
      id="clients"
      aria-labelledby="clients-heading"
      className="py-10 md:py-12"
    >
      <h2
        id="clients-heading"
        className="text-center font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-300"
      >
        Teams we've worked with
      </h2>
      {/* Two, then three logos per row, in even columns; one free-flowing row
          from lg up. A short last row stays centred. */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-y-4 border-y border-white/10 py-6 md:py-8 lg:gap-x-12">
        {clients.map((client) => (
          <li
            key={client.name}
            className="flex min-w-0 basis-1/2 justify-center sm:basis-1/3 lg:basis-auto"
          >
            <ClientLogo client={client} />
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default ClientLogos;
