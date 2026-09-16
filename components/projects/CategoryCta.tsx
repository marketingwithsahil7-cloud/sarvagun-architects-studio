import { studio } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import { categoryLabels, type CategoryId } from "@/lib/projects-content";

function categoryWhatsAppHref(categoryLabel: string) {
  const text = `Hi, I would love to discuss ${categoryLabel}.`;
  return `https://wa.me/${studio.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Sits directly below the filtered grid, naming whichever category is
 * currently active — `category` is ProjectsGallery's own filter state
 * passed straight through as a prop, so switching the filter re-renders
 * this with the new label/link immediately, no reload. A second, more
 * specific conversion moment than the general nudge after Featured
 * Walkthroughs above (MidPageCta) and the page's own closing band below
 * (ClosingCta) — styled as the site's established ivory-outline secondary
 * button (Hero/ClosingCta's own secondary CTA), not either of those two
 * solid-burnt treatments, so it doesn't read as a copy of either.
 */
export function CategoryCta({ category }: { category: CategoryId }) {
  const label = categoryLabels[category];
  return (
    <Reveal className="mt-12 flex flex-wrap items-center gap-4 border-t border-[var(--hairline)] pt-8">
      <p className="font-sans text-[0.88rem] text-dim">
        Interested in <span className="text-ivory">{label}</span>?
      </p>
      <a
        href={categoryWhatsAppHref(label)}
        target="_blank"
        rel="noopener noreferrer"
        data-magnet
        className="inline-block border border-ivory/35 px-5 py-2.5 font-sans text-[0.85rem] text-ivory transition-colors hover:border-ivory"
      >
        Ask on WhatsApp
      </a>
    </Reveal>
  );
}
