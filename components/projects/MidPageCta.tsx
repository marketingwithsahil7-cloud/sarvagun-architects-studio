import { whatsappHref } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import { midPageCta } from "@/lib/projects-content";

/**
 * A quiet nudge, not a section — sits right after the walkthroughs slider,
 * before the category filter bar begins. No DimensionLine/index, smaller
 * padding than a real section, no bordered panel: visually lighter than
 * ClosingCta by design, so it reads as a moment inside the page's flow
 * rather than a break in it.
 */
export function MidPageCta() {
  return (
    <div className="shell border-t border-[var(--hairline)] py-10">
      <Reveal blur className="flex flex-wrap items-center justify-between gap-6">
        <p className="font-sans text-[1.05rem] text-ivory">{midPageCta.body}</p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-magnet
          className="inline-block bg-burnt px-6 py-3.5 font-sans text-[0.95rem] font-medium text-ink"
        >
          {midPageCta.cta}
        </a>
      </Reveal>
    </div>
  );
}
