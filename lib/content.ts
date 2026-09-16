// All homepage copy and data — grounded in Sarvagun Architects Studio's real
// services, real projects and real client-facing material (including the
// tagline and contact details read off the studio's own project video).
// Media is served from Vercel Blob (see scripts/upload-to-blob.mjs and
// scripts/generated/blob-map.json). Local originals still live under
// public/assets/img and public/assets/video, prepared from the client's raw
// archive by scripts/prepare-media.mjs — never edit those files by hand,
// regenerate them from the source in projects/.

export const studio = {
  name: "Sarvagun Architects Studio",
  tagline: "Architects, Interior Designer, Engineers, Consultants.",
  principal: "Apoorv Gupta",
  hq: "Saharanpur, Uttar Pradesh",
  instagram: "sarvagunarchitectsstudio",
  instagramUrl: "https://www.instagram.com/sarvagunarchitectsstudio/",
  facebookUrl: "https://www.facebook.com/share/1EP36S3gN3/?mibextid=wwXIfr",
  // Google Business Profile, addressed by place_id — same place_id also
  // drives the Contact page's map embed (components/ContactMap.tsx) and the
  // LocalBusiness JSON-LD's geo coordinates in app/layout.tsx.
  googlePlaceId: "ChIJH74D-kHrDjkRRUBIX9_Gdc4",
  googleBusinessUrl: "https://www.google.com/maps/place/?q=place_id:ChIJH74D-kHrDjkRRUBIX9_Gdc4",
  email: "studiosarvagun@gmail.com",
  // Read off the end-card of the studio's own "Front Elevation - Renovation
  // Project" video. Primary number wired to WhatsApp; second kept as a
  // documented alternate — confirm both with Apoorv before launch.
  whatsappNumber: "918006000250",
  phoneDisplay: "8006000250",
  phoneDisplayIntl: "+91 80060 00250",
  phoneAlt: "8006661177",
  whatsappPrefill: "Hi Sarvagun Architects Studio — I have a project I'd like to discuss.",
  // Structured address + coordinates — used by the LocalBusiness JSON-LD in
  // app/layout.tsx. Coordinates match the Google Business Profile above.
  address: {
    street: "Opposite Emergency Gate of Civil Hospital, Damodarpuri",
    locality: "Saharanpur",
    region: "Uttar Pradesh",
    postalCode: "247001",
    country: "IN",
  },
  geo: { latitude: 29.951964, longitude: 77.5580588 },
};

export const whatsappHref = `https://wa.me/${studio.whatsappNumber}?text=${encodeURIComponent(
  studio.whatsappPrefill,
)}`;

// The tagline row under the logo+name lockup on the About page intro
// (components/AboutIntro.tsx) — deliberately distinct wording from
// studio.tagline ("Architects, Interior Designer, Engineers, Consultants."), which is
// the client's own real end-card copy used everywhere else on the site.
export const brandTagline = "Architecture · Planning · Design · Supervision";

export const nav = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ---------------------------------------------------------------------------
// Media — a discriminated union so a placeholder slide becomes real media by
// changing one entry, without touching any component.
// ---------------------------------------------------------------------------

export type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster: string; alt: string; sizeMB?: number }
  | { kind: "sketch"; variant: "elevation" | "plan" | "section" | "gate"; label: string };

