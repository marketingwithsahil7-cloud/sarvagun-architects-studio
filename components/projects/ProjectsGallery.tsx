"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DimensionLine } from "@/components/DimensionLine";
import { Tagline } from "@/components/Tagline";
import { CategoryFilter } from "./CategoryFilter";
import { CategoryCta } from "./CategoryCta";
import { ProjectTile } from "./ProjectTile";
import { ProjectLightbox } from "./ProjectLightbox";
import { itemsByCategory, defaultCategory, gridMeta, categoryTaglines, type CategoryId } from "@/lib/projects-content";

/**
 * Owns the filter + grid + lightbox as one unit: the lightbox needs to know
 * which set of items is currently visible so prev/next stay inside the
 * active category, not the whole 110-item archive.
 *
 * The grid itself is CSS multi-column (columns-2/3/4 + break-inside-avoid
 * on each tile) rather than a JS masonry library — per the brief, this is
 * about scroll performance and avoiding layout-thrash at 40+ tiles, and
 * columns give real variable-height packing from genuine aspect ratios
 * without measuring anything in JS.
 */
export function ProjectsGallery() {
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = itemsByCategory[category];

  // The grid's height changes with the category (17 items vs 54 is a very
  // different page length), but RevealDirector's ScrollTrigger.batch only
  // scans/measures once on route load — it has no way to know this filter
  // click just resized the page. Without a refresh, CategoryCta below the
  // grid (never remounted, so it keeps whatever trigger position was
  // computed against the FIRST category shown) ends up checked against a
  // stale position once a shorter category is picked, and its one-shot
  // reveal never fires — the reported symptom, no CTA under Modern Bedroom.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [category]);

  return (
    <section id="work" className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <DimensionLine index={gridMeta.index} label={gridMeta.label} className="flex-1" />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <Tagline className="mt-4">{categoryTaglines[category]}</Tagline>

      <div key={category} className="mt-10 columns-2 gap-3 sm:columns-3 xl:columns-4">
        {items.map((item, i) => (
          <ProjectTile key={item.id} item={item} onOpen={() => setLightboxIndex(i)} />
        ))}
      </div>

      <CategoryCta category={category} />

      {lightboxIndex !== null && (
        <ProjectLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </section>
  );
}
