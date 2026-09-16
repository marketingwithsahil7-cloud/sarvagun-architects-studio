import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { MediaFrame } from "./MediaFrame";
import { services, whatsappHref, studio } from "@/lib/content";

function serviceHref(title: string) {
  const text = `Hi Sarvagun Architects Studio — I'd like to discuss ${title}.`;
  return `https://wa.me/${studio.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function Services() {
  return (
    <section
      id="services"
      className="shell scroll-mt-24 border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]"
    >
      <DimensionLine index={services.index} label={services.label} />

      <Reveal blur className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
        <h2 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.03] text-ivory">
          {services.heading}
        </h2>
        <p className="max-w-[34rem] font-sans text-[1rem] leading-relaxed text-dim">
          {services.intro}
        </p>
      </Reveal>

      <Reveal className="mt-16 border-t border-ivory/20">
        <ul>
          {services.sheets.map((sheet) => (
            <li key={sheet.code}>
              <a
                href={serviceHref(sheet.title)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Discuss ${sheet.title} on WhatsApp`}
                className="group grid grid-cols-[3.5rem_1fr_3.5rem] gap-x-4 gap-y-2 border-b border-ivory/20 py-7 transition-colors hover:bg-panel md:grid-cols-[5rem_16rem_1fr_5.5rem] md:gap-x-8 md:py-9"
              >
                <span className="font-sans text-[0.9rem] tabular-nums text-burnt transition-transform duration-300 group-hover:translate-x-1">
                  {sheet.code}
                </span>
                <h3 className="font-display text-[1.6rem] font-medium leading-tight text-ivory md:text-[1.9rem]">
                  {sheet.title}
                </h3>
                <p className="col-start-2 max-w-[38rem] font-sans text-[0.95rem] leading-relaxed text-dim md:col-start-3">
                  {sheet.body}
                </p>
                {/* Small, real — a thumbnail per sheet, not a card. Spans both
                    text rows on mobile so it never forces the row taller. */}
                <div className="col-start-3 row-span-2 self-center justify-self-end md:col-start-4 md:row-span-1">
                  <div className="media-well relative aspect-square h-14 w-14 overflow-hidden border border-[var(--hairline)] transition-opacity duration-300 group-hover:opacity-90 md:h-20 md:w-20">
                    <MediaFrame media={sheet.thumb} sizes="(min-width: 768px) 80px, 56px" />
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-8">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-magnet
          className="inline-block font-sans text-[0.85rem] text-dim underline decoration-[var(--hairline)] underline-offset-4 hover:text-ivory hover:decoration-burnt"
        >
          Not sure which sheet you need? Ask on WhatsApp →
        </a>
      </Reveal>
    </section>
  );
}
