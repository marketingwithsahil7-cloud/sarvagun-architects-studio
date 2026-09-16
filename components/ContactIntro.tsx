import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { contactIntro } from "@/lib/content";

/**
 * The page's own h1 — Contact has no Hero above it, so this is where the
 * page's single top-level heading lives.
 */
export function ContactIntro() {
  return (
    <section className="shell pb-[clamp(3rem,7vh,5rem)] pt-[clamp(7rem,17vh,10.5rem)]">
      <DimensionLine index={contactIntro.index} label={contactIntro.label} />

      <Reveal blur className="mt-10 max-w-[42rem]">
        <p className="font-sans text-[0.85rem] text-dim">{contactIntro.tagline}</p>
        <h1 className="font-display mt-4 text-[clamp(2.4rem,5.6vw,4.2rem)] font-medium leading-[1.03] text-ivory">
          {contactIntro.heading}
        </h1>
        <p className="mt-5 font-sans text-[1.05rem] leading-relaxed text-dim">{contactIntro.body}</p>
      </Reveal>
    </section>
  );
}
