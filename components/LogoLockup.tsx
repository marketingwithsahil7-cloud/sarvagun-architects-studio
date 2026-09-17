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
 * "Sarvagun" is stretched to exactly match "Architects Studio"'s rendered
 * width via a CSS `transform: scaleX()`, not letter-spacing. Letter-spacing
 * requires knowing exactly how many character gaps a browser actually
 * spaces (trailing gap after the last letter or not — this varies and
 * previous attempts here to measure it, both by formula and by probing,
 * still left a small but real visual gap). scaleX sidesteps that entirely:
 * `getBoundingClientRect().width` after `scaleX(k)` is defined to be
 * exactly `naturalWidth * k`, in every browser, unconditionally — there is
 * no equivalent ambiguity to get wrong. Not CSS `text-align-last: justify`
 * either — that property has zero support in Safari/WebKit (desktop and
 * iOS, which covers every iPhone visitor), so it silently no-ops there.
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

    // Reset any previously-applied scale BEFORE measuring — sync() re-runs
    // on every font swap and every resize (mobile address-bar show/hide
    // fires plenty of these), and measuring against an already-scaled
    // element would compound the correction on every re-run instead of
    // landing on the same exact value each time (the actual bug behind two
    // earlier, letter-spacing-based attempts at this fix).
    function sync() {
      const el = sarvagunEl!;
      el.style.transform = "";
      const natural = el.getBoundingClientRect().width;
      const target = studioEl!.getBoundingClientRect().width;
      if (natural <= 0 || natural >= target) return; // never shrink
      el.style.transformOrigin = "left center";
      el.style.transform = `scaleX(${target / natural})`;
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
