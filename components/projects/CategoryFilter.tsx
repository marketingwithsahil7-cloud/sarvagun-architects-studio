"use client";

import { useEffect, useRef, useState } from "react";
import { categories, categoryLabels, type CategoryId } from "@/lib/projects-content";
import { useOpenTransition } from "@/lib/useOpenTransition";

/**
 * Desktop: a dropdown anchored under the trigger button. Mobile: the same
 * list presented as a bottom sheet (fixed to the viewport edge, backdrop,
 * slides up) — same data, same handler, different chrome per breakpoint.
 */
export function CategoryFilter({
  value,
  onChange,
}: {
  value: CategoryId;
  onChange: (id: CategoryId) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { mounted, active } = useOpenTransition(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const select = (id: CategoryId) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-3 border border-[var(--hairline)] px-5 py-3.5 font-sans text-[0.95rem] text-ivory transition-colors hover:border-ivory"
      >
        <span className="font-medium">{categoryLabels[value]}</span>
        <span className="text-burnt tabular-nums">
          {categories.find((c) => c.id === value)?.count}
        </span>
        <svg
          width="11"
          height="7"
          viewBox="0 0 11 7"
          fill="none"
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
          className="transition-transform duration-[var(--ui-duration)] ease-[var(--ui-ease)]"
        >
          <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>

      {/* Desktop dropdown — grid-template-rows 0fr/1fr animates height
          without measuring scrollHeight in JS; opacity fades in sync. */}
      {mounted && (
        <div
          aria-hidden={!open}
          data-closed={active ? undefined : ""}
          className="ui-panel-grid absolute left-0 top-[calc(100%+0.5rem)] z-30 hidden w-[20rem] lg:grid"
        >
          <ul
            role="listbox"
            aria-label="Project category"
            className="overflow-hidden border border-[var(--hairline)] bg-panel shadow-[0_16px_40px_rgba(0,0,0,.5)]"
          >
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.id === value}
                  tabIndex={open ? 0 : -1}
                  onClick={() => select(c.id)}
                  className={`flex w-full items-center justify-between gap-4 border-b border-[var(--hairline)] px-5 py-3.5 text-left font-sans text-[0.92rem] transition-colors last:border-b-0 hover:bg-ink ${
                    c.id === value ? "text-ivory" : "text-dim"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="tabular-nums text-burnt">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mobile bottom sheet — backdrop fades, sheet slides up from the
          viewport edge, same treatment as the mobile nav menu. */}
      {mounted && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close category list"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            data-closed={active ? undefined : ""}
            className="ui-backdrop absolute inset-0 bg-ink/70"
          />
          <div
            role="listbox"
            aria-label="Project category"
            aria-hidden={!open}
            data-closed={active ? undefined : ""}
            className="ui-panel-slide-up absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto border-t border-[var(--hairline)] bg-panel pb-[env(safe-area-inset-bottom)]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[var(--hairline)] bg-panel px-5 py-4">
              <span className="font-display text-[1.1rem] font-medium text-ivory">Category</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                tabIndex={open ? 0 : -1}
                className="grid h-8 w-8 place-items-center border border-[var(--hairline)]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M1 1l10 10M11 1L1 11" stroke="#EDE7DA" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.id === value}
                    tabIndex={open ? 0 : -1}
                    onClick={() => select(c.id)}
                    className={`flex w-full items-center justify-between gap-4 border-b border-[var(--hairline)] px-5 py-4 text-left font-sans text-[1rem] ${
                      c.id === value ? "text-ivory" : "text-dim"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="tabular-nums text-burnt">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
