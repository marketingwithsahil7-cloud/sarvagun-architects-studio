"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the element has entered the viewport (plus rootMargin), and
 * stays true after — a tile that's been loaded doesn't need to unload.
 * Used to gate every grid tile's real image/poster fetch so a 110-item page
 * doesn't fetch anywhere near all of them on load; next/image's own
 * loading="lazy" isn't tight enough at this volume (the browser still
 * issues the request well ahead of scroll for a page this long).
 */
export function useInView<T extends HTMLElement>(rootMargin = "400px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
