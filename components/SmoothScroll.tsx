"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PointerFX } from "@/components/PointerFX";
import { RevealDirector } from "@/components/RevealDirector";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Android's collapsing URL bar resizes the viewport mid-scroll; without this,
// every ScrollTrigger's `end` recalculates on that resize and hero/proof
// motion jumps. The hero section also deliberately uses 100svh (not dvh) for
// the same reason — see components/Hero.tsx.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Lenis smooth scroll bridged to GSAP's ticker and ScrollTrigger. Also hosts
 * the two motion systems that ride the same ticker: PointerFX (desktop-only
 * cursor glow / view label / magnetic buttons) and RevealDirector (the
 * focus-pull scroll reveal used across the page). Neither adds a second rAF
 * loop — everything ticks off gsap.ticker, which Lenis already drives.
 *
 * Disabled entirely when the visitor prefers reduced motion — native scroll
 * takes over and every ScrollTrigger elsewhere no-ops (PointerFX and
 * RevealDirector each independently gate on the same media query).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Smooth-scroll internal anchor links through Lenis.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <PointerFX />
      {children}
      <RevealDirector />
    </>
  );
}
