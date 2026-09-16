import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { testimonials } from "@/lib/content";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Real Google reviews, verbatim. Deliberately not star-icon cards — a small
 * burnt-orange sign-off stamp instead, in keeping with the drafting/QA
 * language already established (it echoes the site-supervision "checked"
 * motif from Home's Process section). The stat line ("5.0 · 86 reviews")
 * leads once; it doesn't repeat per quote.
 */
export function Testimonials() {
  return (
    <section className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <DimensionLine index={testimonials.index} label={testimonials.label} />

      <Reveal blur className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="font-display text-[clamp(1.9rem,4.2vw,3rem)] font-medium leading-[1.05] text-ivory">
          {testimonials.heading}
        </h2>
        <p className="font-sans text-[0.9rem] tabular-nums text-burnt">{testimonials.stat}</p>
      </Reveal>

      <div className="mt-12 max-w-[46rem]">
        {testimonials.quotes.map((quote, i) => (
          <div key={i}>
            {i > 0 && <DimensionLine index={pad(i + 1)} label="Google review" className="my-10" />}
            <Reveal>
              {/*
                The stamp used to hang left of the quote via pl-10 + absolute
                positioning — which pushed the quote text 40px right of the
                shared shell gutter every other section's content sits flush
                against (a 22px mark doesn't fit inside a 20px mobile gutter
                without overlapping the text either way). Stacking it above
                the quote instead keeps the text's left edge identical to
                the rest of the page at every breakpoint, no gutter-width
                math required.
              */}
              <blockquote>
                <ReviewStamp className="mb-3" />
                <p className="font-sans text-[1.05rem] leading-relaxed text-ivory sm:text-[1.15rem]">
                  “{quote}”
                </p>
              </blockquote>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/** A small sign-off stamp — square outline + tick — instead of a star row. */
function ReviewStamp({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`text-burnt ${className}`}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <rect x="0.75" y="0.75" width="20.5" height="20.5" stroke="currentColor" strokeWidth="1" />
      <path d="M5 11.5l4 4 8-8.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
