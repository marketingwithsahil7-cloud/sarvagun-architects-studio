# Sarvagun Architects Studio — website

Marketing site for Sarvagun Architects Studio (Apoorv Gupta, Saharanpur). All 4
planned pages are built: **Home** (`/`), **Contact** (`/contact`), **Projects**
(`/projects`) and **About** (`/about`).

Portfolio-driven: the job of the page is to convince visitors that a Sarvagun
drawing and a Sarvagun building are the same object, then let them browse real
project categories — and it now draws on a much larger slice of the real archive
than the first pass did (see "Media density pass" below).

## Pages

- **`/`** (`app/page.tsx`) — Home.
- **`/contact`** (`app/contact/page.tsx`) — added 2026-09-11, see "Contact page" below.
- **`/projects`** (`app/projects/page.tsx`) — added 2026-09-11, see "Projects page" below.
- **`/about`** (`app/about/page.tsx`) — added 2026-09-11, see "About page" below.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — layout + utilities only
- **GSAP + ScrollTrigger** — scroll-driven motion (`@gsap/react` `useGSAP`)
- **Lenis** — smooth scroll, bridged to the GSAP ticker in `components/SmoothScroll.tsx`
- **sharp** (devDependency) — one-off media downsizing, see below
- **yet-another-react-lightbox** — the `/projects` lightbox viewer, see "Projects page" below

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Media pipeline

The client's full media archive (**8.3 GB**) lives in repo-root `projects/<category>/`
and is **never served directly** — Next can't reach outside `public/`, and most of it
is multi-hundred-MB 4K video that's unusable on mobile data if fetched carelessly.

`scripts/prepare-media.mjs` is the only thing that reads `projects/`. It writes into
`public/assets/`:

- **Images** — resized/cropped with `sharp`. ~5 MB total across hero, proof, services
  thumbnails, slider slides, and the 31-image "Index of work" filmstrip.
- **Video** — copied as-is (already H.264/AAC, already reasonably sized) into
  `public/assets/video/`. **~359 MB total**, but every one of these is served only
  behind an explicit tap — see "Global video rule" below. There is no hard size
  ceiling any more (there used to be a 12 MB one); the real protection is that
  nothing this large is ever fetched on page load.

Re-run it any time the curated list in the script changes:

```bash
node scripts/prepare-media.mjs
```

`scripts/_poster-src/` holds JPEGs captured in-browser from source videos (no
ffmpeg on this machine to extract frames any other way — see its own header
comment for the technique). Treat it as a source directory, not build output.

### Media density pass (2026-09-11)

The first build used a small fraction of the real client inventory. This pass adds:

- **`components/IndexFilmstrip.tsx`** — a new "Index of work" section (between
  Services and the Portfolio slider) — a continuously auto-scrolling row of 31
  square thumbnails sampled across categories, weighted toward the richer folders
  (front-elevation, interior-design, Modern Bedrooms, modern-kitchen), with a lighter
  presence from video-poster-derived thumbnails and the thinner categories. Pauses
  on hover/touch/drag (native `overflow-x-auto`, not a transform marquee, so manual
  scroll/swipe just works). Deliberately outside the GSAP reveal system — it's a
  self-contained ambient loop, not a scroll reveal — but still respects
  `prefers-reduced-motion` on its own.
- **Services** (`components/Services.tsx`) — every one of the 7 rows now carries a
  real thumbnail (`sheet.thumb` in `lib/content.ts`), sized so the row's height is
  still governed by the text, never the image.
- **Process** (`components/Process.tsx`) — the four steps now play real
  site-supervision footage (`step.media`, `kind: "video"`) instead of
  `BlueprintSketch` placeholders. Frames were hand-picked by scrubbing all four
  source clips in-browser, not guessed: Foundation & piling = exposed rebar under
  weatherproofing wrap, Structure = an RCC staircase mid-pour, Facade & finishing =
  a false ceiling at plaster stage (captioned "Living Area Ceiling" in-camera),
  Handover = the same home finished and furnished.
- **Portfolio slider** — Hospital Design and Site Supervision (`lib/content.ts`)
  now use real poster-frame stills instead of `BlueprintSketch`. Every slide in the
  slider shows real client content; `BlueprintSketch`/the `sketch` `Media` kind
  stay wired up in `MediaFrame.tsx` as dormant infrastructure for the day a
  category goes empty again, but nothing currently uses it.

## Blob media migration (2026-09-13)

