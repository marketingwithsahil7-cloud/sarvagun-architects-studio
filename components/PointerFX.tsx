"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Keep this in sync with the (hover:hover) and (pointer:fine) query used for
// the [data-cursor="view"] cursor:none rule and the lg:hidden corner-tag
// fallback in app/globals.css / consuming components.
const FINE_POINTER = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

/**
 * Desktop-only pointer affordances: a soft cursor-tracking glow, a "View"
 * label over project media, and a magnetic pull on CTA buttons.
 *
 * Gated at the component level, not just CSS — on mobile this renders null,
 * so no listener is ever attached and no node ever exists. The gate re-syncs
 * on media-query change (e.g. rotating a foldable, plugging in a mouse), but
 * the steady state on a phone is: one matchMedia object, nothing else.
 */
export function PointerFX() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pointerMq = matchMedia(FINE_POINTER);
    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(pointerMq.matches && !motionMq.matches);
    sync();
    pointerMq.addEventListener("change", sync);
    motionMq.addEventListener("change", sync);
    return () => {
      pointerMq.removeEventListener("change", sync);
      motionMq.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;
  return <PointerFXLive />;
}

function PointerFXLive() {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const gx = gsap.quickTo(glow.current, "x", { duration: 0.55, ease: "power3" });
      const gy = gsap.quickTo(glow.current, "y", { duration: 0.55, ease: "power3" });
      const lx = gsap.quickTo(label.current, "x", { duration: 0.18, ease: "power3" });
      const ly = gsap.quickTo(label.current, "y", { duration: 0.18, ease: "power3" });

      gsap.set([glow.current, label.current], {
        x: innerWidth / 2,
        y: innerHeight / 2,
      });

      const onMove = (e: PointerEvent) => {
        gx(e.clientX);
        gy(e.clientY);
        lx(e.clientX);
        ly(e.clientY);
      };
      addEventListener("pointermove", onMove, { passive: true });

      // "View" label — one delegated listener, no per-card wiring.
      const onOver = (e: PointerEvent) => {
        const hit = (e.target as HTMLElement).closest?.('[data-cursor="view"]');
        gsap.to(label.current, {
          autoAlpha: hit ? 1 : 0,
          scale: hit ? 1 : 0.6,
          duration: 0.25,
          ease: "power2.out",
          overwrite: true,
        });
      };
      addEventListener("pointerover", onOver, { passive: true });

      // Magnetic buttons — a scoped pointermove attached only while hovered,
      // so there's no per-frame iteration over every magnet on the page.
      const onMagnetEnter = (e: PointerEvent) => {
        const el = (e.target as HTMLElement).closest?.("[data-magnet]") as HTMLElement | null;
        if (!el || el.dataset.magnetOn) return;
        el.dataset.magnetOn = "1";

        const mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
        const my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

        const pull = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          mx(gsap.utils.clamp(-10, 10, (ev.clientX - (r.left + r.width / 2)) * 0.28));
          my(gsap.utils.clamp(-8, 8, (ev.clientY - (r.top + r.height / 2)) * 0.28));
        };
        const leave = () => {
          el.removeEventListener("pointermove", pull);
          el.removeEventListener("pointerleave", leave);
          delete el.dataset.magnetOn;
          gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.45)" });
        };
        el.addEventListener("pointermove", pull, { passive: true });
        el.addEventListener("pointerleave", leave, { passive: true });
      };
      addEventListener("pointerover", onMagnetEnter, { passive: true });

      return () => {
        removeEventListener("pointermove", onMove);
        removeEventListener("pointerover", onOver);
        removeEventListener("pointerover", onMagnetEnter);
      };
    },
    { scope: root },
  );

  // Portalled to document.body — non-negotiable. The reveal system can put
  // `filter` on section-level ancestors, and a filtered ancestor silently
  // turns position:fixed descendants into position:absolute ones. Same rule
  // is why <Header> must never sit inside a filtered subtree.
  return createPortal(
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={glow}
        className="absolute -left-[240px] -top-[240px] h-[480px] w-[480px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(226,103,43,.16) 0%, rgba(226,103,43,.06) 38%, transparent 68%)",
        }}
      />
      <div
        ref={label}
        className="absolute -left-7 -top-7 grid h-14 w-14 place-items-center rounded-full bg-burnt font-sans text-[0.72rem] font-medium text-ink opacity-0 will-change-transform"
      >
        View
      </div>
    </div>,
    document.body,
  );
}