// One category-labelled photo in the Hero carousel (components/Hero.tsx).
export type HeroSlide = { kind: "image"; category: string; src: string; alt: string };

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const hero = {
  kicker: studio.tagline,
  headline: ["The drawing is the promise.", "The building is the proof."],
  standfirst:
    "A full-cycle studio led by Apoorv Gupta — plans, elevations, structure and interiors, carried through construction to handover. Based in Saharanpur, building across six cities.",
  primaryCta: { label: "Start on WhatsApp" },
  secondaryCta: { label: "See our work", href: "#work" },
  image: {
    kind: "image",
    src: "/assets/img/hero/elevation-dusk.jpg",
    alt: "A multi-storey elevation at dusk, lit facade detailing in warm light against a darkening sky",
  } satisfies Media,
  // One strong, representative photo per portfolio category, cycling as a
  // background carousel (components/Hero.tsx). Slide 0 reuses `image` above
  // (also the OG/JSON-LD image in app/layout.tsx) — already the strongest
  // Front Elevation shot on hand. The other five reuse the same curated hero
  // stills already vetted for the Portfolio slider below (`portfolio.slides`),
  // rather than picking new, unvetted images.
  slides: [
    {
      kind: "image",
      category: "Front Elevation",
      src: "/assets/img/hero/elevation-dusk.jpg",
      alt: "A multi-storey elevation at dusk, lit facade detailing in warm light against a darkening sky",
    },
    {
      kind: "image",
      category: "Interior Design",
      src: "/assets/img/slides/interior-design-hero.jpg",
      alt: "Modern bedroom with a backlit arched wood-panel headboard wall",
    },
    {
      kind: "image",
      category: "Site Supervision",
      src: "/assets/img/slides/site-supervision-hero.jpg",
      alt: "A house mid-construction, wrapped in weatherproofing with exposed rebar",
    },
    {
      kind: "image",
      category: "Hospital Design",
      src: "/assets/img/slides/hospital-design-hero.jpg",
      alt: "Rendered hospital building elevation with a brick and glazed-grid facade",
    },
    {
      kind: "image",
      category: "Commercial Projects",
      src: "/assets/img/slides/commercial-projects-hero.jpg",
      alt: "Jewellery showroom interior with arched display niches",
    },
    {
      kind: "image",
      category: "Hotel Design",
      src: "/assets/img/slides/hotel-design-hero.jpg",
      alt: "Multi-storey hotel elevation with warm facade lighting, daylight",
    },
    // Client-requested addition — a second, distinct front elevation render
    // (not the same file as slide 0 above). Its own category label so the
    // two don't collide as React keys and the bottom-left indicator reads
    // correctly for each.
    {
      kind: "image",
      category: "Residential Front Elevation",
      src: "/assets/img/hero/residential-front-elevation.jpg",
      alt: "A three-storey residential front elevation with stone cladding, a slatted timber-and-glass carport, and landscaped planting",
    },
    // Same render as the "3D Front Elevations" services thumbnail
    // (front-elevation/1_5 - Photo-2.jpg) — client asked for it in the Hero
    // rotation too, full-size.
    {
      kind: "image",
      category: "3D Front Elevation",
      src: "/assets/img/hero/front-elevation-render.jpg",
      alt: "A three-storey beige front elevation with a glazed double-height balcony and a slatted-timber glass carport",
    },
  ] satisfies HeroSlide[],
};

// ---------------------------------------------------------------------------
// Proof
// ---------------------------------------------------------------------------

export type ProofBlock = {
  heading: string;
  body: string[];
  render: Media;
  renderLabel: string;
  built: Media;
  builtLabel: string;
  walkthrough?: Media;
  walkthroughCaption?: string;
  walkthroughCta?: string;
  // Project 3's client-supplied reel is a native portrait (9:16) export —
  // forcing it into the landscape 16:9 box used by the other two would
  // crop most of the building out via object-cover. Defaults to landscape.
  walkthroughOrientation?: "landscape" | "portrait";
};

