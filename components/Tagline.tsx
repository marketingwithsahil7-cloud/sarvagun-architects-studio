/**
 * A short, decorative brand line — meant to be read, not skimmed past.
 * Client's explicit correction: the first pass used fine-print sizing
 * (text-dim, ~0.85rem) and it read as invisible boilerplate, not a line
 * people would actually stop on. This is the fix: set in the display
 * serif (the same face as every h2 on the site, just smaller and lighter),
 * in the burnt accent color used everywhere else for "look here" — the
 * index numerals, the active nav underline, CTA buttons — so it reads as a
 * deliberate pull-line under a heading, not a caption.
 */
export function Tagline({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-display text-[1.3rem] font-medium leading-snug text-burnt sm:text-[1.5rem] ${className}`}
    >
      {children}
    </p>
  );
}
