// A pure marker — no GSAP here. RevealDirector.tsx owns a single
// ScrollTrigger.batch for the whole page and animates every [data-reveal]
// node; that's what lets it cap concurrent blur animations (the expensive
// part) instead of running ~30 independent triggers.
//
// `blur` defaults to false: apply the full focus-pull (opacity + blur) only
// to section-level blocks (headings, media wells) by passing `blur`.
// Anything nested inside an already-revealing parent should stay
// opacity-only — visually identical, meaningfully cheaper. Never place
// data-reveal on an element with `overflow-hidden` ancestors close to its
// edge — that clips the blur halo.
export function Reveal({
  children,
  className = "",
  blur = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  blur?: boolean;
  as?: "div" | "span" | "li";
}) {
  return (
    <Tag data-reveal data-reveal-blur={blur ? "" : undefined} className={className}>
      {children}
    </Tag>
  );
}