export const proof = {
  index: "01",
  label: "Drawing, and address",
  // Three sequential render-vs-built comparisons. Project 1's direction
  // (which came first) has never been confirmed by the client, so its copy
  // stays deliberately neutral — see the body text below. Projects 2 and 3's
  // files are unambiguous (a 3D render and a real photo/video of the same
  // building), so their copy states the direction plainly.
  blocks: [
    {
      heading: "A drawing and a doorstep, sharing every proportion.",
      body: [
        "This elevation and a narrow-plot home in Saharanpur match down to the glazed stair strip on the left, the stacked balconies, the slatted gate. Whichever one you saw first — that's the point. A Sarvagun drawing and a Sarvagun building read as the same object.",
      ],
      render: {
        kind: "image",
        src: "/assets/img/proof/drawing.jpg",
        alt: "3D elevation render of a narrow-plot house with a glazed vertical stair strip and stacked balconies",
      } satisfies Media,
      renderLabel: "3D elevation",
      built: {
        kind: "image",
        src: "/assets/img/proof/built.jpg",
        alt: "Street photograph of a built narrow-plot house with a glazed vertical stair strip and stacked balconies",
      } satisfies Media,
      builtLabel: "On site, Saharanpur",
      walkthrough: {
        kind: "video",
        src: "/assets/video/proof-walkthrough.mp4",
        poster: "/assets/img/proof/walkthrough-poster.jpg",
        alt: "Our own footage of a finished elevation and its interiors, ending on the client handover",
      } satisfies Media,
      walkthroughCaption:
        "Further proof: our own footage, from the finished elevation through to the interiors — ending, in our client's words, “happily handed over.”",
      walkthroughCta: "Watch the walkthrough — 0:55",
    },
    {
      // TODO: location unconfirmed — client hasn't told us the city for
      // this project yet. `builtLabel` deliberately reads "On site" with no
      // place name rather than guessing one; replace with "On site, <City>"
      // once confirmed (lib/content.ts only, no component change needed).
      heading: "What we drew is what's rising on site.",
      body: [
        "The 3D elevation came first — massing, the vertical facade fins and the entrance porch all resolved on paper before the first wall went up. Mid-construction, the build is already reading the same proportions from the street.",
      ],
      render: {
        kind: "image",
        src: "/assets/img/proof/project-2-render.jpg",
        alt: "3D elevation render of a house with warm facade lighting, stone cladding and vertical wood fins",
      } satisfies Media,
      renderLabel: "3D elevation",
      built: {
        kind: "image",
        src: "/assets/img/proof/project-2-built.jpg",
        alt: "The same house mid-construction, exposed concrete with a jali screen fence at street level",
      } satisfies Media,
      builtLabel: "On site",
      walkthrough: {
        kind: "video",
        src: "/assets/video/proof/project-2-walkthrough.mp4",
        poster: "/assets/img/proof/project-2-walkthrough-poster.jpg",
        alt: "Our own footage of this build mid-construction, structural framing and facade detail",
        sizeMB: 16,
      } satisfies Media,
      walkthroughCaption: "A closer look, on site — structural framing and facade detail as the build progresses.",
      walkthroughCta: "Watch the walkthrough — 0:42",
    },
    {
      // TODO: location unconfirmed, same as project 2 above — `builtLabel`
      // reads "On site" with no place name until the client tells us the city.
      heading: "The render came first. The house followed exactly.",
      body: [
        "This elevation was drawn before ground broke — the maroon vertical fins, the covered entrance porch, the massing. What's standing on site now reads as the same building, not a rough approximation of it.",
      ],
      render: {
        kind: "image",
        src: "/assets/img/proof/project-3-render.jpg",
        alt: "3D elevation render of a house with maroon vertical facade fins and a covered entrance porch",
      } satisfies Media,
      renderLabel: "3D elevation",
      built: {
        kind: "image",
        src: "/assets/img/proof/project-3-built.jpg",
        alt: "The same house completed, front elevation with maroon vertical fins and a boundary gate",
      } satisfies Media,
      builtLabel: "On site",
      walkthrough: {
        kind: "video",
        src: "/assets/video/proof/project-3-walkthrough.mp4",
        poster: "/assets/img/proof/project-3-walkthrough-poster.jpg",
        alt: "The client's own footage — an old structure renovated into this finished elevation, ending in handover",
        sizeMB: 15,
      } satisfies Media,
      walkthroughCaption:
        "The full journey, in the client's own words: the old structure, the render, and the finished elevation — start to handover.",
      walkthroughCta: "Watch the walkthrough — 1:23",
      walkthroughOrientation: "portrait",
    },
  ] satisfies ProofBlock[],
};

// ---------------------------------------------------------------------------
// Services — seven drawing-sheet references
// ---------------------------------------------------------------------------

