import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { Tagline } from "./Tagline";
import { aboutStory } from "@/lib/about-content";

/**
 * TODO: real founder bio — years active, qualification, founding story —
 * pending from client. Do not invent a founding year, "X years of
 * experience," registration status, or generic architect-bio copy to fill
 * this gap — replace aboutStory.body in lib/about-content.ts with the real
 * paragraph once the client supplies it, then remove the placeholder
 * styling below (the dashed border and the "Placeholder" tag).
 */
export function AboutStory() {
  return (
    <section className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <DimensionLine index={aboutStory.index} label={aboutStory.label} />

      <Reveal blur className="mt-10 max-w-[38rem]">
        <h2 className="font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.08] text-ivory">
          {aboutStory.heading}
        </h2>
        <Tagline className="mt-4">{aboutStory.tagline}</Tagline>

        <div className="relative mt-6 border border-dashed border-[var(--hairline)] px-6 py-6 sm:px-8">
          <span className="absolute -top-3 left-6 bg-ink px-2 font-sans text-[0.72rem] uppercase tracking-[0.08em] text-burnt sm:left-8">
            Placeholder — pending from client
          </span>
          <p className="font-sans text-[1rem] leading-relaxed text-dim">{aboutStory.body}</p>
        </div>
      </Reveal>
    </section>
  );
}
