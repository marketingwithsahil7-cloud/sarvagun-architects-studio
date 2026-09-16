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
  // Small, decorative line under the heading — unlike `body` below, this
  // isn't biographical, so the "don't invent" rule on that TODO doesn't
  // apply to it.
  tagline: "The story so far, plainly told.",
  // TODO: real founder bio — years active, qualification, founding story —
  // pending from client. Do not fill this in with an invented founding
  // year, "X years of experience," registration status, or generic
  // architect-bio copy — replace the placeholder body below with the real
  // text once the client supplies it, and remove this comment.
  placeholder: true,
  body: "This is a placeholder. The studio's own story — when it started, who leads which discipline day to day, and what the practice stands for — hasn't been supplied by the client yet, so nothing here is invented to fill the gap. This paragraph will be replaced with the real one once it comes through.",
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
