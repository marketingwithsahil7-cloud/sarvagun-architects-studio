/**
 * The compact icon + "SARVAGUN" / "ARCHITECTS STUDIO" lockup — the single
 * component for every place the firm's logo+name appears (nav bar, Footer,
 * the About page intro), by the client's own explicit instruction: it must
 * read identically everywhere. It used to be three separately-tuned
 * treatments (nav, Footer, and a larger About-only one in the now-deleted
 * BrandLockup.tsx) that had already drifted out of sync with each other —
 * this is the fix, not a style to diverge from again.
 */
export function LogoLockup({ size = "nav" }: { size?: "nav" | "footer" }) {
  const isFooter = size === "footer";
  const iconPx = isFooter ? 46 : 42;

  return (
    <span className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo-mark.png"
        alt=""
        width={iconPx}
        height={iconPx}
        className={isFooter ? "h-[46px] w-[46px] object-contain" : "h-[42px] w-[42px] object-contain"}
      />
      {/* Bolder than the site's usual hairline on purpose — this divider is
          part of the logo mark itself, not a section rule, so it reads as a
          deliberate line rather than the faint --hairline token. */}
      <span
        className={isFooter ? "h-9 w-[2px] bg-ivory/45" : "h-8 w-[2px] bg-ivory/45"}
        aria-hidden="true"
      />
      {/* `grid` (not `block`/`flex`) is load-bearing here: with a single
          implicit column, the column's width is set by the wider of the two
          lines' own natural (un-stretched) widths — always "Architects
          Studio", since it has far more characters even at the smaller font
          size — and a grid item's default `justify-self: stretch` then
          fills that exact column width. Combined with text-align-last on
          "Sarvagun" below, this makes its letters spread out to reach that
          same width — reliably, at any font, any zoom, any screen, unlike
          the previous approach (a manually measured letter-spacing value
          hand-tuned once against one specific rendered width) which is
          exactly what drifted out of sync and read as visibly shorter than
          "ARCHITECTS STUDIO" underneath it. */}
      <span className="grid font-sans leading-tight text-ivory">
        <span
          className={
            // text-justify + text-align-last stretch this single line's
            // letters (not words — inter-character, since "Sarvagun" has no
            // word-break to justify against) to fill the grid column's full
            // width, i.e. exactly as wide as "Architects Studio" below.
            // tracking-[0.15em] is only the floor: real letter-spacing is
            // whatever justify computes to reach the far edge, never less.
            (isFooter ? "text-[1rem]" : "text-[0.92rem]") +
            " justify-self-stretch text-justify font-semibold uppercase tracking-[0.15em] [text-align-last:justify] [text-justify:inter-character]"
          }
        >
          Sarvagun
        </span>
        <span
          className={
            isFooter
              ? "mt-0.5 block text-[0.8rem] font-normal uppercase tracking-[0.15em] text-dim"
              : "mt-0.5 block text-[0.76rem] font-normal uppercase tracking-[0.15em] text-dim"
          }
        >
          Architects Studio
        </span>
      </span>
    </span>
  );
}