export const services = {
  index: "02",
  label: "Seven sheets, one studio",
  heading: "Services, read like a drawing set",
  intro: "Engage us for the whole set or a single sheet.",
  sheets: [
    {
      code: "A-01",
      title: "Plans",
      body: "Layout plans, room by room, sized and sanctioned before a wall goes up.",
      thumb: { kind: "image", src: "/assets/img/services/plans.jpg", alt: "Layout plan drawing, room by room" } satisfies Media,
    },
    {
      code: "A-02",
      title: "3D Front Elevations",
      body: "Photoreal elevation renders at construction scale — proportions, materials and lighting resolved before the facade is built.",
      thumb: { kind: "image", src: "/assets/img/services/elevations-2.jpg", alt: "Photoreal 3D front elevation render" } satisfies Media,
    },
    {
      code: "A-03",
      title: "Structure Design",
      body: "RCC structural drawings — columns, beams, slab and footing sized for the site's actual soil and span.",
      // same real site-supervision frame used by the Process section's
      // "Super Structure" step — one photo, two honest contexts.
      thumb: { kind: "image", src: "/assets/img/site-supervision/structure-poster.jpg", alt: "RCC structural framework under construction" } satisfies Media,
    },
    {
      code: "A-04",
      title: "Interior Design",
      body: "Full interior planning — layouts, false ceilings, lighting and finish schedules, room by room.",
      thumb: { kind: "image", src: "/assets/img/services/interior.jpg", alt: "Finished interior with false ceiling and feature lighting" } satisfies Media,
    },
    {
      code: "A-05",
      title: "Modern Kitchen",
      body: "Modular kitchen design — layout, storage, counters and appliances planned together, not fitted after.",
      thumb: { kind: "image", src: "/assets/img/services/kitchen.jpg", alt: "Modern modular kitchen with integrated appliances" } satisfies Media,
    },
    {
      code: "A-06",
      title: "Turnkey Projects",
      body: "One studio, start to finish — design, materials, contractors and execution under a single roof.",
      thumb: { kind: "image", src: "/assets/img/services/turnkey.jpg", alt: "Completed turnkey interior, fully furnished" } satisfies Media,
    },
    {
      code: "A-07",
      title: "Supervision of Projects",
      body: "Site visits and quality checks through construction, so the drawing survives contact with the site.",
      // reuses the "Foundation & Piling (Sub-Structure)" site-supervision frame from Process
      thumb: { kind: "image", src: "/assets/img/site-supervision/foundation-poster.jpg", alt: "Foundation and piling work on site" } satisfies Media,
    },
  ],
};

// ---------------------------------------------------------------------------
// "Index of work" filmstrip — a continuously scrolling row of thumbnails
// sampled across the real archive, weighted toward the richer categories.
// Ambient texture/volume by design (auto-scrolling, no captions) — but each
// thumbnail is real, clickable content (opens the same ProjectLightbox the
// /projects grid uses, see IndexFilmstrip.tsx), so every entry carries real
// alt text now, not the empty string a purely decorative strip would use.
// ---------------------------------------------------------------------------

export const filmstripMeta = { index: "03", label: "Index of work" };

// Narrower than Media itself — every entry here is genuinely a "image" kind,
// never "video"/"sketch", so this is typed that way rather than as the full
// Media union. That's what lets this array pass directly as
// ProjectLightbox's `items` prop (see components/IndexFilmstrip.tsx): its
// LightboxItem type has no "sketch" variant, so a Media[] wouldn't
// type-check there even though every real element already qualifies.
type FilmstripImage = Extract<Media, { kind: "image" }>;

function filmstripItem(f: string, alt: string): FilmstripImage {
  return { kind: "image", src: `/assets/img/filmstrip/${f}.jpg`, alt };
}

