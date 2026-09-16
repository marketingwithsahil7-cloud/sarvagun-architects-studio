import { areas } from "@/lib/content";

/**
 * The service-area chip list — six cities plus a dashed "+ All over India"
 * chip, so the pan-India claim shows up everywhere this renders, not just on
 * Home. Shared by components/ServiceAreas.tsx (Home) and
 * components/ContactSplit.tsx (Contact); a prior version had Home keep its
 * own inline copy of this markup, which is how it drifted out of sync with
 * Contact (missing the beyond-chip there) until this file became the single
 * source both pages render from.
 */
export function AreaChips({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {areas.cities.map((city) => (
        <li key={city.name} className="relative border border-[var(--hairline)] px-5 py-4">
          {/* corner tick — dimension-line motif, not a pill */}
          <span
            className="absolute -left-px -top-px h-2 w-2 border-l border-t border-burnt"
            aria-hidden="true"
          />
          <span className="font-sans text-[1.05rem] font-medium text-ivory">{city.name}</span>
          {city.note && <span className="ml-2 font-sans text-[0.75rem] text-burnt">{city.note}</span>}
        </li>
      ))}
      {/* "And beyond" — deliberately not a seventh city: dashed border, no
          corner tick, muted text. Reads as coverage beyond the grounded
          six-city base, not an equal peer to them. */}
      <li className="border border-dashed border-[var(--hairline)] px-5 py-4">
        <span className="font-sans text-[1.05rem] font-medium text-dim">
          <span className="text-burnt">+</span> {areas.beyondChip}
        </span>
      </li>
    </ul>
  );
}
