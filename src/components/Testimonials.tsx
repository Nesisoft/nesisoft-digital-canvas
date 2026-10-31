import { ArrowUpRight, Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { cn, initials } from "@/lib/utils";
import { testimonials, type Testimonial } from "@/data/testimonials";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, name, role, company, image, link } = testimonial;
  const byline = [role, company].filter(Boolean).join(" · ");

  // Each card spans three rows of the parent grid (mark, quote, byline) and
  // shares them via subgrid, so cards side by side keep their dividers level
  // even when one quote or byline runs longer.
  return (
    <figure className="row-span-3 grid grid-rows-subgrid gap-0 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <Quote aria-hidden className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
      <blockquote className="mt-5 text-base leading-7 text-slate-200">
        <p>{quote}</p>
      </blockquote>

      <figcaption className="mt-8 flex items-center gap-4 self-start border-t border-white/10 pt-6">
        {/* The name sits right beside the photo, so the photo itself is decorative. */}
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-12 w-12 flex-shrink-0 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-violet-500/15 text-sm font-semibold text-violet-100"
          >
            {initials(name)}
          </div>
        )}
        <div className="min-w-0">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-white transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
            >
              {name}
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5 flex-shrink-0" />
            </a>
          ) : (
            <p className="font-semibold text-white">{name}</p>
          )}
          {byline && (
            <p className="mt-0.5 text-sm font-medium leading-5 text-violet-300">
              {byline}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

// With only one or two quotes, size the grid to them rather than leaving
// empty columns beside them.
const columns =
  testimonials.length === 1
    ? "mx-auto max-w-2xl"
    : testimonials.length === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-2 lg:grid-cols-3";

/** Homepage "Testimonials" section — omitted entirely until there are quotes to show. */
const Testimonials = () => {
  if (!testimonials.length) return null;

  return (
    <Section id="testimonials">
      <SectionHeading
        eyebrow="Testimonials"
        title="What our clients say"
        description="In their own words: the teams we've designed, built and shipped software with."
      />
      <div className={cn("mt-16 grid grid-cols-1 gap-6", columns)}>
        {testimonials.map((testimonial) => (
          <TestimonialCard
            key={`${testimonial.name}-${testimonial.company}`}
            testimonial={testimonial}
          />
        ))}
      </div>
    </Section>
  );
};

export default Testimonials;
