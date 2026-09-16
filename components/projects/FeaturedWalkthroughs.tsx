"use client";

import { useEffect, useRef, useState } from "react";
import { DimensionLine } from "@/components/DimensionLine";
import { Reveal } from "@/components/Reveal";
import { VideoPoster } from "@/components/VideoPoster";
import { CornerMarks } from "@/components/CornerMarks";
import { featuredWalkthroughs, featuredMeta } from "@/lib/projects-content";

const total = featuredWalkthroughs.length;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The page's centrepiece, by the client's own explicit priority: walkthrough
 * videos convert best, so this sits above the category filter, not inside
 * it — large-format, cinematic (21:9 on desktop), one big card per view.
 * Same scroll-snap-track architecture as components/ProjectSlider.tsx (the
 * Home portfolio teaser): real scroll container, IntersectionObserver index
 * tracking, data-lenis-prevent, arrows that call scrollTo. Cards play
 * in place via the same tiered VideoPoster gate as everywhere else on the
 * site — tapping never autoplays or preloads, regardless of how prominent
 * this section is.
 */
export function FeaturedWalkthroughs() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const panels = Array.from(track.children) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (!visible) return;
        const idx = panels.indexOf(visible.target as HTMLElement);
        if (idx !== -1) setActive(idx);
      },
      { root: track, threshold: 0.6 },
    );
    panels.forEach((p) => io.observe(p));
    return () => io.disconnect();
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
    if (liveRef.current) liveRef.current.textContent = `Walkthrough ${wrapped + 1} of ${total}`;
  };

  return (
    <section className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <DimensionLine index={featuredMeta.index} label={featuredMeta.label} />

      <Reveal blur className="mt-10 max-w-[38rem]">
        <h2 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.03] text-ivory">
          {featuredMeta.heading}
        </h2>
        <p className="mt-4 font-sans text-[1rem] leading-relaxed text-dim">{featuredMeta.body}</p>
      </Reveal>

      <div className="relative mt-10">
        <div
          ref={trackRef}
          data-lenis-prevent
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured walkthroughs"
          tabIndex={0}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth outline-none focus-visible:ring-2 focus-visible:ring-burnt"
          style={{ touchAction: "pan-x" }}
        >
          {featuredWalkthroughs.map((item, i) => (
            <div
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              className="w-full flex-none snap-center px-1 first:pl-0 last:pr-0"
            >
              <div className="media-well relative aspect-video w-full border border-[var(--hairline)] lg:aspect-[21/9]">
                <VideoPoster src={item.src} poster={item.poster} alt={item.alt} sizeMB={item.sizeMB} sizes="90vw" />
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
            aria-label="Previous walkthrough"
            className="pointer-events-auto -translate-x-5 grid h-12 w-12 place-items-center border border-ivory/30 bg-ink/70 text-ivory transition-colors hover:border-burnt"
          >
            <ArrowIcon flip />
          </button>
          <button
            type="button"
            data-magnet
            onClick={() => goTo(active + 1)}
            aria-label="Next walkthrough"
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
            aria-label="Previous walkthrough"
            className="grid h-10 w-10 place-items-center border border-ivory/30 text-ivory active:scale-95"
          >
            <ArrowIcon flip />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next walkthrough"
            className="grid h-10 w-10 place-items-center border border-ivory/30 text-ivory active:scale-95"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
      <p ref={liveRef} className="sr-only" aria-live="polite" />
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
