#!/usr/bin/env node
/**
 * Media prep for the /projects page — the flagship, "show everything" page.
 * Unlike scripts/prepare-media.mjs (which curates a small, hand-picked subset
 * for Home/Contact), this script processes the ENTIRE inventory the client
 * asked to be shown: every photo and every video in every category folder,
 * no selection. It's the only thing that reads projects/ for this page.
 *
 * Output:
 *   public/assets/img/projects/<category>/<slug>.jpg     — every photo
 *   public/assets/video/projects/<category>/<slug>.mp4    — every video (as-is)
 *   public/assets/img/projects/<category>/<slug>-poster.jpg — every video's poster
 *   lib/generated/projects-media.json                     — the manifest
 *     lib/projects-content.ts imports this and layers category metadata,
 *     the "Interior Design" umbrella grouping, and the Featured Walkthroughs
 *     list on top of it.
 *
 * Video posters were captured by hand in-browser (scripts/_poster-src/ and
 * scripts/_poster-src/projects/ — see their file dates) since there's no
 * ffmpeg on this machine to extract frames any other way. This script only
 * resizes/copies posters that already exist there; it doesn't capture them.
 *
 * Two video files are byte-identical across two category folders
 * (client cross-referenced the same clip under two categories) — deduped
 * to a single copy under public/assets/video/projects/_shared/, referenced
 * from both category entries, rather than storing ~1GB twice.
 *
 * 2026-09-11 restructure: a category that used to stand on its own was
 * merged into the Interior Design umbrella — every one of its files was
 * physically moved into projects/interior-design/ (see the job list's
 * "interior-design folder" section below for the merge details). A separate
 * category was also renamed to "Commercial Projects" (category, folder and
 * output paths all consistently renamed).
 *
 * Usage: node scripts/prepare-projects-media.mjs
 */
