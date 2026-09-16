"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, whatsappHref, studio } from "@/lib/content";
import { useOpenTransition } from "@/lib/useOpenTransition";
import { LogoLockup } from "./LogoLockup";

const HEADER_HEIGHT = 72;

/**
 * `transparentOverHero`: only Home passes this. It's the one page with a
 * full-bleed hero image the header is meant to float over transparently —
 * every other page (Projects/About/Contact) has ordinary content right at
 * the top, so the header should just be solid from the first paint, not
 * start transparent and immediately flash solid on the smallest scroll.
 *
 * 2026-09-12: previously toggled on a flat `window.scrollY > 24px`
 * threshold — that number has no relationship to the hero's actual height,
 * so on any breakpoint where the hero is taller than ~24px (all of them),
 * the header would flip to "solid" almost immediately, while the hero image
 * was still filling most of the screen behind it. Replaced with an
 * IntersectionObserver watching a sentinel at the hero's own bottom edge
 * (rendered by Hero.tsx, id="hero-sentinel") — this adapts automatically to
 * whatever the hero's real rendered height is at any breakpoint, rather
 * than a guessed pixel number that only happened to be right sometimes.
 */
export function Header({ transparentOverHero = false }: { transparentOverHero?: boolean } = {}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(!transparentOverHero);
  const { mounted: menuMounted, active: menuActive } = useOpenTransition(open);

  useEffect(() => {
    if (!transparentOverHero) return; // already solid — nothing to watch

    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      setSolid(true); // no hero on this page after all — stay solid
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setSolid(!entry.isIntersecting),
      // Shrink the observed area by the header's own height from the top,
      // so "no longer intersecting" fires exactly when the sentinel has
      // scrolled up past the header, not when it merely reaches the real
      // viewport edge underneath it.
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [transparentOverHero]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      id="top-nav"
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid || open
          ? "border-b border-[var(--hairline)] bg-panel/95 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label={`${studio.name} — home`}>
          <LogoLockup size="nav" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b pb-1 font-sans text-[0.9rem] transition-colors ${
                  active
                    ? "border-burnt text-ivory"
                    : "border-transparent text-dim hover:border-burnt/50 hover:text-ivory"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden border border-burnt px-4 py-2 font-sans text-[0.85rem] text-ivory transition-colors hover:bg-burnt hover:text-ink sm:inline-block"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-10 w-10 items-center justify-center border border-[var(--hairline)] lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {open ? (
                <path d="M3 3l12 12M15 3L3 15" stroke="#EDE7DA" strokeWidth="1.5" />
              ) : (
                <path d="M2 5h14M2 13h14" stroke="#EDE7DA" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuMounted && (
        <>
          {/* Backdrop — fades in/out behind the panel, offset below the
              header bar itself so it never dims the bar the hamburger sits
              in. Also closes on click, matching the CategoryFilter mobile
              sheet's existing backdrop pattern. */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            data-closed={menuActive ? undefined : ""}
            className="ui-backdrop fixed inset-x-0 bottom-0 top-[72px] z-40 bg-ink/70 lg:hidden"
          />
          <nav
            id="mobile-nav"
            aria-label="Primary"
            aria-hidden={!open}
            data-closed={menuActive ? undefined : ""}
            className="ui-panel-scale relative z-40 border-t border-[var(--hairline)] bg-ink px-[clamp(1.25rem,5vw,4.5rem)] pb-8 pt-4 lg:hidden"
          >
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-[var(--hairline)] py-4 font-display text-2xl font-medium ${
                    active ? "text-burnt" : "text-ivory"
                  }`}
                >
                  {item.label}
                  {active && <span className="font-sans text-[0.7rem] uppercase tracking-wide text-dim">Here</span>}
                </Link>
              );
            })}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              className="mt-6 inline-block bg-burnt px-5 py-3 font-sans text-[0.9rem] text-ink"
            >
              Message on WhatsApp
            </a>
          </nav>
        </>
      )}
    </header>
  );
}
