import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";

const manifest = JSON.parse(readFileSync("lib/generated/projects-media.json", "utf8"));
const images = manifest.filter((m) => m.category === "interior-design" && m.kind === "image");

function localPath(src) {
  const m = src.match(/\/img\/(projects\/.+)$/);
  return m ? path.join("public/assets/img", m[1]) : null;
}

const CELL = 220;
const COLS = 6;
const ROWS = Math.ceil(images.length / COLS);

async function main() {
  const composites = [];
  for (let i = 0; i < images.length; i++) {
    const p = localPath(images[i].src);
    const buf = await sharp(p).resize(CELL, CELL, { fit: "cover" }).jpeg({ quality: 70 }).toBuffer();
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    composites.push({ input: buf, left: col * CELL, top: row * CELL });
    // number label
    const label = Buffer.from(
      `<svg width="${CELL}" height="30"><rect width="60" height="24" fill="black" opacity="0.7"/><text x="4" y="18" font-size="16" fill="white" font-family="sans-serif">${i + 1}</text></svg>`
    );
    composites.push({ input: label, left: col * CELL, top: row * CELL });
  }
  await sharp({ create: { width: CELL * COLS, height: CELL * ROWS, channels: 3, background: "#111" } })
    .composite(composites)
    .jpeg({ quality: 75 })
    .toFile("C:/tmp/id-contact-sheet.jpg");
  console.log("done,", images.length, "images,", ROWS, "rows");
  images.forEach((m, i) => console.log(i + 1, m.id));
}
main();
