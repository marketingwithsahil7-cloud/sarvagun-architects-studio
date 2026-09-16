"use client";

import Image from "next/image";
import type { ProjectMedia } from "@/lib/projects-content";
import { useInView } from "./useInView";

/**
 * One masonry tile. Always static (photo, or a video's poster frame) —
 * clicking any tile opens the lightbox at that item; the tiered play-gate
 * only ever applies inside the lightbox, never in the grid itself.
 *
 * Lazy-loaded via IntersectionObserver (useInView), not next/image's
 * loading="lazy" alone — at 40+ tiles in one category, the browser's own
 * lazy-load heuristic still fires well ahead of scroll; nothing renders an
 * <Image> (so nothing fetches) until the tile is actually near the
 * viewport. The aspect-ratio box is set from the source's real dimensions
 * either way, so there's no layout shift whether the tile has loaded yet.
 */
export function ProjectTile({ item, onOpen }: { item: ProjectMedia; onOpen: () => void }) {
  const { ref, inView } = useInView<HTMLButtonElement>();
  const aspect = item.width && item.height ? item.width / item.height : 4 / 3;
  const thumbSrc = item.kind === "image" ? item.src : item.poster;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={item.kind === "video" ? `Open video — ${item.alt}` : `Open photo — ${item.alt}`}
      className="group relative mb-3 block w-full break-inside-avoid overflow-hidden border border-[var(--hairline)]"
      style={{ aspectRatio: aspect }}
    >
      <span className="media-well absolute inset-0 block">
        {inView && (
          <Image
            src={thumbSrc}
            alt={item.alt}
            fill
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 46vw"
            loading="lazy"
            className="animate-[tile-fade_.6s_ease] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </span>

      {/* burnt hairline draw-in — same hover tell as the Home portfolio slider */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-burnt transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
        aria-hidden="true"
      />

      {item.kind === "video" && (
        <span
          className="pointer-events-none absolute bottom-2.5 left-2.5 grid h-8 w-8 place-items-center rounded-full border border-ivory/50 bg-ink/65 backdrop-blur-[1px]"
          aria-hidden="true"
        >
          <svg width="10" height="11" viewBox="0 0 20 22" fill="none">
            <path d="M1 1.2v19.6a1 1 0 0 0 1.53.85l16-9.8a1 1 0 0 0 0-1.7l-16-9.8A1 1 0 0 0 1 1.2Z" fill="#EDE7DA" />
          </svg>
        </span>
      )}
    </button>
  );
}
