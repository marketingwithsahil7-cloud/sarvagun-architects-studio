"use client";

import { useEffect, useRef, useState } from "react";
import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { Tagline } from "./Tagline";
import { aboutStats } from "@/lib/about-content";

const DURATION_MS = 1400;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Counts a value like "7" or "5.0" up from 0, preserving its original decimal precision. */
function formatCounted(raw: string, progress: number) {
  const target = parseFloat(raw);
  if (Number.isNaN(target)) return raw;
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return (target * progress).toFixed(decimals);
}

/**
 * Counts every stat up together, once, the first time the block scrolls into
 * view — a single IntersectionObserver + rAF loop for the whole section
 * (not one per number), matching the site's other one-off scroll triggers
 * (e.g. components/projects/useInView.ts) rather than adding load to
 * RevealDirector's shared GSAP batch, which only owns opacity/blur.
 */
function useCountUpProgress() {
  const containerRef = useRef<HTMLUListElement>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || started) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setProgress(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  return { containerRef, progress };
}

/**
 * Three real, derivable numbers — no invented statistics. Each value reads
 * directly off data already established elsewhere (see lib/about-content.ts
 * for exactly where every figure comes from). Typographic numerals only, no
 * icon-in-circle blocks.
 */
export function AboutStats() {
  const { containerRef, progress } = useCountUpProgress();

  return (
    <section className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <DimensionLine index={aboutStats.index} label={aboutStats.label} />

      <Reveal blur className="mt-10 max-w-[34rem]">
        <h2 className="font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.08] text-ivory">
          {aboutStats.heading}
        </h2>
        <Tagline className="mt-4">{aboutStats.tagline}</Tagline>
      </Reveal>

      <ul
        ref={containerRef}
        className="mt-12 grid divide-y divide-[var(--hairline)] border border-[var(--hairline)] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {aboutStats.items.map((item) => (
          <Reveal key={item.label} as="li" className="px-7 py-9">
            <span className="font-display block tabular-nums text-[clamp(2.6rem,6vw,3.6rem)] font-medium leading-none text-burnt">
              {formatCounted(item.value, progress)}
            </span>
            <span className="mt-3 block font-sans text-[0.92rem] leading-snug text-dim">{item.label}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
