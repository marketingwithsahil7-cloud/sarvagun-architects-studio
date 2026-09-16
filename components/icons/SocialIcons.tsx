// Hand-drawn to match the site's existing icon language (Header.tsx's
// hamburger, CategoryFilter.tsx's chevron, FeaturedWalkthroughs.tsx's
// arrows): tight viewBox, stroke="currentColor", no fill, default (butt)
// line caps — no icon library, so nothing introduces a different stroke
// weight or corner style next to those.

type IconProps = { className?: string };

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path d="M8.5 8.7c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4.2.4.6 1.5.7 1.6.1.1.1.3 0 .4l-.3.5-.4.4c-.1.2-.2.3 0 .6.2.3.8 1.2 1.7 2 1.1.9 2 1.3 2.3 1.4.3.1.4.1.6-.1l.5-.6c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.3.1.2.1.9-.2 1.4-.3.5-1.3.9-1.8.9-.5 0-2.2-.7-3.9-2.2-1.7-1.6-2.7-3.2-2.9-3.5-.1-.2-.8-1.2-.8-2.3 0-1.1.5-1.6.7-1.8Z" strokeWidth="1.1" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M14.2 9h-1.4c-.9 0-1.6.7-1.6 1.6V12h3l-.4 2.6h-2.6V19" />
    </svg>
  );
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
