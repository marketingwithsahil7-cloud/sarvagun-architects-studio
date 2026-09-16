"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { MediaFrame } from "./MediaFrame";
import { CornerMarks } from "./CornerMarks";
import { proof, type ProofBlock as ProofBlockData } from "@/lib/content";

/**
 * One or more sequential render-vs-built comparisons — each its own
 * headline, its own two-panel proof, its own optional walkthrough. One
 * section-level DimensionLine up top; each block after the first gets a
 * hairline divider instead of repeating the dimension-line device, so N
 * comparisons read as one continuous section, not N stacked mini-sections.
 */
export function Proof() {
  return (
    <section
      id="proof"
      className="shell scroll-mt-24 border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]"
    >
      <DimensionLine index={proof.index} label={proof.label} />

      <div className="mt-14 flex flex-col gap-20 lg:gap-28">
        {proof.blocks.map((block, i) => (
          <ProofBlockRow key={block.heading} block={block} first={i === 0} />
        ))}
      </div>
    </section>
  );
}

function ProofBlockRow({ block, first }: { block: ProofBlockData; first: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // BOLD MOMENT 2 — the comparison panel sits back in 3D space and
      // rotates flat as it scrolls to centre, like a drawing being laid on
      // a table. Desktop only: preserve-3d on a rotated layer falls back to
      // software rasterization on some mobile GPU drivers, and this is a
      // deliberately "bold" desktop moment, not a baseline one. Each block
      // gets its own independent trigger, scoped to its own stage/frame.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          frame.current,
          { rotateX: 12, y: 40, transformPerspective: 1100 },
          {
            rotateX: 0,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: stage.current,
              start: "top 85%",
              end: "top 35%",
              scrub: 0.6,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={first ? "" : "border-t border-[var(--hairline)] pt-20 lg:pt-28"}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <Reveal blur className="lg:pt-4">
          <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.06] text-ivory">
            {block.heading}
          </h2>
          {block.body.map((p) => (
            <p key={p.slice(0, 24)} className="mt-5 max-w-[32rem] font-sans text-[1rem] leading-relaxed text-dim">
              {p}
            </p>
          ))}
        </Reveal>

        <div ref={stage} style={{ perspective: "1100px" }}>
          <div ref={frame} className="grid grid-cols-2 gap-3" style={{ transformStyle: "preserve-3d" }}>
            <Reveal blur className="relative aspect-[3/4]">
              <div className="media-well relative h-full w-full border border-[var(--hairline)]">
                <MediaFrame media={block.render} sizes="(min-width: 1024px) 28vw, 45vw" />
                <CornerMarks />
                <span className="pointer-events-none absolute left-3 top-3 z-20 bg-ink/70 px-2 py-1 font-sans text-[0.68rem] text-ivory">
                  {block.renderLabel}
                </span>
              </div>
            </Reveal>

            <Reveal blur className="relative aspect-[3/4]">
              <div className="media-well relative h-full w-full border border-[var(--hairline)]">
                <MediaFrame media={block.built} sizes="(min-width: 1024px) 28vw, 45vw" />
                <CornerMarks />
                <span className="pointer-events-none absolute left-3 top-3 z-20 bg-ink/70 px-2 py-1 font-sans text-[0.68rem] text-ivory">
                  {block.builtLabel}
                </span>
              </div>
            </Reveal>
          </div>

          {block.walkthrough && (
            <Reveal className="mt-6 border-t border-[var(--hairline)] pt-6">
              <p className="max-w-[34rem] font-sans text-[0.9rem] leading-relaxed text-dim">
                {block.walkthroughCaption}
              </p>
              <div
                className={
                  block.walkthroughOrientation === "portrait"
                    ? "media-well relative mt-4 aspect-[9/16] w-full max-w-[18rem] border border-[var(--hairline)]"
                    : "media-well relative mt-4 aspect-video w-full max-w-md border border-[var(--hairline)]"
                }
              >
                <MediaFrame media={block.walkthrough} sizes="(min-width: 1024px) 28vw, 90vw" />
              </div>
              <p className="mt-2 font-sans text-[0.75rem] text-dim">{block.walkthroughCta}</p>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
