#!/usr/bin/env node
// One-off: recolor the center "A" stroke in public/assets/logo-mark.png to
// the client's own brand orange, using assets/logo.png (the original
// full-color reference, where the A is already orange) as a positional
// mask — logo-mark.png itself has no color boundary between its three
// overlapping white strokes, so there's nothing to select by color there
// alone. Both files' foreground bounding boxes share the same aspect ratio
// (1.060), confirmed by direct measurement, which is what makes a resized
// pixel-for-pixel mask reliable here.
import sharp from "sharp";

const ORANGE = { r: 255, g: 101, b: 3 };
const TARGET = "public/assets/logo-mark.png";
const REF = "assets/logo.png";
const OUT = "public/assets/logo-mark.png";

// Measured bounding boxes (see prior analysis): logo-mark uses alpha,
// reference is opaque black-background so brightness threshold applies.
const TARGET_BBOX = { left: 65, top: 2, width: 739, height: 697 };
const REF_BBOX = { left: 356, top: 23, width: 568, height: 536 };

async function main() {
  const targetMeta = await sharp(TARGET).metadata();

  // Reference crop, resized to exactly the target's bbox pixel dimensions
  // so every pixel lines up 1:1 with the target crop below.
  const refResized = await sharp(REF)
    .extract(REF_BBOX)
    .resize(TARGET_BBOX.width, TARGET_BBOX.height, { kernel: "cubic" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const targetCrop = await sharp(TARGET)
    .extract(TARGET_BBOX)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: refData } = refResized;
  const { data: tData, info: tInfo } = targetCrop;
  const w = tInfo.width, h = tInfo.height, ch = tInfo.channels; // ch=4 (rgba)
  const refCh = refResized.info.channels; // 3 or 4, opaque source

  const out = Buffer.from(tData); // copy
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tIdx = (y * w + x) * ch;
      const alpha = tData[tIdx + 3];
      if (alpha < 10) continue; // background, leave as-is

      const rIdx = (y * w + x) * refCh;
      const r = refData[rIdx], g = refData[rIdx + 1], b = refData[rIdx + 2];
      // Orange reference pixel: red channel clearly dominant over blue,
      // and not too dark (excludes near-black background bleed at edges).
      const isOrange = r > 120 && r - b > 60 && r - g > 40;
      if (isOrange) {
        out[tIdx] = ORANGE.r;
        out[tIdx + 1] = ORANGE.g;
        out[tIdx + 2] = ORANGE.b;
        // keep original alpha for clean anti-aliased edges
      }
    }
  }

  const recoloredCrop = await sharp(out, { raw: { width: w, height: h, channels: ch } })
    .png()
    .toBuffer();

  await sharp(TARGET)
    .composite([{ input: recoloredCrop, left: TARGET_BBOX.left, top: TARGET_BBOX.top }])
    .toFile(OUT + ".tmp.png");

  console.log("Wrote", OUT + ".tmp.png", "— inspect before replacing the original.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
