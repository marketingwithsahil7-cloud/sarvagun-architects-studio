"use client";

import { useEffect, useState } from "react";

// Shared duration for CSS-driven UI-toggle open/close transitions (mobile
// nav, category filter dropdown/sheet). Keep in sync with --ui-duration in
// app/globals.css — same convention as --reveal-blur there.
export const UI_TRANSITION_MS = 280;

// Small delay before `active` flips, in EITHER direction. Empirically
// required: flipping `active` synchronously in the same effect cycle that
// reacts to `open` changing does NOT reliably give the browser a genuine
// intervening paint to transition from — confirmed directly via
// transitionrun/transitionend listeners, which fired correctly for the
// enter direction once it went through an explicit setTimeout, but fired
// zero events for the exit direction when that one flipped `active`
// synchronously instead. Making both directions go through the same
// setTimeout removed the asymmetry. The unmount delay adds this on top of
// UI_TRANSITION_MS so the close transition has time to actually finish
// (from when it visually STARTS, not from when `open` itself changed)
// before the node is removed.
const FLIP_DELAY_MS = 20;

/**
 * Drives a conditionally-rendered `.ui-*`-classed element (see
 * app/globals.css) through a proper enter/exit CSS transition instead of an
 * instant mount/unmount snap.
 *
 * `mounted` says whether the DOM node should exist at all — true the moment
 * `open` goes true, and for UI_TRANSITION_MS + FLIP_DELAY_MS after it goes
 * false again, so a close transition has time to finish before the node is
 * removed.
 *
 * `active` is what `data-closed` (absent when true) should key off. It
 * always flips a beat AFTER `mounted`/`open` change — never in the same
 * commit — via FLIP_DELAY_MS. See the comment on that constant for why this
 * is required in both directions, not just on enter.
 */
export function useOpenTransition(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), UI_TRANSITION_MS + FLIP_DELAY_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setActive(open), FLIP_DELAY_MS);
    return () => clearTimeout(t);
  }, [mounted, open]);

  return { mounted, active };
}
