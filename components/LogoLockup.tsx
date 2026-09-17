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
 * "Sarvagun"'s letter-spacing is widened via JS to exactly match "Architects
 * Studio"'s rendered width — client's explicit call: widen the gaps between
 * real glyphs, not stretch the glyphs themselves (a `transform: scaleX()`
 * version was tried and rejected here for reading as visibly warped/cheap).
 * Not CSS `text-align-last: justify` either — that property has zero
 * support in Safari/WebKit (desktop and iOS, which covers every iPhone
 * visitor), so it silently no-ops there and reproduces the original bug.
 *
 * The needed spacing is solved from a real probe measurement (apply a known
 * test value, read back how much width it actually bought) rather than
 * assumed from character count, because browsers differ on whether the
 * *last* character gets a trailing spaced gap or not — assuming one gap per
 * character undershot the true value by exactly one gap's worth.
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

    // The whole reason several earlier passes here measured "exactly equal"
    // yet still *looked* short: letter-spacing adds its gap after EVERY
    // character including the last one, and that final gap is invisible but
    // counted in the element's width. Matching raw widths therefore lines up
    // the boxes, not the letters — "Sarvagun" carries a large trailing gap
    // (its own boosted spacing) while "Architects Studio" carries only its
    // small 0.15em one, so the visible "N" lands short of the visible "O" by
    // the difference between those two gaps (~7px at nav size — exactly the
    // gap that kept getting reported). Range.getBoundingClientRect() does
    // not help: it reports that same trailing-inclusive width.
    //
    // So each line's visible right edge is `width − its own letter-spacing`,
    // and that is what gets matched below.
    function visibleEnd(el: HTMLElement) {
      const spacing = parseFloat(getComputedStyle(el).letterSpacing) || 0;
      return el.getBoundingClientRect().width - spacing;
    }

    // Clear any previously-applied inline letter-spacing BEFORE reading the
    // computed value — sync() re-runs on every font swap and every resize
    // (mobile address-bar show/hide fires plenty of these), and reading
    // computed style first would pick up last run's already-boosted value,
    // stacking a fresh correction on top of it each time instead of landing
    // on the same exact value.
    function sync() {
      const el = sarvagunEl!;
      if (!el.textContent) return;
      el.style.letterSpacing = "";
      const baseSpacing = parseFloat(getComputedStyle(el).letterSpacing) || 0;
      const w0 = el.getBoundingClientRect().width;
      const target = visibleEnd(studioEl!);
      if (w0 - baseSpacing >= target) return; // already wide enough

      // Probe how much width one px of letter-spacing actually buys (i.e.
      // how many gaps this browser spaces) instead of assuming it.
      const probePx = 20;
      el.style.letterSpacing = `${baseSpacing + probePx}px`;
      const w1 = el.getBoundingClientRect().width;
      const slope = (w1 - w0) / probePx;
      el.style.letterSpacing = "";
      if (slope <= 1) return; // can't solve — leave the stylesheet's value

      // width(L)   = w0 + slope*(L − baseSpacing)
      // visible(L) = width(L) − L            (drop the trailing gap)
      // solve visible(L) = target:
      let L = (target - w0 + slope * baseSpacing) / (slope - 1);
      el.style.letterSpacing = `${L}px`;

      // Verify and correct any residual rather than trusting one solve.
      for (let i = 0; i < 3; i++) {
        const residual = target - visibleEnd(el);
        if (Math.abs(residual) < 0.2) break;
        L += residual / (slope - 1);
        el.style.letterSpacing = `${L}px`;
      }
    }

    sync();
    // Re-measure once web fonts finish swapping in (display: "swap" in
    // app/layout.tsx means the initial measurement above may run against
    // fallback-font metrics) and on any resize/zoom that changes either
    // line's natural width.
    document.fonts?.ready.then(sync).catch(() => {});
    const ro = new ResizeObserver(sync);
    ro.observe(studioEl);

    // Belt-and-braces re-checks: `document.fonts.ready` can resolve before
    // the browser has actually finished the visual reflow that follows a
    // font swap (a real, if narrow, timing gap — not every resolution of
    // that promise is guaranteed to line up with the next paint). A plain
    // page view with DevTools closed never gets the incidental resize that
    // opening DevTools causes, so if the very first sync() lands on
    // fallback-font metrics, nothing ever re-triggers a correction and the
    // wrong spacing sits there indefinitely — exactly what read as "still
    // misaligned on a normal view" despite every on-demand re-check (which
    // opening DevTools itself nudges into re-running) coming back exact.
    // These timers are a deliberately unconditional safety net against
    // that class of timing gap, whatever its precise cause on a given
    // device.
    const timers = [100, 400, 1200, 3000].map((ms) => window.setTimeout(sync, ms));

    return () => {
      ro.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
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
