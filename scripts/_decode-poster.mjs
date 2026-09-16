#!/usr/bin/env node
// Helper used only during media curation: decodes a captured video-frame
// dataURL (saved by the browser tool into a tool-results .txt when the raw
// result exceeds the display limit) into a JPEG under scripts/_poster-src/.
// Usage: node scripts/_decode-poster.mjs <tool-results-file.txt> <out-name.jpg>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const [, , srcArg, outArg] = process.argv;
if (!srcArg || !outArg) {
  console.error("usage: node scripts/_decode-poster.mjs <tool-results.txt> <out-name.jpg>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(srcArg, "utf8"));
const text = raw[0].text;
const m = text.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
if (!m) {
  console.error("no data URL found in", srcArg);
  process.exit(1);
}
const buf = Buffer.from(m[1], "base64");
const out = path.join("scripts", "_poster-src", "projects", outArg);
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, buf);
console.log(`wrote ${buf.length} bytes -> ${out}`);
