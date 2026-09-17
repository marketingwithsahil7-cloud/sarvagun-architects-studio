"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * The compact icon + "SARVAGUN" / "ARCHITECTS STUDIO" lockup — the single
 * component for every place the firm's logo+name appears (nav bar, Footer,
 * the About page intro), by the client's own explicit instruction: it must
 * read identically everywhere. It used to be three separately-tuned
 * treatments (nav, Footer, and a larger About-only one in the now-deleted
 * BrandLockup.tsx) that had already drifted out of sync with each other —
 * this is the fix, not a style to diverge from again.
 *
 * "Sarvagun"'s letter-spacing is stretched via JS measurement (below) to
 * exactly match "Architects Studio"'s rendered width, not CSS
 * `text-align-last: justify` — that property has zero support in
 * Safari/WebKit (desktop and iOS, which covers every iPhone visitor), so it
 * silently no-ops there and "SARVAGUN" reads visibly shorter than
 * "ARCHITECTS STUDIO" on any Apple device, reproducing the exact bug the
 * client originally flagged. getBoundingClientRect-based measurement has no
 * such gap — it's plain layout geometry, identical in every browser.
 */
export function LogoLockup({ size = "nav" }: { size?: "nav" | "footer" }) {
  const isFooter = size === "footer";
  const iconPx = isFooter ? 46 : 42;
  const sarvagunRef = useRef<HTMLSpanElement>(null);
  const studioRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const sarvagunEl = sarvagunRef.current;
    const studioEl = studioRef.current;
    if (!sarvagunEl || !studioEl) return;

    // letter-spacing scales linearly with width, but *how many* gaps it
    // actually spaces (browsers disagree on whether the last character
    // gets a trailing gap or not) isn't assumed here — it's measured with
    // a real probe value, so this is correct regardless of that browser
    // difference. Assuming "one gap per character" undershot the true
    // browsers-add-it-to-(count-1)-gaps behavior by exactly one gap's
    // worth, which is what still read as a small but visible residual
    // misalignment after the previous fix.
    //
    // Clear any previously-applied inline letter-spacing BEFORE reading the
    // computed value — sync() re-runs on every font swap and every resize
    // (mobile address-bar show/hide fires plenty of these), and reading
    // computed style first would pick up last run's already-boosted value,
    // stacking a fresh correction on top of it each time. That compounding
    // was the earlier bug: spacing crept wider on every re-run instead of
    // landing on the same exact value.
    function sync() {
      const el = sarvagunEl!;
      if (!el.textContent) return;
      el.style.letterSpacing = "";
      const baseSpacing = parseFloat(getComputedStyle(el).letterSpacing) || 0;
      const width0 = el.getBoundingClientRect().width;
      const targetWidth = studioEl!.getBoundingClientRect().width;
      if (width0 >= targetWidth) return; // already wide enough — never narrow

      // Probe: apply a known extra amount, read back how much width that
      // actually bought, and use that real slope to solve for the exact
      // spacing needed — rather than assuming it.
      const probePx = 10;
      el.style.letterSpacing = `${baseSpacing + probePx}px`;
      const width1 = el.getBoundingClientRect().width;
      const slope = (width1 - width0) / probePx;
      if (slope <= 0) {
        el.style.letterSpacing = "";
        return;
      }
      const neededExtra = (targetWidth - width0) / slope;
      el.style.letterSpacing = `${baseSpacing + neededExtra}px`;
    }

    sync();
    // Re-measure once web fonts finish swapping in (display: "swap" in
    // app/layout.tsx means the initial measurement above may run against
    // fallback-font metrics) and on any resize/zoom that changes either
    // line's natural width.
    document.fonts?.ready.then(sync).catch(() => {});
    const ro = new ResizeObserver(sync);
    ro.observe(studioEl);
    return () => ro.disconnect();
  }, []);

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
      {/* items-start is load-bearing: flex-col's default align-items is
          stretch, which would force the "Sarvagun" span's box to the
          container's full width (matching "Architects Studio") regardless
          of its own text content — meaning the JS measurement below would
          always read naturalWidth === targetWidth already (box-equal, not
          content-equal) and compute zero extra spacing needed, silently
          no-op'ing the whole fix. items-start makes every child shrink-wrap
          to its own intrinsic content width instead, so getBoundingClientRect
          actually reflects the rendered text's real width. */}
      <span className="flex flex-col items-start font-sans leading-tight text-ivory">
        <span
          ref={sarvagunRef}
          className={
            (isFooter ? "text-[1rem]" : "text-[0.92rem]") +
            " font-semibold uppercase tracking-[0.15em]"
          }
        >
          Sarvagun
        </span>
        <span
          ref={studioRef}
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
