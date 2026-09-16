import { studio, whatsappHref } from "@/lib/content";
import { WhatsAppIcon, InstagramIcon, FacebookIcon, GoogleIcon } from "./icons/SocialIcons";

const links = [
  { href: whatsappHref, label: "Message Sarvagun Architects Studio on WhatsApp", Icon: WhatsAppIcon },
  { href: studio.instagramUrl, label: "Sarvagun Architects Studio on Instagram", Icon: InstagramIcon },
  { href: studio.facebookUrl, label: "Sarvagun Architects Studio on Facebook", Icon: FacebookIcon },
  { href: studio.googleBusinessUrl, label: "Sarvagun Architects Studio on Google", Icon: GoogleIcon },
];

/**
 * Icon-based social row — replaces plain-text social links site-wide.
 * 44px (h-11/w-11) hit targets throughout, meeting the usual minimum
 * touch-target guidance, not just whatever the 18px icon itself needs.
 */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid h-11 w-11 place-items-center border border-[var(--hairline)] text-dim transition-colors hover:border-burnt hover:text-ivory"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
