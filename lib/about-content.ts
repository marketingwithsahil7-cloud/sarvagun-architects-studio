// Data layer for /about. Every figure here is reused from data already
// established elsewhere — the project category count from
// lib/projects-content.ts, the service-area count and the Google rating from
// lib/content.ts — rather than a new number invented for this page.
import { studio, areas, testimonials, closingCta, type Media } from "./content";
import { categories } from "./projects-content";

export const aboutIntro = {
  index: "01",
  label: "About the studio",
  heading: studio.tagline,
  body: `A practice led by ${studio.principal}, working across architecture, interiors, structure and site supervision — carried through construction to handover, out of ${studio.hq}.`,
  portrait: {
    kind: "image",
    src: "/assets/img/about/apoorv-portrait.jpg",
    alt: `${studio.principal}, principal of ${studio.name}`,
  } satisfies Media,
};

export const aboutStory = {
  index: "02",
  label: "The studio",
  heading: "Our story, in short",
  // Small, decorative line under the heading.
  tagline: "The story so far, thoughtfully designed.",
  body: [
    "Sarvagun Architects Studio was built around a passion for creating spaces where design and everyday life come together effortlessly. Our approach combines architectural clarity with refined interiors, thoughtful materials, natural light and functional planning.",
    "Every project begins with listening — understanding the client, the context and the purpose behind the space. From that foundation, we develop designs that are contemporary yet enduring, expressive yet practical.",
    "We see architecture as more than a structure and interiors as more than finishes. Together, they shape how a place feels, functions and becomes a part of people’s lives.",
  ],
};

export const aboutStats = {
  index: "03",
  label: "By the numbers",
  heading: "What the archive says",
  // Small, decorative line under the heading — not a second headline.
  tagline: "Numbers earned on real sites.",
  items: [
    {
      value: String(categories.length),
      label: "Project categories documented",
    },
    {
      value: String(areas.cities.length),
      label: "Cities served, Saharanpur to the Doon valley",
    },
    {
      value: testimonials.rating,
      label: `Google rating from ${testimonials.reviewCount} clients`,
    },
  ],
};

export const aboutClosing = {
  index: "04",
  label: closingCta.label,
};
