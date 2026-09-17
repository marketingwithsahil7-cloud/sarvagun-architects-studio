"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Keep these two numbers in sync with --reveal-blur in app/globals.css
// (3px mobile / 9px desktop) — CSS sets the pre-paint initial state via the
// .mo class, this sets the animated end-to-start values. Reading the CSS var
// per element would mean a forced style read per node; hardcoding once here
// avoids that layout thrash entirely.
const BLUR_MOBILE = 3;
const BLUR_DESKTOP = 9;

/** Cheap device-class heuristic: low-end phones skip blur entirely, opacity only. */
function isLowPowerDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (navigator.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
}

/**
 * The page's signature scroll reveal: elements enter slightly blurred and
 * low-opacity, then sharpen to full clarity — a "focus pull," not a slide-up.
 *
 * Mounted once at the layout level (`SmoothScroll`), so on a client-side
 * <Link> navigation this component itself never remounts — only the page
 * content inside it swaps. The effect is keyed on `usePathname()` (with
 * `revertOnUpdate: true`) so it re-scans for [data-reveal] nodes on every
 * route change, not just once at first load: without this, a soft-navigated
 * page's elements would stay permanently stuck at the CSS pre-reveal state
 * (opacity: 0 via the `.mo` class) since no ScrollTrigger would ever exist to
 * animate them in. `revertOnUpdate: true` makes useGSAP revert the previous
 * run's gsap.context (killing its matchMedia instance and, in turn, its
 * ScrollTrigger.batch triggers via the cleanup functions below) before the
 * callback re-runs, so nothing leaks across navigations.
 */
export function RevealDirector() {
  const pathname = usePathname();

  // Safety net, independent of GSAP entirely: the pre-paint .mo class (set
  // in app/layout.tsx) hides every [data-reveal] element on the promise
  // that the ScrollTrigger batch below will reveal it. That promise can be
  // broken on a real device in ways this component can't detect from
  // inside — the GSAP chunk failing to load on a flaky connection, an
  // in-app browser (Instagram/WhatsApp webview) throwing before this effect
  // runs, or a font-swap reflow shifting an element's trigger position so
  // ScrollTrigger's "top 88%" line never crosses it. Any of those leaves
  // content permanently blurred or fully invisible — exactly the "blank
  // page" reports. Dropping .mo falls back to the same full-opacity CSS
  // path already used for no-JS/reduced-motion visitors, so this is always
  // safe to fire even after GSAP has already revealed everything (GSAP's
  // inline opacity/filter styles win over the class-gated CSS rule by
  // specificity, so already-revealed elements are unaffected).
  useEffect(() => {
    const t = setTimeout(() => {
      document.documentElement.classList.remove("mo");
    }, 4000);
    return () => clearTimeout(t);
  }, [pathname]);

  // Proactive companion to the watchdog above: web fonts swapping in after
  // ScrollTrigger has already computed trigger positions (display: "swap"
  // in app/layout.tsx) shifts layout, which can leave an in-view element's
  // "top 88%" line uncrossed forever. Recomputing once fonts settle fixes
  // that before the 4s watchdog would otherwise have to paper over it.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }, [pathname]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { desktop } = context.conditions as { desktop: boolean };
        const radius = desktop ? BLUR_DESKTOP : BLUR_MOBILE;
        const useBlur = desktop || !isLowPowerDevice();

        const batches = ScrollTrigger.batch("[data-reveal]", {
          start: "top 88%",
          once: true,
          batchMax: 3,
          interval: 0.12,
          onEnter: (els) => {
            const blurEls = useBlur
              ? els.filter((el) => el.hasAttribute("data-reveal-blur"))
              : [];

            // Promote to a composited layer one tick before the first
            // animated frame, so frame 1 isn't a raster spike.
            if (blurEls.length) gsap.set(blurEls, { willChange: "filter, opacity" });

            gsap.to(els, {
              opacity: 1,
              duration: 0.7,
              stagger: 0.09,
              ease: "power2.out",
              overwrite: "auto",
            });

            if (blurEls.length) {
              gsap.fromTo(
                blurEls,
                { filter: `blur(${radius}px)` },
                {
                  filter: "blur(0px)",
                  duration: 0.75,
                  stagger: 0.09,
                  ease: "power3.out",
                  onComplete() {
                    // Drop data-reveal-blur FIRST — the pre-paint CSS rule
                    // (.mo [data-reveal][data-reveal-blur]) targets that
                    // attribute unconditionally, so clearing the inline
                    // filter before removing it would just fall back to the
                    // stylesheet's blur() and re-blur the element forever.
                    // Strip the filter entirely, not blur(0px) — a lingering
                    // filter keeps a composited layer alive and routes text
                    // through the filter raster path indefinitely.
                    const targets = this.targets() as HTMLElement[];
                    targets.forEach((t) => t.removeAttribute("data-reveal-blur"));
                    gsap.set(targets, { clearProps: "filter,willChange" });
                  },
                },
              );
            }
          },
        });

        return () => batches.forEach((b) => b.kill());
      },
    );

    return () => mm.revert();
  }, { dependencies: [pathname], revertOnUpdate: true });

  return null;
}
