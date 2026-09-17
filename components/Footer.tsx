"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, studio, whatsappHref } from "@/lib/content";
import { SocialLinks } from "./SocialLinks";
import { LogoLockup } from "./LogoLockup";

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="relative z-10 border-t border-[var(--hairline)] bg-panel">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <LogoLockup size="footer" />
          <p className="mt-4 max-w-[26rem] font-sans text-[0.88rem] leading-relaxed text-dim">
            {studio.tagline} Led by {studio.principal}, working out of {studio.hq}.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`font-sans text-[0.88rem] transition-colors ${
                  active ? "text-burnt" : "text-dim hover:text-ivory"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2.5 font-sans text-[0.88rem]">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-dim hover:text-ivory">
            WhatsApp — {studio.phoneDisplay}, {studio.phoneAlt}
          </a>
          <a href={`mailto:${studio.email}`} className="text-dim hover:text-ivory">
            {studio.email}
          </a>
          <SocialLinks className="mt-1" />
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-[var(--hairline)] py-6 font-sans text-[0.78rem] text-dim sm:flex-row sm:justify-between">
        <span>
          © {new Date().getFullYear()} {studio.name}. All rights reserved. Site design & build by
          @sahilbuilds.
        </span>
        <span>Saharanpur · Dehradun · Roorkee · Haridwar · Rishikesh · Meerut</span>
      </div>
    </footer>
  );
}