export const filmstrip: FilmstripImage[] = [
  // front-elevation — rich (6)
  ...["fe-01", "fe-02", "fe-03", "fe-04", "fe-05", "fe-06"].map((f, i) =>
    filmstripItem(f, `Front elevation project, view ${i + 1}`),
  ),
  // interior-design, merged in from a separate category 2026-09-11 — rich (6)
  ...["hd-01", "hd-02", "hd-03", "hd-04", "hd-05", "hd-06"].map((f, i) =>
    filmstripItem(f, `Interior design project, view ${i + 1}`),
  ),
  // Modern Bedrooms — rich (5)
  ...["mb-01", "mb-02", "mb-03", "mb-04", "mb-05"].map((f, i) =>
    filmstripItem(f, `Modern bedroom interior, view ${i + 1}`),
  ),
  // modern-kitchen — moderate (4)
  ...["mk-01", "mk-02", "mk-03", "mk-04"].map((f, i) =>
    filmstripItem(f, `Modern kitchen interior, view ${i + 1}`),
  ),
  // interior-design umbrella — unique extras (2)
  ...["id-01", "id-02"].map((f, i) => filmstripItem(f, `Interior design detail, view ${i + 1}`)),
  // thin categories — light presence (1 each)
  filmstripItem("htl-01", "Hotel design project"),
  filmstripItem("cp-01", "Commercial project interior"),
  // video-poster-derived — light presence (walkthroughs x3, site-supervision x2, hospital x1)
  ...["wt-01", "wt-02", "wt-03"].map((f, i) => filmstripItem(f, `Project walkthrough, still ${i + 1}`)),
  ...["ss-01", "ss-02"].map((f, i) => filmstripItem(f, `Site supervision, view ${i + 1}`)),
  filmstripItem("hosp-01", "Hospital design project"),
];

// ---------------------------------------------------------------------------
// Portfolio teaser — one slider, six slides
// ---------------------------------------------------------------------------

export type Slide = {
  id: string;
  title: string;
  description: string;
  hero: Media;
};

export const portfolio = {
  index: "04",
  label: "Selected work",
  heading: "Six kinds of project, one studio",
  viewAllHref: "/projects",
  viewAllLabel: "View all projects",
  slides: [
    {
      id: "front-elevation",
      title: "Front Elevations",
      description:
        "Facade design at construction scale — materials, proportions and lighting resolved before the wall goes up.",
      hero: { kind: "image", src: "/assets/img/slides/front-elevation-hero.jpg", alt: "Warm-lit front elevation of a modern bungalow with wooden louvres" },
    },
    {
      id: "interior-design",
      title: "Interior Design",
      description:
        "Bedrooms, kitchens and living spaces designed as one interior identity — layout, lighting and finish schedules planned together.",
      hero: { kind: "image", src: "/assets/img/slides/interior-design-hero.jpg", alt: "Modern bedroom with a backlit arched wood-panel headboard wall" },
    },
    {
      id: "commercial-projects",
      title: "Commercial Projects",
      description:
        "Retail counters and consultation rooms — from a jeweller's showroom to a doctor's cabin — designed to hold up under daily use.",
      hero: { kind: "image", src: "/assets/img/slides/commercial-projects-hero.jpg", alt: "Jewellery showroom interior with arched display niches" },
    },
    {
      id: "hotel-design",
      title: "Hotel Design",
      description:
        "Multi-storey hospitality elevations — facade lighting and material rhythm designed to read at street scale and at night.",
      hero: { kind: "image", src: "/assets/img/slides/hotel-design-hero.jpg", alt: "Multi-storey hotel elevation with warm facade lighting, daylight" },
    },
    {
      id: "hospital-design",
      title: "Hospital Design",
      description:
        "Healthcare interiors and layouts — circulation, consultation rooms and finishes planned for a clinical brief.",
      hero: { kind: "image", src: "/assets/img/slides/hospital-design-gupta.jpg", alt: "Rendered front elevation of Gupta Hospital, a multi-storey building with illuminated signage and a jali-screen facade" },
    },
    {
      id: "site-supervision",
      title: "Site Supervision",
      description:
        "Site visits and quality checks through construction — the part of the job that happens after the drawings are approved.",
      hero: { kind: "image", src: "/assets/img/slides/site-supervision-hero.jpg", alt: "A house mid-construction, wrapped in weatherproofing with exposed rebar" },
    },
  ] satisfies Slide[],
};