`public/assets/img/` and `public/assets/video/` are no longer part of the
deployed app. They're `.vercelignore`d and `.gitignore`d entirely; every
media reference across `lib/content.ts`, `lib/about-content.ts` and
`lib/generated/projects-media.json` now points at a **Vercel Blob** URL
(`https://kvhecfpr65miiajz.public.blob.vercel-storage.com/...`) instead of a
local path. This is what took the CLI's deploy upload from failing outright
(hundreds of MB, multiple files over the CLI's 100 MB single-file limit) to
**~292 KB**.

**Why compression came first, not a storage upgrade.** The curated media set
was 5.27 GB, blowing well past Vercel Blob's Hobby-plan 1 GB cap — the
first instinct was to upgrade to Blob Pro. Instead, every video was audited
with `ffprobe` first: most were straight-from-camera exports, several 4K at
bitrates up to **105 Mbps** (`hospital-walkthrough-full.mp4`), nowhere near
web-appropriate for talking-through-a-house walkthrough footage.
`scripts/compress-videos.mjs` re-encoded all 31 files — H.264, capped at
1080p (`scale=...:force_original_aspect_ratio=decrease`), CRF 27, AAC
96k audio, `+faststart` — destructively replacing each original only after
verifying its compressed output first (guards against a corrupted/partial
result). Result: **5.27 GB → 0.23 GB, a 96% reduction**, comfortably under
the Hobby 1 GB limit with room to spare (final upload was ~258 MB: 25 MB
images + 233 MB video) — no paid plan or third-party storage (Cloudflare R2
was the fallback plan) ended up necessary. Quality was spot-checked by
extracting matching frames from a large original and its CRF-27 output
before committing to the full batch — visually indistinguishable at normal
viewing size.

**Upload architecture** (`scripts/upload-to-blob.mjs`): shells out to
`npx vercel blob put` per file (not the `@vercel/blob` SDK's `put()`
directly) — this coding environment redacts secret-shaped values read from
`.env.local` to `[SENSITIVE]` on disk for *any* reading process, so the raw
`BLOB_READ_WRITE_TOKEN` was never obtainable in-script; shelling out to the
already-authenticated CLI sidesteps that entirely. Writes
`scripts/generated/blob-map.json` (local path → Blob URL) incrementally
after every successful upload, so an interrupted run resumes instead of
re-uploading. `scripts/apply-blob-map.mjs` then rewrites every reference
from that map — literal substring replacement for static `src` values, a
targeted regex for the filmstrip's template-literal-constructed paths, and
a JSON walk for the generated projects manifest.

**Quota gotcha:** after compression, a fresh upload attempt *still* hit the
1 GB quota error, because the store still held ~1 GB+ of stale
pre-compression blobs from an earlier interrupted run — Vercel's quota
check happens before an overwrite can free the old space. Fixed with
`npx vercel blob empty-store -y` (175 stale blobs deleted) before
re-uploading clean.

**`sizeMB` gotcha:** `VideoPoster.tsx`'s tiered gate (see "Global video
rule" below) reads a hardcoded `sizeMB` per video in `lib/content.ts` /
`lib/generated/projects-media.json`, recorded at original (pre-compression)
file size. Compression invalidated every one of those numbers — e.g. the
Process section's foundation video still claimed "~216MB" after shrinking
to 15 MB. Recomputed every `sizeMB` from the actual compressed file on disk
(via `blob-map.json` → local path → `fs.statSync`) as a one-off pass; no
video in the current set exceeds ~17 MB, so the 50 MB/200 MB gate tiers
currently have no triggering content — every video now shows a plain "Tap
to play". The gate logic itself is untouched and will re-activate the
moment a future upload crosses those thresholds.

To re-run this pipeline end to end after adding new media: `prepare-media.mjs`
→ `compress-videos.mjs` (if new video) → `upload-to-blob.mjs` →
`apply-blob-map.mjs`.

## Design system (see `app/globals.css` + `tailwind.config.ts`)

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#0A0908` | base background |
| `panel` | `#141209` | raised panels, media wells |
| `ivory` | `#EDE7DA` | primary text |
| `dim` | `#B3AC9B` | secondary text |
| `burnt` | `#E2672B` | CTAs, index numerals, thin rules, corner crosshairs — **accent only, never a fill** |

- **Display type:** Fraunces (variable, `SOFT`/`WONK`/`opsz`), `.font-display`
- **UI/body type:** Archivo
- **Section transitions:** `DimensionLine` — hairline + end ticks + burnt index + label.
  Sections are numbered 01–07 in page order (Proof, Services, Index of work,
  Portfolio, Process, Service areas, Closing CTA).
- **Blueprint-grid texture:** one fixed `body::before` layer, 7% opacity — drafting paper.
- **Registration crosshairs:** `CornerMarks`, on every feature image.
- **Services:** drawing-sheet references (`A-01`…`A-07`), an index list, not cards.
- **Portfolio:** `ProjectSlider` — one big frame + a small offset accent, not a grid.
- **Missing media:** `BlueprintSketch` — hand-coded SVG line drawings, never a stock
  photo (currently dormant — every section has real media as of this pass).

### Shared gutter — the one source of truth

Every section's horizontal inset comes from **`.shell`** (`app/globals.css`):
`padding-inline: clamp(1.25rem, 5vw, 4.5rem)` — 20px on a 360–390px phone, up to 72px
on desktop. Every section root uses the `shell` class; nothing else should ever
declare its own left/right page-edge padding. The three other `px-[clamp(1.25rem,
5vw,4.5rem)]` occurrences in the codebase (`Header.tsx`'s mobile menu, `Hero.tsx`'s
scroll hint, `IndexFilmstrip.tsx`'s track) are copies of the *same* value for
elements that structurally can't use `.shell` itself (a flex/overflow track, an
absolutely-positioned hint) — not a second source of truth, just the identical
token spelled out because it isn't extracted into a CSS custom property. If it
ever needs to change, that's four places, not one — worth a `--gutter` var if this
recurs.

**2026-09-13 alignment audit:** a reported "shifted right on mobile" bug turned out
to be two sections that padded their *content* inward to reserve room for a
decorative marker (`Process.tsx`'s rail dots, `Testimonials.tsx`'s review stamp),
rather than hanging the marker in negative space outside the shared gutter. Both
independently invented a local `pl-*` instead of reusing `.shell`'s box model,
which put their text 36–48px (Process) and 40px (Testimonials) right of every
other section's content. Fixed in both by removing the local padding and
positioning the marker with a negative offset instead, so the text's left edge is
identical to the rest of the page again. Confirmed by measuring `getBoundingClientRect().left`
against a page-wide sample of headings/rows/quotes at 375/390/1440px — everything
now lands on the same x. The blueprint-grid background and thumbnail/text gap
symmetry were also audited and are fine (the grid is a `position:fixed;inset:0`
layer independent of any content padding; media wells already mirror their row's
own gutter).

## Motion system

**Unchanged in this pass** — untouched by design, per the brief for the media-density
update. Two "bold" moments only:

1. **Hero** (`components/Hero.tsx`) — background facade parallax (`next/image`, wrapper
   transformed, never the `<img>` itself).
2. **Proof** (`components/Proof.tsx`) — the render/built comparison tilts flat on scroll,
   desktop only (`gsap.matchMedia`, ≥1024px).

Everything else is the page's signature **focus-pull reveal**: elements enter
slightly blurred and low-opacity, then sharpen — not a slide-up. One
`ScrollTrigger.batch` in `components/RevealDirector.tsx` drives every
`[data-reveal]` node on the page (capped at `batchMax: 3` concurrent blurs — blur is
GPU-expensive, and that's the mid-range-Android budget). `components/Reveal.tsx`
itself is an inert marker; pass `blur` only on ~section-level blocks. The new
`IndexFilmstrip` is intentionally *not* part of this system (see above).

Desktop-only pointer affordances (`components/PointerFX.tsx`): a cursor-tracking
glow, a "View" label over project media (`data-cursor="view"`), and a magnetic pull
on CTAs (`data-magnet`). Gated at the **component level** — on mobile/touch it
renders nothing, not just hides via CSS. Mobile equivalents: a `lg:hidden` corner
tag instead of the label, `:active{scale:.97}` instead of the magnet.

`prefers-reduced-motion` is respected everywhere: Lenis, PointerFX and
RevealDirector each independently gate on it, and `app/globals.css` carries a CSS
backstop that forces every reveal target to full opacity/no blur/no transform.

**2026-09-13 fix — blank page on client-side `<Link>` navigation:** `RevealDirector`
and `PointerFX` are both mounted once at the layout level (inside `SmoothScroll`,
which wraps `{children}` in `app/layout.tsx`), and the App Router persists that
layout across client-side navigations — only the page content inside it swaps.
`RevealDirector`'s `ScrollTrigger.batch("[data-reveal]", ...)` scan originally ran
in a `useGSAP(() => {...}, [])` with an empty dependency array — a one-time scan of
whatever `[data-reveal]` nodes existed at first load. Every reveal element starts
at `opacity: 0` via CSS (`.mo [data-reveal]`, see above) until this batch's
`onEnter` sets an inline `opacity: 1`; a page reached only through `<Link>`
navigation never got scanned, so its elements stayed permanently invisible —
fixed only by a hard refresh, which remounts the whole layout and re-runs the
scan. Fixed by keying the effect on `usePathname()` with
`useGSAP(callback, { dependencies: [pathname], revertOnUpdate: true })` —
`revertOnUpdate` makes `useGSAP` revert the previous run's `gsap.context` (killing
the old `matchMedia` instance and its `ScrollTrigger.batch` triggers via their own
returned cleanup functions) before re-running the callback against the new page's
DOM on every route change. `PointerFX` does **not** have this bug: its cursor
glow/view-label/magnet listeners are attached once to `window`/`document` and
resolve their targets via `e.target.closest(...)` at event time, always against
whatever's currently in the DOM — no stale element references to go stale.

No video anywhere autoplays or preloads, on any breakpoint, **regardless of file
size** — this was already the rule and stays absolute. `components/VideoPoster.tsx`
mounts no `<video>` element at all until the visitor taps; the poster is a plain
`next/image`.

**Extended in this pass:** any video whose file is roughly 50MB or larger shows its
approximate size next to the "Tap to play" control (e.g. "Tap to play · ~80MB"),
via `Media`'s optional `sizeMB` field (hardcoded in `lib/content.ts`, measured at
curation time — see the comment next to `process.steps`). **As of the 2026-09-13
Blob migration, no video in the current set exceeds ~17MB after compression**, so
every video currently shows a plain "Tap to play" — the 50MB/200MB tiers stay
wired up (see "Blob media migration" above) and will re-activate for future,
larger uploads.

