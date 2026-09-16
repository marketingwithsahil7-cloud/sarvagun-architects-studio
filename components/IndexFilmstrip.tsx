"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { DimensionLine } from "./DimensionLine";
import { ProjectLightbox } from "./projects/ProjectLightbox";
import { filmstrip, filmstripMeta } from "@/lib/content";

// How far a pointer has to travel between down and up before a tap is
// treated as a drag instead — without this, every drag-to-browse gesture
// would also fire a click on whatever thumbnail happened to be under the
// pointer when it lifted, and open the lightbox unintentionally.
const DRAG_THRESHOLD_PX = 6;

// Doubled so the wrap-around is invisible — once the real animated position
// passes the width of one full set, it jumps back by exactly that width.
const LOOPED = [...filmstrip, ...filmstrip];

/**
 * "Index of work" — a continuously auto-scrolling row of thumbnails sampled
 * across the real project archive. Texture/volume, not a gallery: no
 * captions, no links, aria-hidden. Pauses on hover/touch and can be dragged
 * to browse manually — see the perf-fix note below for why "manual drag"
 * is now a small custom pointer handler instead of native overflow-scroll.
 *
 * 2026-09-11 perf fix: this used to drive itself with `track.scrollLeft +=`
 * inside its own `requestAnimationFrame` loop — a second rAF loop completely
 * untied from `gsap.ticker` (the one thing every other animation on the site
 * rides, per SmoothScroll.tsx), and `scrollLeft` is a scroll-mechanism write,
 * not a compositor-only one — measured ~40x slower per write than an
 * equivalent `transform` write, and each one can force a synchronous layout
 * read for anything else that needs fresh geometry in the same frame (like
 * Lenis's own ScrollTrigger.update() during vertical scroll). Confirmed via
 * direct instrumentation that the old loop ran continuously and
 * independently regardless of what else was happening on the page — exactly
 * the frame-budget contention that made this stutter during vertical scroll.
 *
 * Now animates a single `x` value onto `transform: translate3d()`, driven by
 * `gsap.ticker`. Dragging updates that SAME `x` (a small pointer handler,
 * not native scroll) rather than mixing `scrollLeft` and `transform` as two
 * independent coordinate systems — that combination would desync the moment
 * a visitor dragged and let go (auto-scroll would snap back to wherever the
 * transform was before the drag, ignoring the manual scroll position).
 */
export function IndexFilmstrip() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let setWidth = 0;
    const measure = () => {
      setWidth = track.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let x = 0;
    let paused = false;
    let dragging = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    const SPEED = 27; // px/second — same ambient pace as the old 0.45px/frame @ ~60fps

    const apply = () => {
      if (setWidth === 0) return;
      x = ((x % setWidth) + setWidth) % setWidth; // wrap both directions
      track.style.transform = `translate3d(${-x}px,0,0)`;
    };

    const tick = (_time: number, deltaMs: number) => {
      if (paused || dragging || setWidth === 0) return;
      x += SPEED * (deltaMs / 1000);
      apply();
    };
    gsap.ticker.add(tick);

    // Compositor promotion only while actually animating or being dragged —
    // never a permanent/global hint, so it costs nothing the rest of the time.
    const setActive = (active: boolean) => {
      track.style.willChange = active ? "transform" : "auto";
    };
    setActive(true);

    const pause = () => {
      paused = true;
      setActive(false);
      clearTimeout(resumeTimer);
    };
    const scheduleResume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        setActive(true);
      }, 1200);
    };

    // Manual drag-to-browse — replaces native overflow-scroll, updating the
    // same `x` the auto-scroll animates, so there's exactly one source of
    // truth for position.
    let dragStartX = 0;
    let xAtDragStart = 0;
    let capturedPointerId: number | null = null;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      draggedRef.current = false;
      setActive(true);
      pause();
      dragStartX = e.clientX;
      xAtDragStart = x;
      // Pointer capture is deliberately NOT grabbed here. Capturing on every
      // pointerdown (even a plain tap) retargets the subsequent synthetic
      // `click` event to `wrap` itself instead of the thumbnail <button>
      // underneath — silently breaking every click on the filmstrip while
      // leaving the onClick handler itself untouched (it fires fine when
      // invoked directly, which is what made this easy to miss). Capture is
      // grabbed lazily in onPointerMove, only once a gesture actually proves
      // to be a drag past DRAG_THRESHOLD_PX, so a tap's click reaches the
      // button normally and only a real drag gets the capture it needs to
      // keep tracking the pointer outside `wrap`'s bounds.
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const delta = e.clientX - dragStartX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
        if (!draggedRef.current) {
          capturedPointerId = e.pointerId;
          wrap.setPointerCapture(e.pointerId);
        }
        draggedRef.current = true;
      }
      x = xAtDragStart - delta;
      apply();
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (capturedPointerId !== null) {
        if (wrap.hasPointerCapture(capturedPointerId)) {
          wrap.releasePointerCapture(capturedPointerId);
        }
        capturedPointerId = null;
      }
      scheduleResume();
    };

    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
    wrap.addEventListener("pointerenter", pause);
    wrap.addEventListener("pointerleave", () => {
      if (!dragging) scheduleResume();
    });

    return () => {
      gsap.ticker.remove(tick);
      clearTimeout(resumeTimer);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", endDrag);
      wrap.removeEventListener("pointercancel", endDrag);
      wrap.removeEventListener("pointerenter", pause);
      wrap.removeEventListener("pointerleave", scheduleResume);
    };
  }, []);

  return (
    <section className="border-t border-[var(--hairline)] py-10 sm:py-12">
      <div className="shell">
        <DimensionLine index={filmstripMeta.index} label={filmstripMeta.label} />
      </div>

      <div
        ref={wrapRef}
        data-lenis-prevent
        className="no-scrollbar mt-6 overflow-hidden px-[clamp(1.25rem,5vw,4.5rem)] [cursor:grab] active:[cursor:grabbing]"
        style={{ touchAction: "pan-y" }}
      >
        <div ref={trackRef} className="flex w-max gap-2">
          {LOOPED.map((media, i) => {
            if (media.kind !== "image") return null;
            // The array is doubled for the seamless auto-scroll wrap (see
            // the module comment above) — both copies stay clickable
            // (whichever one is physically on screen when a visitor taps),
            // but only the first, non-duplicate copy is reachable by
            // keyboard/AT, so tabbing through doesn't hit the same 31
            // images twice.
            const isDuplicate = i >= filmstrip.length;
            return (
              <button
                key={i}
                type="button"
                tabIndex={isDuplicate ? -1 : undefined}
                aria-hidden={isDuplicate ? "true" : undefined}
                onClick={() => {
                  if (draggedRef.current) return;
                  setLightboxIndex(i % filmstrip.length);
                }}
                aria-label={`Open photo — ${media.alt}`}
                className="group media-well relative h-20 w-20 shrink-0 overflow-hidden sm:h-24 sm:w-24 lg:h-28 lg:w-28"
              >
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  sizes="112px"
                  className="pointer-events-none object-cover"
                  loading="lazy"
                  draggable={false}
                />
                {/* burnt hairline draw-in — same hover tell as the /projects
                    grid and the Home portfolio slider, so this reads as the
                    same kind of clickable media, not a new affordance. */}
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-burnt transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      {lightboxIndex !== null && (
        <ProjectLightbox
          items={filmstrip}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </section>
  );
}
