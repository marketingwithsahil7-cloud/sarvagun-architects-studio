"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { hero, whatsappHref, testimonials } from "@/lib/content";
import { CornerMarks } from "./CornerMarks";

// Auto-advance timing for the category carousel — slow enough to read each
// photo, not so slow it reads as static.
const SLIDE_INTERVAL_MS = 4000;
const CROSSFADE_MS = 1000;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const slides = hero.slides;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    // prefers-reduced-motion: pause auto-advance, stay on the first slide.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // BOLD MOMENT 1 — the facade drifts slower than the page as you
      // scroll away from the hero, giving it real depth. The wrapper div is
      // the transform target, never next/image's own <img> — that keeps
      // Next's generated markup/sizes untouched and guarantees the image is
      // never re-rastered by the transform, only composited.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(media.current, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(copy.current, {
          yPercent: -10,
          autoAlpha: 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.from(copy.current, {
          autoAlpha: 0,
          y: 18,
          duration: 1.1,
          ease: "power2.out",
          delay: 0.15,
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-panel"
    >
      <div ref={media} className="absolute inset-0 -top-[10%] h-[120%] will-change-transform">
        {slides.map((slide, i) => (
          <div
            key={slide.category}
            className="absolute inset-0"
            style={{
              opacity: i === activeSlide ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms var(--ui-ease)`,
            }}
            aria-hidden={i !== activeSlide}
          >
            {/* Only the first slide is priority-loaded, matching the
                previous single-image hero's LCP behaviour. The rest sit in
                the same on-screen box from first paint, so the browser's
                native lazy loading still fetches them in the background
                without a preload link competing for bandwidth. */}
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              quality={78}
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* functional legibility scrim — flat base + a soft floor, not decoration */}
      <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent"
        aria-hidden="true"
      />

      <CornerMarks inset={20} />

      <div className="shell relative flex h-full flex-col justify-end pb-[clamp(2.5rem,7vh,5rem)] pt-24">
        <div ref={copy} className="max-w-[54rem]">
          <p className="font-sans text-[0.85rem] text-dim">{hero.kicker}</p>
          <h1 className="font-display mt-5 text-[clamp(2.6rem,7.2vw,5.6rem)] font-medium leading-[1.02] text-ivory">
            {hero.headline[0]}
            <br />
            <span className="text-dim">{hero.headline[1]}</span>
          </h1>
          <p className="mt-7 max-w-[40rem] font-sans text-[1.05rem] leading-relaxed text-dim">
            {hero.standfirst}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-magnet
              className="inline-block bg-burnt px-6 py-3.5 font-sans text-[0.95rem] font-medium text-ink"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              data-magnet
              className="inline-block border border-ivory/35 px-6 py-3.5 font-sans text-[0.95rem] text-ivory transition-colors hover:border-ivory"
            >
              {hero.secondaryCta.label}
            </a>
          </div>

          <p className="mt-4 font-sans text-[0.82rem] text-dim">
            {testimonials.rating} ★ · {testimonials.reviewCount} Google reviews
          </p>
        </div>
      </div>

      {/* Small, restrained category label for the current carousel slide —
          mirrors the "scroll" hint's line+text treatment on the opposite
          corner, matching the site's dimension-line/corner-mark language
          rather than a bold banner. */}
      <div className="absolute bottom-5 left-[clamp(1.25rem,5vw,4.5rem)] z-20 flex items-center gap-2">
        <span className="h-px w-6 bg-dim/50" aria-hidden="true" />
        <span className="font-sans text-[0.7rem] text-dim">{slides[activeSlide].category}</span>
      </div>

      <div
        className="absolute bottom-5 right-[clamp(1.25rem,5vw,4.5rem)] hidden items-center gap-2 md:flex"
        aria-hidden="true"
      >
        <span className="font-sans text-[0.7rem] text-dim">scroll</span>
        <span className="h-px w-10 bg-dim/50" />
      </div>

      {/* Marks the hero's real bottom edge for Header.tsx's IntersectionObserver —
          lets the header know exactly when it's safe to go solid, adapting
          automatically to however tall the hero actually renders at each
          breakpoint instead of a guessed scroll-pixel threshold. */}
      <div id="hero-sentinel" className="absolute inset-x-0 bottom-0 h-px" aria-hidden="true" />
    </section>
  );
}
