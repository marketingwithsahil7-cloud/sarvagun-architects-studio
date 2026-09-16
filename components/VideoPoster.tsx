"use client";

import { useState } from "react";
import Image from "next/image";

const SIZE_LABEL_THRESHOLD_MB = 50;
const TWO_STEP_GATE_THRESHOLD_MB = 200;

/**
 * Poster-first, tiered-gate video. Zero video bytes and no <video> element
 * exist until the visitor taps — stricter than preload="none", which is
 * what the mobile-data policy for this page actually calls for. No
 * autoplay, anywhere, on any breakpoint, regardless of file size.
 *
 * Global video rule, three tiers by file size:
 *   <50MB    — plain "Tap to play".
 *   50–200MB — "Tap to play · ~NNMB" so a visitor on mobile data can decide
 *              before committing to the fetch.
 *   200MB+   — two-step gate. First tap only reveals the normal play
 *              control (still no <video> in the DOM); a second, separate
 *              tap is what actually mounts it. Two deliberate taps for
 *              anything this large, not one.
 */
export function VideoPoster({
  src,
  poster,
  alt,
  sizeMB,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  fit = "cover",
  width,
  height,
}: {
  src: string;
  poster: string;
  alt: string;
  sizeMB?: number;
  sizes?: string;
  /** "cover" (default) fills a fixed box — every existing inline usage
   *  (Process, Proof, grid tiles). "contain" sizes naturally from the
   *  poster's own aspect ratio instead, for a lightbox-style centred view
   *  where cropping the frame would be wrong. */
  fit?: "cover" | "contain";
  width?: number;
  height?: number;
}) {
  const needsTwoStepGate = !!sizeMB && sizeMB >= TWO_STEP_GATE_THRESHOLD_MB;
  const [stage, setStage] = useState<"locked" | "ready" | "playing">(
    needsTwoStepGate ? "locked" : "ready",
  );

  const containCls = "mx-auto h-auto max-h-[78vh] w-auto max-w-full object-contain";

  if (stage === "playing") {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        className={fit === "contain" ? containCls : "h-full w-full object-cover"}
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        preload="auto"
      />
    );
  }

  const imageEl =
    fit === "contain" ? (
      <Image src={poster} alt={alt} width={width ?? 1600} height={height ?? 900} className={containCls} />
    ) : (
      <Image src={poster} alt={alt} fill sizes={sizes} className="object-cover" />
    );

  // "cover" needs the button to fill its (fixed-size) parent so the fill
  // Image has a real box; "contain" needs it to shrink-wrap the naturally
  // sized image instead, or the absolutely-positioned overlays below
  // wouldn't line up with the visible frame.
  const buttonCls = fit === "contain" ? "group relative inline-block text-left" : "group relative block h-full w-full text-left";

  if (stage === "locked") {
    return (
      <button
        type="button"
        onClick={() => setStage("ready")}
        className={buttonCls}
        aria-label={`Load video: ${alt} (approximately ${Math.round(sizeMB!)}MB) — nothing is fetched until you tap this`}
      >
        {imageEl}
        <span className="absolute inset-0 bg-ink/45 transition-colors duration-300 group-hover:bg-ink/35" />
        <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 bg-ink/80 px-3 py-2 font-sans text-[0.75rem] text-ivory sm:inset-x-auto sm:left-3 sm:right-auto">
          <span>Load video (≈{Math.round(sizeMB!)}MB)</span>
          <span aria-hidden="true" className="text-burnt">
            →
          </span>
        </span>
      </button>
    );
  }

  const label = sizeMB && sizeMB >= SIZE_LABEL_THRESHOLD_MB ? `Tap to play · ~${Math.round(sizeMB)}MB` : "Tap to play";

  return (
    <button
      type="button"
      onClick={() => setStage("playing")}
      className={buttonCls}
      aria-label={`Play video: ${alt}${sizeMB ? ` (approximately ${Math.round(sizeMB)}MB)` : ""}`}
    >
      {imageEl}
      <span className="absolute inset-0 bg-ink/25 transition-colors duration-300 group-hover:bg-ink/10" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-ivory/60 bg-ink/60 backdrop-blur-[1px] transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110">
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
            <path d="M1 1.2v19.6a1 1 0 0 0 1.53.85l16-9.8a1 1 0 0 0 0-1.7l-16-9.8A1 1 0 0 0 1 1.2Z" fill="#EDE7DA" />
          </svg>
        </span>
      </span>
      <span className="absolute bottom-3 left-3 bg-ink/70 px-2 py-1 font-sans text-[0.68rem] text-ivory">
        {label}
      </span>
    </button>
  );
}
