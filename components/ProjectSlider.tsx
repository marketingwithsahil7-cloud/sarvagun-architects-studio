"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { MediaFrame } from "./MediaFrame";
import { CornerMarks } from "./CornerMarks";
import { portfolio } from "@/lib/content";

const slides = portfolio.slides;
const total = slides.length;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Portfolio teaser: one full-frame image per slide + description + prev/next
 * + counter. A CSS scroll-snap track is the source of truth on every
 * breakpoint — desktop arrows call scrollTo, mobile swipes natively. No
 * hand-rolled drag logic.
 */
export function ProjectSlider() {
  const [active, setActive] = useState(0);
  // First slide always mounted (it's the `priority`-loaded one); the rest
  // mount their media only once actually near the track's own visible
  // bounds — see the effect below for why this can't be next/image's
  // built-in `loading="lazy"` alone.
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const trackRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  // Read the active slide back from scroll position — no scroll listener,
  // so this does no work on the Lenis-driven frame.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const panels = Array.from(track.children) as HTMLElement[];

    const activeIO = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (!visible) return;
        const idx = panels.indexOf(visible.target as HTMLElement);
        if (idx !== -1) setActive(idx);
      },
      { root: track, threshold: 0.6 },
    );
    panels.forEach((p) => activeIO.observe(p));

    // 2026-09-11 perf fix: measured that the very next slide's large hero
    // image fetches eagerly on load despite having no `priority` — next/image's
    // `loading="lazy"` checks raw viewport distance, not intersection with
    // *this track's own* horizontal clip boundary, so a DOM-adjacent slide
    // sitting just off-screen inside the scroll-snap track still reads as
    // "near enough." Root-scoped to the track itself instead, same fix
    // already used on /projects (components/projects/useInView.ts) for the
    // same underlying reason. Stays mounted once seen — a slide that's been
    // loaded doesn't need to unload.
    const mountIO = new IntersectionObserver(
      (entries) => {
        const newlyVisible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => panels.indexOf(e.target as HTMLElement))
          .filter((idx) => idx !== -1);
        if (!newlyVisible.length) return;
        setMounted((prev) => {
          if (newlyVisible.every((idx) => prev.has(idx))) return prev;
          return new Set([...Array.from(prev), ...newlyVisible]);
        });
      },
      { root: track, threshold: 0 },
    );
    panels.forEach((p) => mountIO.observe(p));

    // Scoped `will-change: scroll-position` — compositor promotion only
    // while the track is actually mid-scroll (a swipe, or an arrow button's
    // smooth scrollTo), never a permanent hint. `scroll-position`, not
    // `transform`: this track animates via native scroll-snap, not a CSS
    // transform, so that's the correct hint for what's actually changing.
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      track.style.willChange = "scroll-position";
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        track.style.willChange = "auto";
      }, 200);
    };
    track.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      activeIO.disconnect();
      mountIO.disconnect();
      track.removeEventListener("scroll", onScroll);
      clearTimeout(clearTimer);
    };
  }, []);

  const goTo = (n: number) => {
    const track = trackRef.current;
    if (!track) return;
    const wrapped = (n + total) % total;
    const el = track.children[wrapped] as HTMLElement | undefined;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: el.offsetLeft, behavior: reduced ? "auto" : "smooth" });
    setActive(wrapped);
    if (liveRef.current) liveRef.current.textContent = `${slides[wrapped].title}, ${wrapped + 1} of ${total}`;
  };

  return (
    <section id="work" className="shell scroll-mt-24 border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <DimensionLine index={portfolio.index} label={portfolio.label} />

      <Reveal blur className="mt-14">
        <h2 className="font-display max-w-[22ch] text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.03] text-ivory">
          {portfolio.heading}
        </h2>
      </Reveal>

      <div className="relative mt-10">
        <div
          ref={trackRef}
          data-lenis-prevent
          role="group"
          aria-roledescription="carousel"
          aria-label="Selected projects"
          tabIndex={0}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth outline-none focus-visible:ring-2 focus-visible:ring-burnt"
          style={{ touchAction: "pan-x" }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              className="w-full flex-none snap-center"
            >
              <div className="media-well relative aspect-[4/3] w-full border border-[var(--hairline)] sm:aspect-[16/9]">
                {mounted.has(i) && (
                  <MediaFrame
                    media={slide.hero}
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    priority={i === 0}
                    cursorLabel
                  />
                )}
                <CornerMarks />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop arrows */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between lg:flex">
          <button
            type="button"
            data-magnet
            onClick={() => goTo(active - 1)}
            aria-label="Previous project"
            className="pointer-events-auto -translate-x-5 grid h-12 w-12 place-items-center border border-ivory/30 bg-ink/70 text-ivory transition-colors hover:border-burnt"
          >
            <ArrowIcon flip />
          </button>
          <button
            type="button"
            data-magnet
            onClick={() => goTo(active + 1)}
            aria-label="Next project"
            className="pointer-events-auto translate-x-5 grid h-12 w-12 place-items-center border border-ivory/30 bg-ink/70 text-ivory transition-colors hover:border-burnt"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>

      {/* Counter + mobile arrows */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="font-sans text-[0.85rem] tabular-nums text-dim">
          <span className="text-burnt">{pad(active + 1)}</span> / {pad(total)}
        </p>
        <div className="flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous project"
            className="grid h-10 w-10 place-items-center border border-ivory/30 text-ivory active:scale-95"
          >
            <ArrowIcon flip />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next project"
            className="grid h-10 w-10 place-items-center border border-ivory/30 text-ivory active:scale-95"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>

      {/* Zero-CLS description: every slide's copy stacked in one grid cell,
          so the box sizes to the tallest and never changes as `active` moves. */}
      <div className="mt-6 grid max-w-[42rem]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="col-start-1 row-start-1 transition-opacity duration-300"
            style={{ opacity: i === active ? 1 : 0, visibility: i === active ? "visible" : "hidden" }}
            aria-hidden={i !== active}
          >
            <h3 className="font-display text-[1.4rem] font-medium text-ivory">{slide.title}</h3>
            <p className="mt-2 font-sans text-[0.95rem] leading-relaxed text-dim">{slide.description}</p>
          </div>
        ))}
      </div>
      <p ref={liveRef} className="sr-only" aria-live="polite" />

      <Reveal className="mt-10">
        <Link
          href={portfolio.viewAllHref}
          className="inline-flex items-center gap-2 font-sans text-[0.9rem] text-ivory underline decoration-[var(--hairline)] underline-offset-4 hover:decoration-burnt"
        >
          {portfolio.viewAllLabel}
          <ArrowIcon />
        </Link>
      </Reveal>
    </section>
  );
}

function ArrowIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      aria-hidden="true"
      style={{ transform: flip ? "rotate(180deg)" : undefined }}
    >
      <path d="M0 6h14.5M9.5 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
