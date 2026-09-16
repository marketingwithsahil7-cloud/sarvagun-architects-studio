import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { Tagline } from "./Tagline";
import { aboutStory } from "@/lib/about-content";

export function AboutStory() {
  return (
    <section className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <DimensionLine index={aboutStory.index} label={aboutStory.label} />

      <Reveal blur className="mt-10 max-w-[38rem]">
        <h2 className="font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.08] text-ivory">
          {aboutStory.heading}
        </h2>
        <Tagline className="mt-4">{aboutStory.tagline}</Tagline>

        <div className="mt-6 space-y-4">
          {aboutStory.body.map((paragraph, i) => (
            <p key={i} className="font-sans text-[1rem] leading-relaxed text-dim">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