// ---------------------------------------------------------------------------
// Process
// ---------------------------------------------------------------------------

// Real site-supervision footage, one clip per phase — captured on-site, not
// staged. Sizes are hardcoded here (measured at curation time in
// scripts/prepare-media.mjs) because VideoPoster needs to show an
// approximate size next to "tap to play" for anything over ~50MB, per the
// mobile-data rule: nothing this large is ever fetched until tapped.
export const process = {
  index: "05",
  label: "How a build runs",
  heading: "Construction is a sequence. We run it in order.",
  // Small, decorative line under the heading — not a second headline.
  tagline: "Same rigor, every single time.",
  steps: [
    {
      no: "01",
      title: "Foundation & Piling (Sub-Structure)",
      body: "Excavation, footings and piling where the soil demands it. Levels, setbacks and column grid checked against the sanctioned plan before concrete.",
      media: {
        kind: "video",
        src: "/assets/video/site-supervision/foundation.mp4",
        poster: "/assets/img/site-supervision/foundation-poster.jpg",
        alt: "A house mid-construction, wrapped in weatherproofing with exposed rebar columns",
        sizeMB: 15,
      } satisfies Media,
    },
    {
      no: "02",
      title: "Super Structure",
      body: "RCC frame, slabs and blockwork. Plumbing and electrical routes are set out and sleeved before anything is closed up.",
      media: {
        kind: "video",
        src: "/assets/video/site-supervision/structure.mp4",
        poster: "/assets/img/site-supervision/structure-poster.jpg",
        alt: "An RCC staircase under construction, exposed concrete steps",
      } satisfies Media,
    },
    {
      no: "03",
      title: "Facade & finishing",
      body: "Elevation cladding, plaster, waterproofing, flooring, joinery and paint. This is where the elevation drawing becomes a building.",
      media: {
        kind: "video",
        src: "/assets/video/site-supervision/finishing.mp4",
        poster: "/assets/img/site-supervision/finishing-poster.jpg",
        alt: "A false ceiling under construction, plaster stage, marked 'Living Area Ceiling'",
      } satisfies Media,
    },
    {
      no: "04",
      title: "Handover",
      body: "Snagging list closed, a walkthrough with you, deep clean, then keys, as-built drawings and maintenance notes handed over.",
      media: {
        kind: "video",
        src: "/assets/video/site-supervision/handover.mp4",
        poster: "/assets/img/site-supervision/handover-poster.jpg",
        alt: "The same home, finished and furnished, ready to hand over",
        sizeMB: 8,
      } satisfies Media,
    },
  ],
};

// ---------------------------------------------------------------------------
// Service areas
// ---------------------------------------------------------------------------

export const areas = {
  index: "06",
  label: "Where we build",
  heading: "On site across the plains and the foothills",
  // Small, decorative line under the heading — not a second headline.
  tagline: "One studio. Every site we're on.",
  // The six-city grounded service base — this list also drives the
  // LocalBusiness JSON-LD's `areaServed` in app/layout.tsx, so it stays
  // exactly these six for local-SEO accuracy. The "and beyond" chip
  // (components/ServiceAreas.tsx) is a separate, purely visual addition —
  // deliberately not folded into this array so it never reaches the JSON-LD.
  cities: [
    { name: "Saharanpur", note: "Head office" },
    { name: "Dehradun", note: null },
    { name: "Roorkee", note: null },
    { name: "Haridwar", note: null },
    { name: "Rishikesh", note: null },
    { name: "Meerut", note: null },
  ],
  beyondChip: "All over India",
};

// ---------------------------------------------------------------------------
// Closing CTA band
// ---------------------------------------------------------------------------

export const closingCta = {
  index: "07",
  label: "Start a project",
  heading: "Have a plot, or a house that needs work?",
  body: "Send the location and what you're planning — Apoorv will get back to you.",
  primaryCta: { label: "Start on WhatsApp" },
  secondaryCta: { label: "Go to Contact", href: "/contact" },
};