import sharp from "sharp";
import { mkdir, copyFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const SRC_PROJECTS = path.join(ROOT, "projects");
const SRC_POSTERS = path.join(ROOT, "scripts", "_poster-src");
const OUT_IMG = path.join(ROOT, "public", "assets", "img", "projects");
const OUT_VIDEO = path.join(ROOT, "public", "assets", "video", "projects");
const OUT_JSON = path.join(ROOT, "lib", "generated", "projects-media.json");

const IMAGE_LONG_EDGE = 2200;
const POSTER_LONG_EDGE = 1600;
const IMAGE_QUALITY = 76;

const CATEGORY_LABELS = {
  "front-elevation": "Front Elevation",
  "interior-design": "Interior Design",
  "modern-bedroom": "Modern Bedroom",
  "hotel-design": "Hotel Design",
  "commercial-projects": "Commercial Projects",
  "hospital-design": "Hospital Design",
  "site-supervision": "Site Supervision",
};

const slugify = (name) =>
  path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * @typedef {{
 *   category: keyof typeof CATEGORY_LABELS,
 *   folder: string,
 *   file: string,
 *   kind: "image" | "video",
 *   poster?: string,        // filename inside scripts/_poster-src/ (or scripts/_poster-src/projects/, checked second)
 *   featured?: boolean,     // also surfaced in Featured Walkthroughs
 *   featuredOrder?: number, // lower sorts first in Featured Walkthroughs; ties/omitted fall back to job order
 *   dedupeKey?: string,     // videos sharing this key copy once, reused by all
 *   skip?: boolean,         // confirmed duplicate of another job's content — counter still increments (keeps every other slug stable), nothing else runs
 * }} Job
 */

/** @type {Job[]} */
const jobs = [
  // ---- Front Elevation — 16 photos + 9 videos ---------------------------
  // 2026-09-16 duplicate audit: "6_9 - Photo (1).jpg", "6_9 - Photo.jpg" and
  // "7.jpg" are byte-identical to files of the same name that also exist in
  // the hotel-design folder (the client's own archive has them saved in
  // both places) — kept in hotel-design only, since these renders read as
  // multi-storey hotel-style buildings, not single-family front elevations,
  // and hotel-design is the thinner category.
  ...[
    "1_3 - Photo (2).jpg", "1_3 - Photo-1.jpg", "6_8 - Photo.jpg", "6_9 - Photo (1).jpg",
    "6_9 - Photo.jpg", "7.jpg", "Design for House (101).jpg", "FB_IMG_1782568380788.jpg",
    "Front elevation 3.jpg", "IMG-20230921-WA0003.jpg", "IMG-20240514-WA0009.jpg",
    "IMG_2944.JPG", "IMG_5316.JPEG", "IMG_7567.JPG", "IMG_7571.JPG", "Old House (101).jpg",
  ].map((file) => ({
    category: "front-elevation", folder: "front-elevation", file, kind: "image",
    skip: ["6_9 - Photo (1).jpg", "6_9 - Photo.jpg", "7.jpg"].includes(file),
  })),
  { category: "front-elevation", folder: "front-elevation", file: "Front Elevation - Renovation Project.mp4", kind: "video", poster: "renovation-walkthrough-poster-src.jpg" },
  { category: "front-elevation", folder: "front-elevation", file: "Front elevation 2.mp4", kind: "video", poster: "fe-front-elevation-2.jpg" },
  // Confirmed (frame-for-frame, at 2026-09-16's duplicate audit) the same
  // clip as hospital-design's own "HOSPITAL WALKTHROUGH.mp4" — kept there
  // only, since it's literally hospital content. Was never featured itself.
  { category: "front-elevation", folder: "front-elevation", file: "HOSPITAL WALKTHROUGH.mp4", kind: "video", poster: "hospital-design-poster-src.jpg", dedupeKey: "hospital-walkthrough-full", skip: true },
  { category: "front-elevation", folder: "front-elevation", file: "IMG_3722 (1).MOV", kind: "video", poster: "fe-img3722.jpg" },
  { category: "front-elevation", folder: "front-elevation", file: "IMG_4142.MP4", kind: "video", poster: "fe-img4142.jpg" },
  // Confirmed the same clip as hospital-design's own "IMG_5723.MOV" (the
  // Gupta Hospital walkthrough) — kept there only; see that job for the
  // featured flag.
  { category: "front-elevation", folder: "front-elevation", file: "IMG_5723.MOV", kind: "video", poster: "shared-img5723.jpg", dedupeKey: "img5723-full", skip: true },
  // Confirmed the same clip as interior-design's walkthroughs copy
  // ("IMG_7166.mp4") — kept there only (that one is Featured).
  { category: "front-elevation", folder: "front-elevation", file: "IMG_7166.MOV", kind: "video", poster: "fe-img7166.jpg", skip: true },
  // Confirmed the same clip as Mansion.mp4 below (client's own archive had
  // it saved under both names) — kept as Mansion, the name the client
  // asked for by that name specifically.
  { category: "front-elevation", folder: "front-elevation", file: "RENDER VIDEO 1.mp4", kind: "video", poster: "fe-rendervideo1.jpg", skip: true },
  // Confirmed the same clip as interior-design's walkthroughs copy
  // ("VIDEO.mp4") — kept there only (that one is Featured).
  { category: "front-elevation", folder: "front-elevation", file: "VIDEO.mp4", kind: "video", poster: "fe-video.jpg", skip: true },
  // Appended (not inserted above) so existing slugs 17-25 above keep their
  // numbers — inserting mid-block would renumber every job after it and
  // orphan already-compressed/already-uploaded files at their old paths.
  { category: "front-elevation", folder: "front-elevation", file: "Mansion.mp4", kind: "video", poster: "fe-mansion.jpg", featured: true, featuredOrder: 1 },

  // ---- Modern Bedroom (17+1) — its own category, not merged into Interior
  // Design — the folder exists as its own thing on disk and the client
  // expects it filterable as its own thing on the page too.
  // 2026-09-16 duplicate audit: "IMG_2964.JPG" is a near-identical re-export
  // of "IMG-20260910-WA0141.jpg" below (same frame, dHash distance 0) — kept
  // the WA0141 copy only. "IMG-20240401-WA0000.jpg" is the same camera
  // angle as "1_1 - Photo (1).jpg" above with just the wardrobe finish
  // swapped (wood vs beige) — a deliberate material variant, not an
  // accidental duplicate, but the client asked to keep only one; kept the
  // wood one.
  ...[
    "1.jpg", "1_1 - Photo (1).jpg", "1_3 - Photo.jpg", "1_4 - Photo.jpg", "1_5 - Photo-1.jpg",
    "26934e43f5f4f37b1120c332ecaa0ace.jpg", "IMG-20231026-WA0038.jpg", "IMG-20240401-WA0000.jpg",
    "IMG-20260910-WA0141.jpg", "IMG-20260910-WA0142.jpg", "IMG-20260910-WA0161.jpg",
    "IMG-20260910-WA0178.jpg", "IMG-20260910-WA0180.jpg", "IMG-20260910-WA0182.jpg",
    "IMG-20260910-WA0184.jpg", "IMG_2964.JPG", "IMG_2974.JPG",
  ].map((file) => ({
    category: "modern-bedroom", folder: "Modern Bedrooms", file, kind: "image",
    skip: file === "IMG_2964.JPG" || file === "IMG-20240401-WA0000.jpg",
  })),
  { category: "modern-bedroom", folder: "Modern Bedrooms", file: "VID-20260910-WA0197.mov", kind: "video", poster: "mb-vid0197.jpg" },

  // ---- Interior Design umbrella — Modern Kitchen (11+1) ------------------
  // 2026-09-16 — client flagged a kitchen photo repeating in the grid:
  // "IMG-20230928-WA0009.jpg" turned out to be the same camera angle as
  // "5_2 - Photo.jpg" a few lines up (same countertop, same fridge position,
  // same window — essentially the same shot, not a different angle of the
  // room). Client's own distinction: different angles of the same room are
  // fine to keep, near-identical repeats of the same angle are not — this
  // is the latter, so it's skipped, not the former.
  // "3_4 - Photo.jpg" is the same camera angle as the merged-in "1_4 -
  // Photo-1.jpg" below (interior-design category, gray-vs-green cabinets +
  // cream-vs-marble floor) — a deliberate finish variant, but too
  // repetitive to keep both; client asked to keep the green/marble one.
  ...[
    "3_4 - Photo.jpg", "5_1 - Photo.jpg", "5_2 - Photo.jpg", "FB_IMG_1737491358614.jpg",
    "IMG-20230928-WA0009.jpg", "IMG-20240407-WA0001.jpg", "IMG-20240407-WA0003.jpg",
    "IMG-20240411-WA0018.jpg", "IMG-20240623-WA0000.jpg", "IMG-20240623-WA0001.jpg",
    "IMG-20240623-WA0005.jpg",
  ].map((file) => ({
    category: "interior-design", folder: "modern-kitchen", file, kind: "image",
    skip: file === "IMG-20230928-WA0009.jpg" || file === "3_4 - Photo.jpg",
  })),
  // Confirmed the same clip as the walkthroughs copy below — kept there
  // only (that one is Featured).
  { category: "interior-design", folder: "modern-kitchen", file: "IMG_4146.mp4", kind: "video", poster: "mk-img4146.jpg", skip: true },

  // ---- Interior Design umbrella — interior-design folder (31+1) ----------
  // A second category was merged into this one at the source level on
  // 2026-09-11 (25 photos + 1 video) — every one of its files was physically
  // moved into projects/interior-design/ (see the top-of-file note). Four
  // filenames collided with files already here (all four are byte-identical
  // duplicates of the originals, not new content) and were renamed with a
  // numeric "-2" suffix at move time so nothing was lost or overwritten;
  // those renamed entries are marked below.
  // 2026-09-16 duplicate audit — on top of the four renamed "-2" collisions
  // already called out above (confirmed byte-identical to their originals,
  // as the original comment already suspected), several more filenames
  // that DIDN'T collide on disk (different name or different folder, so
  // nothing forced a rename) turned out to be byte-identical or
  // frame-identical content anyway:
  //   "6_4 - Photo.jpg" duplicates "6_4 - Photo (1).jpg" above (both were
  //     already in this folder pre-merge, and were already duplicates of
  //     each other before anything was moved in)
  //   "1.jpg" duplicates Modern Bedroom's own "1.jpg" (kept there — it's a
  //     bedroom render, not a generic interior shot)
  //   "1_14 - Photo.jpg" duplicates "1_14 - Photo (1).jpg" a few lines up
  //   "5_1 - Photo.jpg" / "5_2 - Photo.jpg" duplicate Modern Kitchen's own
  //     files of the same name a block above (same photo, saved into both
  //     subfolders under matching names)
  //   "IMG-20230928-WA0009.jpg" duplicates Modern Kitchen's copy of the same
  //     name, which is itself now skipped too (2026-09-16 — it turned out to
  //     duplicate Modern Kitchen's own "5_2 - Photo.jpg" instead, see that
  //     block's comment) — this entry is redundant either way
  //   "IMG-20240409-WA0000.jpg" and "IMG-20240410-WA0004.jpg" are
  //     near-identical re-exports (dHash) of "IMG-20240407-WA0001.jpg"
  //     (Modern Kitchen) and "IMG-20240407-WA0002.jpg" (below) respectively
  ...[
    "1_1 - Photo.jpg", "1_5 - Photo.jpg", "6_3 - Photo.jpg", "6_4 - Photo (1).jpg", "6_4 - Photo.jpg", "8.jpg",
    // — merged-in files, moved from the now-retired category --------------
    "1.1_3 - Photo.jpg", "1.jpg", "1_11 - Photo.jpg", "1_12 - Photo.jpg", "1_13 - Photo.jpg",
    "1_14 - Photo (1).jpg", "1_14 - Photo.jpg", "1_4 - Photo-1.jpg", "1_5 - Photo (2).jpg",
    "1_7 - Photo.jpg", "5_1 - Photo.jpg", "5_2 - Photo.jpg",
    "6_3 - Photo-2.jpg",         // renamed on move — collided with 6_3 - Photo.jpg above
    "6_4 - Photo (1)-2.jpg",     // renamed on move — collided with 6_4 - Photo (1).jpg above
    "6_4 - Photo-2.jpg",         // renamed on move — collided with 6_4 - Photo.jpg above
    "8-2.jpg",                   // renamed on move — collided with 8.jpg above
    "IMG-20230825-WA0000.jpg", "IMG-20230928-WA0009.jpg", "IMG-20231012-WA0004.jpg", "IMG-20231012-WA0005.jpg",
    "IMG-20231224-WA0007.jpg", "IMG-20240407-WA0002.jpg", "IMG-20240409-WA0000.jpg",
    "IMG-20240410-WA0003.jpg", "IMG-20240410-WA0004.jpg",
  ].map((file) => ({
    category: "interior-design", folder: "interior-design", file, kind: "image",
    skip: [
      "6_4 - Photo.jpg",
      "1.jpg",
      "1_14 - Photo.jpg",
      "5_1 - Photo.jpg",
      "5_2 - Photo.jpg",
      "6_3 - Photo-2.jpg",
      "6_4 - Photo (1)-2.jpg",
      "6_4 - Photo-2.jpg",
      "8-2.jpg",
      "IMG-20230928-WA0009.jpg",
      "IMG-20240409-WA0000.jpg",
      "IMG-20240410-WA0004.jpg",
    ].includes(file),
  })),
  // Confirmed the same clip as the walkthroughs copy below — kept there
  // only (that one is Featured).
  { category: "interior-design", folder: "interior-design", file: "RENDER VIDEO.mp4", kind: "video", poster: "hd-rendervideo.jpg", skip: true },

  // ---- Interior Design umbrella — Walkthroughs (0+10) — also Featured ---
  { category: "interior-design", folder: "walkthroughs", file: "1000315067_edited.mp4", kind: "video", poster: "walkthrough-1-src.jpg", featured: true },
  { category: "interior-design", folder: "walkthroughs", file: "1000332590_edited.mp4", kind: "video", poster: "wt-1000332590.jpg", featured: true },
  // Confirmed the same clip as hospital-design's own "HOSPITAL
  // WALKTHROUGH.mp4" — kept there only, since it's literally hospital
  // content; that copy is not itself Featured, so dropping this one drops
  // it from Featured Walkthroughs too (was position 5, duplicating position
  // 13 exactly — the client's own report).
  { category: "interior-design", folder: "walkthroughs", file: "HOSPITAL WALKTHROUGH.mp4", kind: "video", poster: "wt-hospitalwalkthrough.jpg", skip: true },
  { category: "interior-design", folder: "walkthroughs", file: "IMG_4146.mp4", kind: "video", poster: "walkthrough-2-src.jpg", featured: true },
  { category: "interior-design", folder: "walkthroughs", file: "IMG_7166.mp4", kind: "video", poster: "wt-img7166.jpg", featured: true },
  { category: "interior-design", folder: "walkthroughs", file: "IMG_7462.mp4", kind: "video", poster: "wt-img7462.jpg", featured: true },
  { category: "interior-design", folder: "walkthroughs", file: "IMG_8734.mp4", kind: "video", poster: "wt-img8734.jpg", featured: true },
  { category: "interior-design", folder: "walkthroughs", file: "RENDER VIDEO.mp4", kind: "video", poster: "wt-rendervideo.jpg", featured: true },
  { category: "interior-design", folder: "walkthroughs", file: "Snapinsta.app_video_AQOPn0eTcqDUYZ1EG_VHTSwy89uif3PYt90MCIm4zxZ-BGQBwzBtDJiU9DwU6gX00LYquiL4oG0Q0xouCo5MgJBbbuZodJX9Q1w1rx0.mp4", kind: "video", poster: "wt-snapinsta.jpg", featured: true },
  { category: "interior-design", folder: "walkthroughs", file: "VIDEO.mp4", kind: "video", poster: "walkthrough-3-src.jpg", featured: true },

  // ---- Hotel Design — 4 photos -------------------------------------------
  // 2026-09-16 site-wide audit: "7.jpg" is the same camera angle as
  // interior-design's front-elevation dusk render — wait, actually it's a
  // same-angle color/lighting variant of itself: this hotel-design "7.jpg"
  // and "6_10 - Photo.jpg" are the same building render, one with warmer
  // golden lighting, one muted with an added rock feature. Client's call:
  // keep the better one (6_10, warmer/more inviting), drop this one — not
  // an accidental duplicate, a deliberate lighting variant, but too
  // repetitive to keep both in a 4-photo category.
  ...["6_1 - Photo.jpg", "6_10 - Photo.jpg", "6_9 - Photo.jpg", "7.jpg"].map((file) => ({
    category: "hotel-design", folder: "hotel-design", file, kind: "image",
    skip: file === "7.jpg",
  })),

  // ---- Commercial Projects — 3 photos ------------------------------------
  // Renamed 2026-09-11 (previously a differently-named category) — both the
  // category and its raw source folder were renamed together.
  ...["Commercial Shop Deisgn 2.JPG", "Commercial Shop Design 1.JPG", "Doctor room cabin interior commercial.JPG"].map(
    (file) => ({ category: "commercial-projects", folder: "commercial-projects", file, kind: "image" }),
  ),

  // ---- Hospital Design — 2 videos ----------------------------------------
  { category: "hospital-design", folder: "hospital-design", file: "HOSPITAL WALKTHROUGH.mp4", kind: "video", poster: "hospital-design-poster-src.jpg", dedupeKey: "hospital-walkthrough-full", featured: true },
  // The Gupta Hospital walkthrough — client-requested by exact path
  // (projects/hospital-design/IMG_5723.MOV), added to Featured Walkthroughs.
  { category: "hospital-design", folder: "hospital-design", file: "IMG_5723.MOV", kind: "video", poster: "shared-img5723.jpg", dedupeKey: "img5723-full", featured: true },

  // ---- Site Supervision — 4 videos ---------------------------------------
  { category: "site-supervision", folder: "site-supervision", file: "IMG_8776.mp4", kind: "video", poster: "process-foundation-src.jpg" },
  { category: "site-supervision", folder: "site-supervision", file: "IMG_5358.mp4", kind: "video", poster: "process-structure-src.jpg" },
  { category: "site-supervision", folder: "site-supervision", file: "IMG_7606.mov", kind: "video", poster: "process-finishing-src.jpg" },
  { category: "site-supervision", folder: "site-supervision", file: "IMG_8753.mp4", kind: "video", poster: "process-handover-src.jpg" },
];

function resolvePoster(name) {
  const direct = path.join(SRC_POSTERS, name);
  if (existsSync(direct)) return direct;
  const nested = path.join(SRC_POSTERS, "projects", name);
  if (existsSync(nested)) return nested;
  return null;
}

async function processImage(from, to, longEdge, quality) {
  await mkdir(path.dirname(to), { recursive: true });
  const info = await sharp(from)
    .rotate()
    .resize({ width: longEdge, height: longEdge, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toFile(to);
  return { width: info.width, height: info.height };
}

const videoCopyCache = new Map(); // dedupeKey -> public src path

async function main() {
  const manifest = [];
  const counters = {}; // per-category running index for alt text + slugs
  let ok = 0, fail = 0;

  for (const job of jobs) {
    const from = path.join(SRC_PROJECTS, job.folder, job.file);
    if (!existsSync(from)) {
      console.error(`✗ MISSING SOURCE: ${job.folder}/${job.file}`);
      fail++;
      continue;
    }

    const label = CATEGORY_LABELS[job.category];
    counters[job.category] = (counters[job.category] ?? 0) + 1;
    const n = counters[job.category];
    const slug = `${String(n).padStart(2, "0")}-${slugify(job.file)}`;

    if (job.skip) {
      // Counter above still increments — every other slug in this category
      // keeps its existing number — but nothing is copied/processed and no
      // manifest entry is written. Used for confirmed duplicate content
      // (the client's own archive had the same clip saved under two
      // filenames/folders); see the comment on each skipped job for which
      // surviving entry it duplicates.
      console.log(`⊘ skip  ${job.category}/${slug}  (${job.folder}/${job.file})`);
      continue;
    }

    if (job.kind === "image") {
      const to = path.join(OUT_IMG, job.category, `${slug}.jpg`);
      const { width, height } = await processImage(from, to, IMAGE_LONG_EDGE, IMAGE_QUALITY);
      manifest.push({
        id: `${job.category}-${slug}`,
        category: job.category,
        kind: "image",
        src: `/assets/img/projects/${job.category}/${slug}.jpg`,
        alt: `${label} — photo ${n}`,
        width,
        height,
      });
      console.log(`✓ img  ${job.category}/${slug}  ${width}x${height}`);
      ok++;
      continue;
    }

    // video
    const { size: rawSize } = await stat(from);

    let publicVideoSrc = job.dedupeKey ? videoCopyCache.get(job.dedupeKey) : undefined;
    let videoOutSize = null;
    if (!publicVideoSrc) {
      const videoOut = job.dedupeKey
        ? path.join(OUT_VIDEO, "_shared", `${job.dedupeKey}.mp4`)
        : path.join(OUT_VIDEO, job.category, `${slug}.mp4`);
      await mkdir(path.dirname(videoOut), { recursive: true });
      // Skip the copy if this output already exists — a prior run may have
      // compressed it in place (scripts/compress-videos.mjs) and blindly
      // recopying the raw source here would silently overwrite that work
      // every time the manifest is regenerated (hit for real: a 5.3GB ->
      // 0.24GB compression pass got undone this way once already).
      if (existsSync(videoOut)) {
        videoOutSize = (await stat(videoOut)).size;
      } else {
        await copyFile(from, videoOut);
      }
      publicVideoSrc = job.dedupeKey
        ? `/assets/video/projects/_shared/${job.dedupeKey}.mp4`
        : `/assets/video/projects/${job.category}/${slug}.mp4`;
      if (job.dedupeKey) videoCopyCache.set(job.dedupeKey, publicVideoSrc);
    }
    // sizeMB should reflect what actually ships. If the output already
    // existed (already compressed), use its real size; only brand-new
    // copies (not yet run through compress-videos.mjs) fall back to the
    // raw source size, which compress-videos.mjs will shrink afterward —
    // re-run scripts/prepare-projects-media.mjs's sizeMB sync (or
    // compress-videos.mjs's own log) to correct it once that's done.
    const sizeMB = Math.round((videoOutSize ?? rawSize) / 1048576);

    const posterFrom = job.poster ? resolvePoster(job.poster) : null;
    let posterSrc = null, posterW = 0, posterH = 0;
    if (posterFrom) {
      const posterOut = path.join(OUT_IMG, job.category, `${slug}-poster.jpg`);
      const dims = await processImage(posterFrom, posterOut, POSTER_LONG_EDGE, 78);
      posterSrc = `/assets/img/projects/${job.category}/${slug}-poster.jpg`;
      posterW = dims.width;
      posterH = dims.height;
    } else {
      console.error(`  ⚠ no poster source found for ${job.poster} (${job.folder}/${job.file})`);
    }

    manifest.push({
      id: `${job.category}-${slug}`,
      category: job.category,
      kind: "video",
      src: publicVideoSrc,
      poster: posterSrc,
      alt: `${label} — video ${n}`,
      width: posterW,
      height: posterH,
      sizeMB,
      featured: !!job.featured,
      featuredOrder: job.featuredOrder,
    });
    console.log(`✓ video ${job.category}/${slug}  ${sizeMB}MB  poster ${posterW}x${posterH}${job.dedupeKey ? "  [deduped: " + job.dedupeKey + "]" : ""}`);
    ok++;
  }

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(manifest, null, 2));

  console.log(`\n${ok} written, ${fail} failed. Manifest: ${OUT_JSON} (${manifest.length} items)`);
  const byCategory = {};
  for (const m of manifest) byCategory[m.category] = (byCategory[m.category] ?? 0) + 1;
  console.log("Per category:", byCategory);
  if (fail > 0) process.exitCode = 1;
}

main();
