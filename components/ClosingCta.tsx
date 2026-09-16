import Link from "next/link";
import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { CornerMarks } from "./CornerMarks";
import { closingCta, whatsappHref } from "@/lib/content";

/**
 * `index`/`label` default to Home's own 01–07 numbering; pass overrides when
 * reusing this on a page with independent section numbering (e.g. /about),
 * same pattern Contact already uses for its own 01–03 sequence.
 */
export function ClosingCta({ index, label }: { index?: string; label?: string } = {}) {
  return (
    <section className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <DimensionLine index={index ?? closingCta.index} label={label ?? closingCta.label} />

      <Reveal blur className="relative mt-10 border border-[var(--hairline)] bg-panel px-6 py-14 sm:px-12 sm:py-20">
        <CornerMarks inset={18} />
        <div className="mx-auto max-w-[36rem] text-center">
          <h2 className="font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.08] text-ivory">
            {closingCta.heading}
          </h2>
          <p className="mt-4 font-sans text-[1rem] leading-relaxed text-dim">{closingCta.body}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-magnet
              className="inline-block bg-burnt px-6 py-3.5 font-sans text-[0.95rem] font-medium text-ink"
            >
              {closingCta.primaryCta.label}
            </a>
            <Link
              href={closingCta.secondaryCta.href}
              data-magnet
              className="inline-block border border-ivory/35 px-6 py-3.5 font-sans text-[0.95rem] text-ivory transition-colors hover:border-ivory"
            >
              {closingCta.secondaryCta.label}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