// ---------------------------------------------------------------------------
// Contact page — its own section numbering (01–03), independent of Home's.
// A visitor can land here directly, so continuing Home's 01–07 sequence
// would read as an arbitrary jump.
// ---------------------------------------------------------------------------

export const contactIntro = {
  index: "01",
  label: "Get in touch",
  tagline: studio.tagline,
  heading: "Tell us what you're building.",
  body: "We plan, design and build — from the first site visit through construction to handover. Send a photo of the plot, or just say what's on your mind.",
};

export const contactDetails = {
  index: "02",
  label: "Direct contact",
  // Small, decorative line under the "Direct contact" label — not a headline.
  tagline: "One number. One studio. No middlemen.",
  // Small, decorative line under the "Find us" heading, alongside the
  // street address line.
  findUsTagline: "Saharanpur first. India, always.",
  whatsappLabel: "Message on WhatsApp",
  // A cropped variant of the same render used for `hero` above, not the
  // original — that one is 16:9 and this slot is a tall (~3:4 at desktop,
  // 4:5 on mobile) well; object-cover on a landscape image in a portrait
  // box always shows 100% of the image's height (only width gets cropped),
  // so the original left roughly a third of this slot showing empty sky no
  // matter how object-position was tuned. This version is pre-cropped
  // tighter on the building so the full-height render is mostly house.
  photo: {
    kind: "image",
    src: "/assets/img/slides/front-elevation-hero-portrait.jpg",
    alt: "Warm-lit front elevation of a modern bungalow with wooden louvres, wet driveway reflecting the facade",
  } satisfies Media,
  // Surfaced during media review but NOT confirmed by the client yet — do
  // not render these anywhere. Adding them later is a one-line change: set
  // the value here, then reference contactDetails.email / .phoneAlt in
  // components/ContactSplit.tsx (both are currently unreferenced there).
  email: undefined as string | undefined, // pending client confirmation
  phoneAlt: undefined as string | undefined, // pending client confirmation (second number)
};

export const contactForm = {
  cities: areas.cities.map((c) => c.name),
  projectTypes: [
    "New construction",
    "Interior renovation",
    "Facade-elevation only",
    "Landscape",
    "Other",
  ],
};

export type EnquiryFields = {
  name: string;
  phone: string;
  city: string;
  projectType: string;
  message: string;
};

/** Builds a wa.me URL with the enquiry form's values formatted into a
 * readable, pre-filled message. No backend — this is the entire "submit". */
export function buildEnquiryWhatsAppUrl(fields: EnquiryFields) {
  const lines = [
    "Hi Sarvagun Architects Studio — enquiry from the website.",
    "",
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    `City: ${fields.city}`,
    `Project type: ${fields.projectType}`,
  ];
  if (fields.message.trim()) {
    lines.push(`Message: ${fields.message.trim()}`);
  }
  return `https://wa.me/${studio.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// Structured so /about's "by the numbers" strip can reuse the same real
// figures instead of re-typing (and risking drift from) a plain string.
const GOOGLE_RATING = "5.0";
const GOOGLE_REVIEW_COUNT = 86;

export const testimonials = {
  index: "03",
  label: "What clients say",
  heading: "Reviews, unedited",
  rating: GOOGLE_RATING,
  reviewCount: GOOGLE_REVIEW_COUNT,
  stat: `${GOOGLE_RATING} · ${GOOGLE_REVIEW_COUNT} reviews, Google`,
  quotes: [
    "Sarvagun architect studio took our home design to a whole new level. His creative vision is amazing and he took every little detail of our needs into account. Great Job",
    "Best ever experience with Sarvagun architects studio… they planned our 500 sq.yrd house. Best designer in construction layout… highly recommended for best architecture and interior designer",
    "Well designer, great person, very impressive ideas given by sarvagun architects studio for our new home in roorkee… highly recommended for renovation, interior and architecture working.",
    "Working with sarvagun architects was a fantastic experience! Their attention to detail and innovative design ideas truly transformed our space… They listened to our needs and delivered a design that exceeded our expectations.",
  ],
};
