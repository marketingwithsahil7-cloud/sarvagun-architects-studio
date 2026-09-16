import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { AreaChips } from "./AreaChips";
import { Tagline } from "./Tagline";
import { areas } from "@/lib/content";

export function ServiceAreas() {
  return (
    <section
      id="areas"
      className="shell scroll-mt-24 border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]"
    >
      <DimensionLine index={areas.index} label={areas.label} />

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <Reveal blur>
          <h2 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.03] text-ivory">
            {areas.heading}
          </h2>
          <Tagline className="mt-4">{areas.tagline}</Tagline>
        </Reveal>

        <Reveal className="self-center">
          <AreaChips />
        </Reveal>
      </div>
    </section>
  );
}