## Content

All copy and project data live in `lib/content.ts`. `Media` is a discriminated
union (`image` / `video` / `sketch`) — swapping a placeholder for real client
media later is a one-line edit there, no component changes. `filmstrip` is a flat
`Media[]` consumed by `IndexFilmstrip.tsx`.

## Contact page (2026-09-11)

`/contact` reuses every Home design/motion token as-is — same palette, type
pairing, `DimensionLine`/`CornerMarks`/blueprint-grid language, focus-pull reveal,
and desktop-only `PointerFX` (magnetic buttons, no cursor glow on mobile/touch).
No video on this page. Section numbering (01–03) is scoped to this page, not a
continuation of Home's 01–07 — a visitor can land here directly.

- **`components/ContactIntro.tsx`** — the page's `<h1>` (Contact has no Hero above
  it to carry one).
- **`components/ContactSplit.tsx`** — direct-contact info + `components/AreaChips.tsx`
  (the same six-city chip pattern from Home's `ServiceAreas.tsx`, extracted into its
  own component so Contact can reuse it without editing that Home file) + the form,
  next to a real project photo (`front-elevation-hero.jpg`, already in `public/` —
  reused from the Home slider, no new media processing needed) with `CornerMarks`.
  Mobile DOM order is info → photo → form, so the page never reads as a bare form
  while scrolling; a `lg:` grid re-splits it into two columns.
