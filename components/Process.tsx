"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { MediaFrame } from "./MediaFrame";
import { Tagline } from "./Tagline";
import { process } from "@/lib/content";

export function Process() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        gsap.set(fill.current, { scaleY: 1 });
        gsap.set(list.current!.querySelectorAll("[data-step]"), { autoAlpha: 1 });
        return;
      }

      // The rail fills in lockstep with scroll through the four phases.
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: list.current,
            start: "top 62%",
            end: "bottom 78%",
            scrub: 0.5,
          },
        },
      );

      // Each phase resolves from dim to lit as the fill reaches it.
      list.current!.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
        gsap.fromTo(
          step,
          { autoAlpha: 0.32 },
          {
            autoAlpha: 1,
            duration: 0.4,
            scrollTrigger: { trigger: step, start: "top 62%", toggleActions: "play none none reverse" },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="process"
      className="shell scroll-mt-24 border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]"
    >
      <DimensionLine index={process.index} label={process.label} />

      <Reveal blur>
        <h2 className="font-display mt-14 max-w-[20ch] text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.03] text-ivory">
          {process.heading}
        </h2>
        <Tagline className="mt-4">{process.tagline}</Tagline>
      </Reveal>

      {/*
        The rail + dots used to live in a reserved lane created by padding
        the whole <ol> in from the left (pl-9/pl-12) — which meant every
        step's actual text started 36-48px right of the shared shell gutter
        that every other section's content sits flush against (confirmed via
        a site-wide left-edge audit: everything else lands at the same x,
        Process's rows were the one outlier). Fixed by removing that padding
        entirely — <li> content now starts at the same gutter as everything
        else — and instead hanging the rail/dots in negative space to the
        left of that edge, via a fixed -11px offset. That value is small
        enough to stay inside the shell gutter's narrowest state (20px on a
        360-390px phone) with a few px of clearance on both sides, and just
        sits unused-but-harmless in the wider desktop gutter (up to 72px).
      */}
      <ol ref={list} className="relative mt-16">
        {/* rail + fill — both pinned to the same x as the phase dots */}
        <span
          className="absolute left-[-11px] top-1 h-[calc(100%-0.5rem)] w-px bg-ivory/15"
          aria-hidden="true"
        />
        <span
          ref={fill}
          className="absolute left-[-11px] top-1 h-[calc(100%-0.5rem)] w-px origin-top scale-y-0 bg-burnt"
          aria-hidden="true"
        />

        {process.steps.map((step) => (
          <li
            key={step.no}
            data-step
            className="relative grid gap-x-8 gap-y-2 pb-14 last:pb-0 sm:grid-cols-[7rem_1fr]"
          >
            <span
              className="absolute left-[-11px] top-1.5 h-[11px] w-[11px] -translate-x-1/2 rounded-full border border-burnt bg-ink"
              aria-hidden="true"
            />
            <span className="font-sans text-[0.85rem] tabular-nums text-burnt">
              Phase {step.no}
            </span>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="max-w-[36rem]">
                <h3 className="font-display text-[1.5rem] font-medium leading-tight text-ivory sm:text-[1.75rem]">
                  {step.title}
                </h3>
                <p className="mt-3 font-sans text-[0.98rem] leading-relaxed text-dim">
                  {step.body}
                </p>
              </div>
              <div className="media-well relative aspect-[4/3] w-32 shrink-0 border border-[var(--hairline)] sm:w-40 lg:w-48">
                <MediaFrame media={step.media} sizes="192px" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
