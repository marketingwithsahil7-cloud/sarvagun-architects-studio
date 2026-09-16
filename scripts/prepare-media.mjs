#!/usr/bin/env node
/**
 * One-off media prep: takes the curated subset of client media referenced in
 * lib/content.ts, downsizes it with sharp, and writes it into public/.
 *
 * The full client archive (8.3 GB) lives in repo-root `projects/` and is
 * NEVER served directly — Next can't reach outside `public/`, and most of
 * those files are multi-hundred-MB 4K video unusable on mobile data anyway.
 * This script is the only thing that reaches into `projects/`.
 *
 * Usage: node scripts/prepare-media.mjs
 */
import sharp from "sharp";
import { mkdir, copyFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const SRC_PROJECTS = path.join(ROOT, "projects");
const SRC_POSTERS = path.join(ROOT, "scripts", "_poster-src");
// The older top-level source dump (see .gitignore's note) — currently used
// for exactly one file, Apoorv's own portrait, which isn't part of the
// projects/ archive.
const SRC_ASSETS = path.join(ROOT, "assets");
// A separate client-supplied top-level folder (capital "Proof/"), distinct
// from both projects/ and the public/assets/img/proof/ output dir it
// happens to share a name with.
const SRC_PROOF = path.join(ROOT, "Proof");
const OUT_IMG = path.join(ROOT, "public", "assets", "img");
const OUT_VIDEO = path.join(ROOT, "public", "assets", "video");

// This used to be a hard 12MB ceiling back when video was one small optional
// accent. It no longer is: the Process section now plays real site-supervision
// footage up to ~216MB, deliberately, gated behind an explicit tap (see
// components/VideoPoster.tsx — no <video> element exists, let alone fetches
// anything, until the visitor taps). 260MB is just a sanity guard against a
// mistaken path, not a real budget — the actual mobile-data protection is
// "never autoplay, never preload, always show the size before the tap."
const VIDEO_SANITY_CEILING_BYTES = 260 * 1024 * 1024;

/** @typedef {{ src: string; out: string; longEdge: number; quality?: number; crop?: "cover" }} ImageJob */
/** @typedef {{ src: string; out: string }} VideoJob */

/** @type {ImageJob[]} */
const images = [
  // ---- Hero ----------------------------------------------------------
  { src: "front-elevation/7.jpg", out: "hero/elevation-dusk.jpg", longEdge: 2560, quality: 74 },
  // Client-requested addition to the Hero carousel — a real residential
  // front elevation render, supplied directly (not part of the projects/
  // archive), added as its own carousel slide alongside the six
  // category-representative ones.
  { src: "__proof__/NEW.jpg", out: "hero/residential-front-elevation.jpg", longEdge: 2560, quality: 74 },
  // Same render used for the "3D Front Elevations" services thumbnail below
  // (front-elevation/1_5 - Photo-2.jpg) — client asked for it in the Hero
  // rotation too. Own output file (not reusing services/elevations-2.jpg)
  // since this needs the much larger 2560 long edge for a full-bleed hero
  // background, not an 80px thumbnail crop.
  { src: "front-elevation/1_5 - Photo-2.jpg", out: "hero/front-elevation-render.jpg", longEdge: 2560, quality: 74 },

  // ---- About page — real portrait, not stock/AI imagery ---------------
  { src: "__assets__/IMG_3265.JPG", out: "about/apoorv-portrait.jpg", longEdge: 2200, quality: 78 },

  // ---- Proof section — matched pair, no ordering claim ---------------
  { src: "front-elevation/Design for House (101).jpg", out: "proof/drawing.jpg", longEdge: 2000 },
  { src: "front-elevation/Old House (101).jpg", out: "proof/built.jpg", longEdge: 2000 },
  { src: "__poster__/renovation-walkthrough-poster-src.jpg", out: "proof/walkthrough-poster.jpg", longEdge: 1600 },

  // ---- Services — one real thumbnail per drawing sheet ----------------
  // A-03 and A-07 deliberately reuse the Process section's own site-supervision
  // posters below (same file, two contexts) rather than new crops — it's the
  // same real work, and it reinforces "Structure" / "Supervision" honestly.
  { src: "interior-design/1_14 - Photo.jpg", out: "services/plans.jpg", longEdge: 900 },
  // Renamed from services/elevations.jpg (not just a content swap at the
  // same path) — overwriting the old blob URL in place left it dependent on
  // cache invalidation timing (CDN + the visitor's own browser both cache
  // by URL); a new filename forces every layer to fetch fresh, no waiting.
  { src: "front-elevation/1_5 - Photo-2.jpg", out: "services/elevations-2.jpg", longEdge: 900 },
  { src: "Modern Bedrooms/1_5 - Photo-1.jpg", out: "services/interior.jpg", longEdge: 900 },
  { src: "modern-kitchen/IMG-20240623-WA0005.jpg", out: "services/kitchen.jpg", longEdge: 900 },
  { src: "interior-design/1.1_3 - Photo.jpg", out: "services/turnkey.jpg", longEdge: 900 },

  // ---- Process — real site-supervision footage, poster frames --------
  // Frames captured in-browser (scripts/_poster-src/, see its header note) by
  // scrubbing the four site-supervision source videos — no ffmpeg on this
  // machine to extract frames any other way.
  { src: "__poster__/process-foundation-src.jpg", out: "site-supervision/foundation-poster.jpg", longEdge: 1280 },
  { src: "__poster__/process-structure-src.jpg", out: "site-supervision/structure-poster.jpg", longEdge: 1280 },
  { src: "__poster__/process-finishing-src.jpg", out: "site-supervision/finishing-poster.jpg", longEdge: 1280 },
  { src: "__poster__/process-handover-src.jpg", out: "site-supervision/handover-poster.jpg", longEdge: 1280 },

  // ---- Portfolio slider — hero (big) + accent (small offset) ---------
  { src: "front-elevation/IMG_7567.JPG", out: "slides/front-elevation-hero.jpg", longEdge: 2560 },
  { src: "front-elevation/IMG-20240514-WA0009.jpg", out: "slides/front-elevation-accent.jpg", longEdge: 1600 },

  { src: "Modern Bedrooms/IMG-20260910-WA0180.jpg", out: "slides/interior-design-hero.jpg", longEdge: 2560 },
  { src: "modern-kitchen/IMG-20240623-WA0001.jpg", out: "slides/interior-design-accent.jpg", longEdge: 1600 },

  { src: "commercial-projects/Commercial Shop Design 1.JPG", out: "slides/commercial-projects-hero.jpg", longEdge: 2560 },
  { src: "commercial-projects/Doctor room cabin interior commercial.JPG", out: "slides/commercial-projects-accent.jpg", longEdge: 1600 },

  { src: "hotel-design/6_1 - Photo.jpg", out: "slides/hotel-design-hero.jpg", longEdge: 2560 },
  { src: "hotel-design/6_10 - Photo.jpg", out: "slides/hotel-design-accent.jpg", longEdge: 1600 },

  // Hospital Design & Site Supervision now carry real poster-frame imagery —
  // no BlueprintSketch fallback needed anywhere in the slider any more.
  { src: "__poster__/hospital-design-poster-src.jpg", out: "slides/hospital-design-hero.jpg", longEdge: 2000 },
  { src: "__poster__/hospital-design-accent-src.jpg", out: "slides/hospital-design-accent.jpg", longEdge: 1600 },
  { src: "__poster__/process-foundation-src.jpg", out: "slides/site-supervision-hero.jpg", longEdge: 2000 },
  { src: "__poster__/process-structure-src.jpg", out: "slides/site-supervision-accent.jpg", longEdge: 1600 },

  // ---- "Index of work" filmstrip — texture, not a gallery -------------
  // Square crops, weighted toward the richer folders. No captions are ever
  // shown on these, so cropping tight for a strong thumbnail is fine even
  // where it would be too aggressive for a full photo elsewhere.
  ...[
    // front-elevation (rich) — 6
    "1_3 - Photo (2).jpg", "6_8 - Photo.jpg", "6_9 - Photo.jpg",
    "Front elevation 3.jpg", "IMG_2944.JPG", "IMG_7571.JPG",
  ].map((f, i) => ({ src: `front-elevation/${f}`, out: `filmstrip/fe-${String(i + 1).padStart(2, "0")}.jpg`, longEdge: 480, quality: 68, crop: "cover" })),

  ...[
    // interior-design, merged in from a separate category 2026-09-11 (rich) — 6
    // Two of these filenames collided with files already in interior-design/
    // when that category's files were physically moved in — the renamed
    // versions (numeric "-2" suffix) are used here.
    "1.jpg", "1_11 - Photo.jpg", "1_13 - Photo.jpg",
    "6_3 - Photo-2.jpg", "8-2.jpg", "IMG-20231012-WA0004.jpg",
  ].map((f, i) => ({ src: `interior-design/${f}`, out: `filmstrip/hd-${String(i + 1).padStart(2, "0")}.jpg`, longEdge: 480, quality: 68, crop: "cover" })),

  ...[
    // Modern Bedrooms (rich) — 5
    "1.jpg", "1_3 - Photo.jpg", "1_4 - Photo.jpg",
    "IMG-20260910-WA0141.jpg", "IMG-20260910-WA0178.jpg",
  ].map((f, i) => ({ src: `Modern Bedrooms/${f}`, out: `filmstrip/mb-${String(i + 1).padStart(2, "0")}.jpg`, longEdge: 480, quality: 68, crop: "cover" })),

  ...[
    // modern-kitchen (moderate) — 4
    "3_4 - Photo.jpg", "5_1 - Photo.jpg", "IMG-20240407-WA0001.jpg", "IMG-20240623-WA0000.jpg",
  ].map((f, i) => ({ src: `modern-kitchen/${f}`, out: `filmstrip/mk-${String(i + 1).padStart(2, "0")}.jpg`, longEdge: 480, quality: 68, crop: "cover" })),

  ...[
    // interior-design umbrella — the two files here that aren't duplicates
    // (by byte-identical size) of ones already used elsewhere — 2
    "1_1 - Photo.jpg", "1_5 - Photo.jpg",
  ].map((f, i) => ({ src: `interior-design/${f}`, out: `filmstrip/id-${String(i + 1).padStart(2, "0")}.jpg`, longEdge: 480, quality: 68, crop: "cover" })),

  // hotel-design (thin) — 1 (6_1/6_10 used in slides, 7.jpg duplicates the hero)
  { src: "hotel-design/6_9 - Photo.jpg", out: "filmstrip/htl-01.jpg", longEdge: 480, quality: 68, crop: "cover" },

  // commercial-projects (thin) — 1 (other two used in slides)
  { src: "commercial-projects/Commercial Shop Deisgn 2.JPG", out: "filmstrip/cp-01.jpg", longEdge: 480, quality: 68, crop: "cover" },

  // walkthroughs — video-poster-derived, light presence — 3
  { src: "__poster__/walkthrough-1-src.jpg", out: "filmstrip/wt-01.jpg", longEdge: 480, quality: 68, crop: "cover" },
  { src: "__poster__/walkthrough-2-src.jpg", out: "filmstrip/wt-02.jpg", longEdge: 480, quality: 68, crop: "cover" },
  { src: "__poster__/walkthrough-3-src.jpg", out: "filmstrip/wt-03.jpg", longEdge: 480, quality: 68, crop: "cover" },

  // site-supervision — video-poster-derived, light presence — 2
  // (the other two of the four posters are used by Services above)
  { src: "__poster__/process-finishing-src.jpg", out: "filmstrip/ss-01.jpg", longEdge: 480, quality: 68, crop: "cover" },
  { src: "__poster__/process-handover-src.jpg", out: "filmstrip/ss-02.jpg", longEdge: 480, quality: 68, crop: "cover" },

  // hospital-design — video-poster-derived, light presence — 1
  { src: "__poster__/hospital-design-accent-src.jpg", out: "filmstrip/hosp-01.jpg", longEdge: 480, quality: 68, crop: "cover" },
];

/** @type {VideoJob[]} */
const videos = [
  { src: "front-elevation/Front Elevation - Renovation Project.mp4", out: "proof-walkthrough.mp4" },

  // Real site-supervision footage for the Process section. Sizes (measured
  // at curation time, hardcoded into lib/content.ts as `sizeMB` next to each
  // entry — see the "global video rule" note there): foundation ~216MB,
  // structure ~18MB, finishing ~8MB, handover ~107MB.
  { src: "site-supervision/IMG_8776.mp4", out: "site-supervision/foundation.mp4" },
  { src: "site-supervision/IMG_5358.mp4", out: "site-supervision/structure.mp4" },
  { src: "site-supervision/IMG_7606.mov", out: "site-supervision/finishing.mp4" },
  { src: "site-supervision/IMG_8753.mp4", out: "site-supervision/handover.mp4" },
];

async function processImage({ src, out, longEdge, quality = 72, crop }) {
  const from = src.startsWith("__poster__/")
    ? path.join(SRC_POSTERS, src.replace("__poster__/", ""))
    : src.startsWith("__assets__/")
      ? path.join(SRC_ASSETS, src.replace("__assets__/", ""))
      : src.startsWith("__proof__/")
        ? path.join(SRC_PROOF, src.replace("__proof__/", ""))
        : path.join(SRC_PROJECTS, src);
  const to = path.join(OUT_IMG, out);

  if (!existsSync(from)) {
    console.error(`  ✗ MISSING SOURCE: ${src}`);
    return false;
  }

  await mkdir(path.dirname(to), { recursive: true });
  const pipeline = sharp(from).rotate(); // apply EXIF orientation, then strip it
  if (crop === "cover") {
    pipeline.resize({ width: longEdge, height: longEdge, fit: "cover", position: "attention" });
  } else {
    pipeline.resize({ width: longEdge, height: longEdge, fit: "inside", withoutEnlargement: true });
  }
  await pipeline.jpeg({ quality, mozjpeg: true, progressive: true }).toFile(to);

  const { size } = await stat(to);
  console.log(`  ✓ ${out.padEnd(42)} ${(size / 1024).toFixed(0).padStart(5)} KB`);
  return true;
}

async function processVideo({ src, out }) {
  const from = path.join(SRC_PROJECTS, src);
  const to = path.join(OUT_VIDEO, out);

  if (!existsSync(from)) {
    console.error(`  ✗ MISSING SOURCE: ${src}`);
    return false;
  }

  const { size } = await stat(from);
  if (size > VIDEO_SANITY_CEILING_BYTES) {
    console.error(
      `  ✗ ${src} is ${(size / 1048576).toFixed(1)} MB — exceeds the ${VIDEO_SANITY_CEILING_BYTES / 1048576}MB sanity ceiling. Skipped — check this is really meant to be served.`,
    );
    return false;
  }

  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
  console.log(`  ✓ ${out.padEnd(42)} ${(size / 1048576).toFixed(1).padStart(5)} MB (copied as-is; tap-to-play only, never preloaded)`);
  return true;
}

async function main() {
  console.log("Images:");
  let ok = 0, fail = 0;
  for (const job of images) {
    (await processImage(job)) ? ok++ : fail++;
  }

  console.log("\nVideo:");
  for (const job of videos) {
    (await processVideo(job)) ? ok++ : fail++;
  }

  console.log(`\n${ok} written, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main();