- **`components/ContactForm.tsx`** — Name / Phone / City / Project type / Message
  (optional). **No backend** — `buildEnquiryWhatsAppUrl()` in `lib/content.ts`
  formats the values into a readable message and the submit handler opens
  `wa.me/918006000250?text=…`. Opens a new tab on `(hover: hover) and
  (pointer: fine)` (the same capability check `PointerFX.tsx` already uses, not a
  UA sniff); navigates the same tab otherwise, since that's where the WhatsApp app
  takes over. Verified manually: correct number, correct `encodeURIComponent`
  encoding (spaces → `%20`, newlines → `%0A`, the em dash → `%E2%80%94`), optional
  Message line omitted when empty, native `required` blocks incomplete submits
  before the handler runs.
- **`components/Testimonials.tsx`** — the four Google reviews, verbatim, separated
  by `DimensionLine` (not repeated per quote — "5.0 · 86 reviews, Google" states
  once, at the top). Star rows replaced with a small square-outline + tick "sign-off
  stamp" (`ReviewStamp`, inline SVG), echoing the site-supervision/QA language from
  Home's Process section rather than a generic rating widget.

**Email and a second phone number are deliberately not wired in.** Both were
surfaced from the same video end-card as the confirmed WhatsApp number, but the
client has since said only the primary WhatsApp number is confirmed. Rather than
touch the shared `studio` object (which would also change Home's already-live
Footer), Contact gets its own `contactDetails.email` / `contactDetails.phoneAlt`
in `lib/content.ts`, both `undefined` with a `// pending client confirmation`
comment — adding either later is a one-line change, and neither is referenced by
any component today.

## Projects page (2026-09-11)

`/projects` is the site's flagship page and its core USP — the full client
archive, browsable, with no curation: **every** photo and video in every
category folder is on this page (110 items total), not a "best of" selection.
Reuses every Home/Contact design token as-is (palette, type pairing,
`DimensionLine`/`CornerMarks`/blueprint-grid, focus-pull reveal) — nothing new
was invented at the token level, only new components.

- **`lib/projects-content.ts`** — the page's data layer. The actual 110-item
  list is generated (never hand-edited) by `scripts/prepare-projects-media.mjs`
  into `lib/generated/projects-media.json`; this file only adds presentation
  metadata on top (category labels/order, the "Interior Design" umbrella
  grouping over Modern Bedroom + Modern Kitchen + Walkthroughs + general
  interior content, the Featured Walkthroughs pull, page copy). Re-run the
  script if the curated folder list ever changes.
