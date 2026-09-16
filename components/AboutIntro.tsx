import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { CornerMarks } from "./CornerMarks";
import { MediaFrame } from "./MediaFrame";
import { LogoLockup } from "./LogoLockup";
import { aboutIntro } from "@/lib/about-content";
import { brandTagline } from "@/lib/content";

/**
 * The page's own h1 (About has no Hero above it) — the real tagline as a
 * large headline, paired with a real, large-format portrait. Deliberately
 * "a practice led by Apoorv Gupta," not "Apoorv Gupta does all of this
 * personally" — the tagline itself already names four disciplines.
 */
export function AboutIntro() {
  return (
    <section className="shell pb-[clamp(3rem,7vh,5rem)] pt-[clamp(7rem,17vh,10.5rem)]">
      <DimensionLine index={aboutIntro.index} label={aboutIntro.label} />

      <Reveal blur className="mt-10">
        {/* Client's strict instruction: the logo+name lockup must read
            identically everywhere it appears — this used to run its own,
            larger, differently-tracked treatment (BrandLockup.tsx) instead
            of reusing the nav/Footer's LogoLockup, which is exactly the
            inconsistency that was flagged. */}
        <LogoLockup size="nav" />
        <p className="mt-5 font-sans text-[0.85rem] tracking-wide text-dim">{brandTagline}</p>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal blur>
          <h1 className="font-display text-[clamp(2.4rem,5.6vw,4.2rem)] font-medium leading-[1.03] text-ivory">
            {aboutIntro.heading}
          </h1>
          <p className="mt-6 max-w-[30rem] font-sans text-[1.05rem] leading-relaxed text-dim">
            {aboutIntro.body}
          </p>
        </Reveal>

        <Reveal blur>
          <div className="media-well relative aspect-[3/4] w-full border border-[var(--hairline)] lg:aspect-auto lg:h-[32rem]">
            <MediaFrame media={aboutIntro.portrait} sizes="(min-width: 1024px) 45vw, 100vw" priority />
            <CornerMarks />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
