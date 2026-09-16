import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { studio, hero, testimonials, areas } from "@/lib/content";

// Italic is deliberately not loaded — the site no longer uses italic
// anywhere (readability fix), so there's no unused font-face to fetch.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sarvagunarchitects.studio"),
  title: {
    default:
      "Sarvagun Architects Studio — architects, interior, engineers, consultants",
    template: "%s · Sarvagun Architects Studio",
  },
  description:
    "Full-cycle architecture and interior design studio led by Apoorv Gupta. Plans, 3D front elevations, structure design, interior design, modern kitchens, turnkey projects and site supervision across Saharanpur, Dehradun, Roorkee, Haridwar, Rishikesh and Meerut.",
  openGraph: {
    title: "Sarvagun Architects Studio",
    description:
      "The drawing is the promise. The building is the proof — architects, interior, engineers, consultants, working across the upper Doab and the Uttarakhand foothills.",
    type: "website",
    locale: "en_IN",
    // Default share-card image for every page — a per-page override just
    // needs its own `openGraph.images` in that page's metadata export, but
    // none of the four pages need anything other than the hero shot today.
    images: [
      {
        url: hero.image.kind === "image" ? hero.image.src : "",
        width: 1920,
        height: 1080,
        alt: hero.image.kind === "image" ? hero.image.alt : studio.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarvagun Architects Studio",
    description:
      "The drawing is the promise. The building is the proof — architects, interior, engineers, consultants, working across the upper Doab and the Uttarakhand foothills.",
    images: [hero.image.kind === "image" ? hero.image.src : ""],
  },
  icons: { icon: "/assets/logo.png" },
};

// LocalBusiness structured data — sitewide (every page carries the same
// business identity) rather than duplicated per-page. `Architect` is the
// schema.org type Google's own structured-data docs use for architecture
// practices; the studio's interior-design work is covered in `description`
// rather than a second @type, since schema.org has no distinct
// "InteriorDesigner" business type to combine it with.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Architect",
  name: studio.name,
  description:
    "Full-cycle architecture and interior design studio — plans, 3D front elevations, structure design, interior design, turnkey projects and site supervision.",
  image: hero.image.kind === "image" ? hero.image.src : undefined,
  url: "https://sarvagunarchitects.studio",
  telephone: studio.phoneDisplayIntl,
  email: studio.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: studio.address.street,
    addressLocality: studio.address.locality,
    addressRegion: studio.address.region,
    postalCode: studio.address.postalCode,
    addressCountry: studio.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: studio.geo.latitude,
    longitude: studio.geo.longitude,
  },
  areaServed: areas.cities.map((c) => c.name),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: testimonials.rating,
    reviewCount: testimonials.reviewCount,
  },
  sameAs: [studio.instagramUrl, studio.facebookUrl, studio.googleBusinessUrl],
};

export const viewport: Viewport = {
  themeColor: "#0A0908",
  colorScheme: "dark",
};

// Sets .mo (="motion on") before first paint, but only when JS runs AND the
// visitor has not asked for reduced motion. app/globals.css keys every
// reveal-hidden initial state off this class, so no-JS and reduced-motion
// visitors get full opacity for free — no flash, no [data-reveal] system to
// disable, nothing to override.
const MOTION_CLASS_SCRIPT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('mo')}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_CLASS_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-burnt focus:px-4 focus:py-2 focus:text-ink focus:font-sans"
        >
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