- **`components/projects/FeaturedWalkthroughs.tsx`** — the page's own top
  section, above the category filter, because the client was explicit that
  walkthrough videos convert best and this needed to visually lead, not be
  just another filter tab. Same scroll-snap-track/`IntersectionObserver`
  slider architecture as Home's `ProjectSlider.tsx`, adapted to one large
  cinematic card per slide (21:9 on desktop) instead of a hero+accent pair.
  Plays in place via the same tiered `VideoPoster` gate as everywhere else —
  no autoplay, ever, regardless of how prominent the section is.
- **`components/projects/CategoryFilter.tsx`** — desktop dropdown / mobile
  bottom sheet, same data feeding both (so they can never disagree), each
  category row showing its real item count (e.g. "Front Elevation 25").
  "Interior Design" is the default filter on load.
- **`components/projects/ProjectsGallery.tsx`** + **`ProjectTile.tsx`** — the
  masonry grid. **CSS multi-column** (`columns-2/3/4` + `break-inside-avoid`
  per tile), not a JS masonry library — per the brief, this is about scroll
  performance and avoiding layout-thrash at 40+ tiles, and columns give real
  variable-height packing from each item's actual aspect ratio
  (`style={{aspectRatio}}`, zero CLS) with no JS measuring pass. Switching
  category remounts the grid (`key={category}`), which is what triggers the
  reveal on the newly-shown tiles — see the `tile-fade` keyframe note in
  `app/globals.css` for why this can't ride the page's normal
  `ScrollTrigger.batch` reveal system.
- **`components/projects/useInView.ts`** — a small `IntersectionObserver`
  hook, one per tile. Deliberately not relying on `next/image`'s own
  `loading="lazy"` alone: at 40+ tiles in one category the browser's built-in
  heuristic still fires well ahead of scroll, whereas this renders no
  `<Image>` at all (so nothing fetches) until the tile is actually near the
  viewport. Verified in the network panel — scrolling through the full
  Interior Design + Front Elevation categories fetched roughly a dozen poster
  images, not 40+.
- **`components/projects/ProjectLightbox.tsx`** — full-viewer overlay.
  **Library choice: `yet-another-react-lightbox` over PhotoSwipe** — cleaner
  TypeScript integration (a custom slide type via module augmentation, see
  below), a `render.slide`/`render.controls` extension API that let every
  visual element (backdrop, buttons, counter) be re-themed with the site's
  own palette via `--yarl__*` CSS custom properties instead of overriding
  library CSS, and native `next/image`-friendly sizing. Framed with the same
  `CornerMarks` crosshairs used on every other feature image on the site
  (via `render.controls`) instead of the library's default chrome — this is
  **not** a generic dark-overlay-with-white-X lightbox.
  - **Video slides are not the library's own Video plugin.** That plugin
    wants an eager `sources` array and the carousel preloads neighbouring
    slides by default (`carousel.preload`) — both put a `<video>` (and its
    src) in the DOM for a slide the visitor hasn't tapped, which is exactly
    what the 200MB+ gate exists to prevent. Instead every video slide is a
    custom `"gated-video"` type (declared via `declare module
    "yet-another-react-lightbox" { interface SlideTypes {...} }`) rendered
    through `render.slide`, routing 100% of video rendering through the same
    `VideoPoster` component used everywhere else on the site. One gate
    implementation, not two.
  - Verified directly against the DOM (not just visually): opening a 517MB
    video slide renders zero `<video>` elements; tapping "Load video" once
    still renders zero; the second tap is what mounts the element and sets
    its `src`.
- **`components/VideoPoster.tsx`** — extended, not rewritten, with a new
  `fit` prop (`"cover"`, unchanged default behaviour for every existing
  call site, vs. `"contain"`, new — sizes from the media's own natural
  `width`/`height` with `object-contain`, for the lightbox's centred view
  where cropping would be wrong) so the lightbox reuses the exact same
  three-tier gate component as the grid and the rest of the site:
  - **< 50MB** — plain "Tap to play", as already established site-wide.
  - **50–200MB** — "Tap to play · ~NNMB", so a visitor on mobile data can
    decide before committing to the fetch.
  - **200MB+** — two-step gate. First tap only reveals the normal play
    control (still zero `<video>` in the DOM); the second tap is what
    actually mounts it.

