#!/usr/bin/env node
// Site-wide duplicate-image audit — all categories. Two passes:
//   1. Exact byte hash (md5) — certain duplicates.
//   2. A fine 16x16-grid difference-hash (256 bits) — catches "same camera
//      position, different render/lighting pass" repeats, which a coarser
//      8x8 hash (and even more so a plain color-signature) misses once the
//      camera has rotated even a little. Calibrated against a confirmed
//      real duplicate pair (distance 44/256) vs confirmed genuinely-
//      different angles of the same room (104-142/256) — the true
//      duplicates cluster well under 70, everything else sits well above
//      100, so this threshold has a wide, safe margin either side.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const manifest = JSON.parse(readFileSync("lib/generated/projects-media.json", "utf8"));
const images = manifest.filter((m) => m.kind === "image");

function localPath(src) {
  const m = src.match(/\/img\/(projects\/.+)$/);
  return m ? path.join("public/assets/img", m[1]) : null;
}

async function fineDHash(filePath) {
  const { data } = await sharp(filePath)
    .grayscale()
    .resize(17, 16, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bits = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      bits.push(data[y * 17 + x] > data[y * 17 + x + 1] ? 1 : 0);
    }
  }
  return bits;
}

function hamming(a, b) {
  let c = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) c++;
  return c;
}

async function main() {
  const items = [];
  for (const img of images) {
    const p = localPath(img.src);
    if (!p) continue;
    const buf = readFileSync(p);
    const md5 = createHash("md5").update(buf).digest("hex");
    const hash = await fineDHash(p);
    items.push({ id: img.id, category: img.category, path: p, md5, hash });
  }

  console.log(`Scanned ${items.length} images across all categories.\n`);

  const byMd5 = new Map();
  for (const it of items) {
    if (!byMd5.has(it.md5)) byMd5.set(it.md5, []);
    byMd5.get(it.md5).push(it);
  }
  const exactGroups = [...byMd5.values()].filter((g) => g.length > 1);
  console.log(`=== EXACT byte-identical: ${exactGroups.length} group(s) ===`);
  for (const g of exactGroups) console.log("  " + g.map((x) => x.id).join("  ==  "));

  console.log(`\n=== NEAR-identical (fine dHash distance < 70/256) ===`);
  let nearCount = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.md5 === b.md5) continue;
      const d = hamming(a.hash, b.hash);
      if (d < 70) {
        console.log(`  dist=${d}  ${a.id}  ~~  ${b.id}`);
        nearCount++;
      }
    }
  }
  if (nearCount === 0) console.log("  (none)");
}
main();