**Media scale — resolved 2026-09-13, see "Blob media migration" above.**
Honoring "show everything, no curation" across all 110 items originally
landed on ~5.0 GB of video (several individual files well over GitHub's
100 MB per-file push limit, one deduped file ~517 MB). Rather than Git LFS
or leaving files uncompressed in an object store, every video was
re-encoded for the web first (5.27 GB → 0.23 GB, 96% smaller) and the whole
`public/assets/` tree now lives on Vercel Blob instead of in the repo or
the deploy bundle — resolving the GitHub-push-limit problem and the
deploy-size problem in the same pass.

## Category restructure (2026-09-11)

Two data/content changes, applied consistently across the whole site (source
archive, both media-prep scripts, both content data files, generated output):

- **A standalone category was merged into Interior Design and retired.**
  Every one of its files (25 photos + 1 video) was physically moved into
  `projects/interior-design/`. Four filenames collided with files already
  there — all four turned out to be byte-identical duplicates of the
  originals, not new content — and were renamed with a numeric `-2` suffix at
  move time so nothing was lost or silently overwritten. Interior Design's
  item count went from 46 to **72**; the retired category no longer appears
  as a filter option anywhere. The now-empty source folder was deleted.
- **A category was renamed** (folder, category id, label, and every generated
  output path renamed together, so nothing points at a stale name).
- The Home page portfolio slider correspondingly went from 7 slides to 6
  (the retired category's slide was removed outright, not replaced) —
  `ProjectSlider.tsx` computes its counter from `portfolio.slides.length`, so
  no component code needed to change, only the data in `lib/content.ts`.
  The "Index of work" filmstrip's weighting comments were updated to reflect
  where each thumbnail's source files now live; the thumbnails themselves are
  unchanged (same real photos, same output filenames).
- Both `scripts/prepare-media.mjs` and `scripts/prepare-projects-media.mjs`
  were updated and re-run from scratch (their outputs are 100% generated,
  never hand-edited) — `public/assets/img/projects/` and
  `public/assets/video/projects/` were fully cleared and regenerated rather
  than patched in place, since the merged category's larger item count shifts
  every numbered slug after it in file/job order; patching in place would
  have left stale, orphaned numbered files behind.
- Verified with a project-wide grep for both old category names (old slug and
  old display label) after the rebuild: **zero remaining references anywhere**
  in the codebase. Deliberately so — every comment describing this merge/rename
  (including this one) avoids repeating either old literal name, so a repo-wide
  search for them stays clean going forward too.

## About page (2026-09-11)

`/about` is the fourth and final page — reuses every existing design token and
motion pattern (blueprint background, `DimensionLine`/`CornerMarks`, focus-pull
reveal, no cursor-fx on mobile) with no new visual language invented. Section
numbering is page-scoped (01–04), same pattern as Contact and Projects.

- **`lib/about-content.ts`** — the page's data layer. Every number on the page
  is reused from data already established elsewhere rather than invented:
  the project-category count comes from `categories.length` in
  `lib/projects-content.ts` (so it updates itself automatically if categories
  are ever added, removed, or merged again — see "Category restructure"
  above for why that matters), the city count from `areas.cities.length`, and
  the Google rating from `testimonials.rating`/`.reviewCount` in
  `lib/content.ts` (both new fields — `testimonials.stat`, the string Contact
  already renders, is now *built from* them instead of a separately hardcoded
  string, so the two pages can never drift apart).
- **`components/AboutIntro.tsx`** — the page's own h1: the real tagline
  ("Architects, Interior, Engineers, Consultants.") as a large headline,
  next to Apoorv Gupta's real portrait (`assets/IMG_3265.JPG`, processed by
  `scripts/prepare-media.mjs` into `public/assets/img/about/apoorv-portrait.jpg`)
  in a `media-well` with `CornerMarks` — same photo-panel pattern as
  `ContactSplit.tsx`'s image side, so it's guaranteed not to distort at any
  breakpoint (`object-cover` inside an aspect-locked box, never a stretched
  plain `<img>`). Body copy deliberately says "a practice **led by** Apoorv
  Gupta," not that he personally executes every discipline — the tagline
  itself already names four.
- **`components/AboutStory.tsx`** — the founder-bio section. **Explicitly a
  placeholder, not invented copy**: a dashed border (not the site's normal
  solid hairline, so it reads as visually distinct from finished content) and
  a "Placeholder — pending from client" tag break the border, with the body
  paragraph itself saying outright that it's a placeholder. A source comment
  above the component spells out exactly what must NOT be invented to fill
  this gap (founding year, years-of-experience claim, qualification,
  registration status) — replace `aboutStory.body` in `lib/about-content.ts`
  once the client supplies real copy, and remove the placeholder styling.
- **`components/AboutStats.tsx`** — the three-stat strip. Typographic
  numerals only (no icon-in-circle blocks), hairline dividers between cells
  via `divide-*` utilities.
- **`components/ClosingCta.tsx`** — extended (not rewritten) with optional
  `index`/`label` props so a page with its own independent section numbering
  can reuse it without the component's `DimensionLine` jumping to Home's
  fixed "07". Home's own usage (`<ClosingCta />`, no props) is unchanged.
- **Active-page nav highlighting — new, added here, benefits every page.**
  Neither `Header.tsx` nor `Footer.tsx` had any active-link indication before
  this page (`usePathname()` didn't exist in either file). Added to both:
  desktop nav gets a burnt underline + ivory text on the current page, mobile
  nav gets burnt text plus a small "Here" tag, footer nav gets burnt text.
  `Footer.tsx` picked up a `"use client"` directive it didn't need before
  (required for `usePathname()`) — the component was already tiny and static,
  so this has no real performance cost.

## Home page perf fix — filmstrip stutter + slider jank (2026-09-12)

Two complaints, diagnosed before touching any code (not a guess-patch):

**"Index of work" filmstrip stuttered specifically during simultaneous
vertical scroll.** Confirmed both suspected root causes, with measurements:

- It ran its **own independent `requestAnimationFrame` loop**, completely
  untied from `gsap.ticker` — the one thing every other animation on this
  site rides (`SmoothScroll.tsx`'s own comment says so explicitly). Direct
  instrumentation showed it running continuously regardless of what else was
  happening on the page — this is the frame-budget contention that produced
  the stutter.
- It animated via **`track.scrollLeft +=`**, a scroll-mechanism write, not a
  compositor-only one. Benchmarked 500 write+read cycles on the real element:
  **`scrollLeft` cost 0.352ms/op vs. `transform` at 0.009ms/op — ~40x
  slower** — and unlike `transform`, a `scrollLeft` write can force a
  synchronous layout read for anything else needing fresh geometry in the
  same frame (like Lenis's own `ScrollTrigger.update()` during vertical
  scroll).

Fixed in `components/IndexFilmstrip.tsx`: now animates a single `x` value
onto `transform: translate3d()`, driven by `gsap.ticker`. Manual drag-to-browse
(previously "free" via native `overflow-x-auto`) is now a small pointer
handler updating that *same* `x` — mixing native `scrollLeft` with a
`transform` as two independent coordinate systems would have desynced the
instant a visitor dragged and let go (auto-scroll snapping back to wherever
the transform was pre-drag, ignoring the manual position). `will-change:
transform` is toggled on only while actually animating/dragging, cleared
otherwise — never a permanent hint. Re-measured on the live component after
the fix: **0.016ms/op — ~22x faster than the original `scrollLeft`
approach**, and `scrollLeft` itself no longer changes at all (confirmed via
direct sampling: stayed at 0 through a full animation cycle).

**Portfolio slider felt laggy in general, not just during simultaneous
scroll.** One hypothesis ruled out, one real (modest) defect found and fixed,
one inconclusive by tooling limits — reported honestly rather than dressed up:

- **`data-lenis-prevent` scoping: verified correct, not the cause.** Read
  Lenis's own installed source (`node_modules/lenis/dist/lenis.mjs:575-580`)
  rather than assuming — it checks `composedPath()` for the attribute on any
  ancestor up to its root, and the attribute sits directly on the track div,
  exactly where the gesture originates.
- **Real defect found**: on fresh load, the *next* slide's large hero image
  fetched eagerly despite having no `priority`. Root cause: `next/image`'s
  `loading="lazy"` checks raw viewport distance, not intersection with the
  *track's own* horizontal clip boundary, so a DOM-adjacent-but-off-screen
  slide inside the scroll-snap track still reads as "near enough" — the exact
  same problem `/projects`' `ProjectTile.tsx` already solves with its own
  root-scoped `useInView` instead of trusting native lazy-loading. Fixed the
  same way in `components/ProjectSlider.tsx`: a second, root-scoped
  `IntersectionObserver` (root: the track itself) now gates each slide's
  `MediaFrame` mount, verified live — only the first slide's `<img>` exists
  in the DOM on load, the next one mounts exactly when scrolled into view,
  not before.
- Also added scoped `will-change: scroll-position` (not `transform` — this
  track animates via native scroll-snap, so that's the CSS-correct hint for
  what's actually changing) on the track, toggled on during active scroll and
  cleared ~200ms after it settles.
- **Disclosed limitation**: image sizing checked out fine and synchronous JS
  cost per slide-jump was trivial (~0.1–0.3ms), so no single dominant cause
  for "general jank" was conclusively proven the way the filmstrip's was.
  Sustained multi-second frame-rate/`IntersectionObserver` tracing in this
  automation environment is unreliable — the Browser pane throttles
  `requestAnimationFrame` and defers callback delivery whenever it loses
  foreground visibility between tool calls (directly confirmed:
  `document.visibilityState` flipped to `"hidden"` mid-test more than once),
  which is a tooling artifact, not a page finding. Rather than present a
  contaminated trace as proof, the fixes applied are the ones the actual
  evidence supports.

## Header legibility fix — transparent-over-hero, solid elsewhere (2026-09-12)

**Diagnosis**: the header's scroll-driven toggle (`window.scrollY > 24` →
`bg-ink/92`) was not actually broken as a mechanism — direct instrumentation
confirmed it reliably fires and updates React state on every scroll. The real
defects were two design/implementation gaps:

1. A flat 24px scroll threshold has no relationship to the hero's actual
   rendered height at any given breakpoint, so the "solid" state's specific
   look (92% `bg-ink`, no blur) is what a visitor actually sees for nearly
   the entire time they're scrolling through the hero — and at that opacity,
   with no blur, sharp underlying content (the hero image, and later the
   filmstrip/slider's own images) still visibly read through, which is
   exactly what made it look broken in practice.
2. Every non-Home page (`/projects`, `/about`, `/contact`) has no hero
   section at all, yet started in the same transparent state by default,
   flashing solid on the smallest scroll for no reason — there was nothing
   for the header to be transparent *over*.

**Fix**, in `components/Header.tsx`:

- New `transparentOverHero` prop (only `app/page.tsx` passes it) — every
  other page's `<Header />` now defaults `solid = true` from first paint, no
  flash.
- On Home, an `IntersectionObserver` watches a 1px sentinel
  (`#hero-sentinel`) rendered by `Hero.tsx` at the hero's own bottom edge,
  with `rootMargin: "-72px 0px 0px 0px"` (the header's own height) so the
  observer's effective boundary already accounts for what's actually hidden
  behind the fixed header, not just the raw viewport edge. This adapts
  automatically to the hero's real height at any breakpoint — nothing here
  is a guessed pixel number.
- Solid state now uses **`bg-panel/95 backdrop-blur-md`** (the correct
  `panel` token, `#141209`, not `ink`) instead of `bg-ink/92` with no blur —
  verified directly against the DOM: fully legible over the filmstrip and
  portfolio slider's own images at both 375px and 1440px.

## TODO before launch

- **Known contradiction, needs a decision:** `studio.email` and `studio.phoneAlt`
  in `lib/content.ts` (`studiosarvagun@gmail.com`, `8006661177`) were originally
  read off the client's video end-card and, at the time, treated as confirmed —
  `studio.email` has been live on Home's `Footer.tsx` since that build and still
  renders there. This session was told those same two details are **not actually
  confirmed by the client**, and built Contact to withhold them (see "Contact page"
  above) — but per this task's scope ("do not modify anything under Home"), Home's
  Footer was deliberately left untouched and **still shows the unconfirmed email**.
  Decide whether to also pull it from Home, or reconfirm it with Apoorv and treat
  both as settled.
- `studio.whatsappNumber` (`918006000250`) — the one detail everyone's agreed is
  confirmed — was read off the end-card of the client's own **"Front Elevation -
  Renovation Project.mp4"**, a real video, not assumed.
- The Proof section's drawing/photo pair (`Design for House (101)` /
  `Old House (101)`) reads as the same narrow-plot house, but which came first
  (render → built, or existing house → proposal) is **unconfirmed** — the copy is
  deliberately written to be true either way. Tighten it once the client confirms.
- **Resolved 2026-09-13:** the two Process videos (`site-supervision/foundation.mp4`,
  `.../handover.mp4`) were ~216MB/~107MB; both are now compressed to ~15MB/~8MB —
  see "Blob media migration" above.
- ~7.5 GB of client video beyond what's curated here is still sitting in `projects/`
  unused (mostly `walkthroughs/` and `hospital-design/`'s second clip) — a deeper
  future pass (or the Projects page) could draw on it.
- `assets/IMG_3265.JPG` (Apoorv Gupta's portrait) now ships on `/about` — see
  "About page" below. The source photo itself carries an Instagram
  location/timestamp sticker baked into the pixels (visible bottom-right and
  top-left of the portrait) — cosmetic, came with the file, not introduced by
  this build. Worth a retouched or re-shot replacement before launch if it
  reads as sloppy; not blocking.
- **`/about`'s founder-bio paragraph is an explicit, visibly-marked placeholder**
  (dashed border, "Placeholder — pending from client" tag) — see "About page"
  below. Replace `aboutStory.body` in `lib/about-content.ts` once the client
  supplies real bio copy; do not fill it with an invented founding year,
  years-of-experience claim, or generic architect-bio prose.
- **`/projects`' `public/` footprint (~5.3 GB, several files over GitHub's 100 MB
  push limit) needs a hosting decision before this repo can be pushed as-is** —
  see "Media scale" under "Projects page" above.
