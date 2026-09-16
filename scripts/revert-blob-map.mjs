#!/usr/bin/env node
/**
 * Reverse of apply-blob-map.mjs: rewrites every Vercel Blob URL reference
 * back to its local `/assets/...` path, using the same
 * scripts/generated/blob-map.json (local-path -> blob-URL). Media files
 * already exist locally under public/assets/ — this just points the app
 * back at them so the site has zero runtime dependency on Vercel Blob.
 *
 * Usage: node scripts/revert-blob-map.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const MAP_PATH = path.join(ROOT, "scripts", "generated", "blob-map.json");

if (!existsSync(MAP_PATH)) {
  console.error(`✗ ${MAP_PATH} not found.`);
  process.exit(1);
}
const map = JSON.parse(readFileSync(MAP_PATH, "utf8"));
const entries = Object.entries(map);
const reverseEntries = entries.map(([localPath, url]) => [url, localPath]);
console.log(`Loaded ${entries.length} local-path -> blob-URL mappings (reversing).`);

let blobBase = null;
let allPredictable = true;
for (const [localPath, url] of entries) {
  const expectedSuffix = localPath.replace(/^\/assets\//, "");
  if (!url.endsWith(expectedSuffix)) {
    allPredictable = false;
    continue;
  }
  const base = url.slice(0, url.length - expectedSuffix.length);
  if (blobBase === null) blobBase = base;
  else if (blobBase !== base) allPredictable = false;
}
console.log(`Predictable-URL pattern holds for all entries: ${allPredictable}${blobBase ? ` (base: ${blobBase})` : ""}`);

function replaceStaticLiteralsInText(text, filelabel) {
  let out = text;
  let count = 0;
  for (const [url, localPath] of reverseEntries) {
    const literal = `"${url}"`;
    if (out.includes(literal)) {
      out = out.split(literal).join(`"${localPath}"`);
      count++;
    }
  }
  console.log(`  ${filelabel}: replaced ${count} static literal(s).`);
  return out;
}

// ---- lib/about-content.ts ---------------------------------------------
{
  const p = path.join(ROOT, "lib", "about-content.ts");
  const text = readFileSync(p, "utf8");
  const out = replaceStaticLiteralsInText(text, "lib/about-content.ts");
  writeFileSync(p, out);
}

// ---- lib/content.ts -----------------------------------------------------
{
  const p = path.join(ROOT, "lib", "content.ts");
  let text = readFileSync(p, "utf8");
  text = replaceStaticLiteralsInText(text, "lib/content.ts (static literals)");

  if (allPredictable && blobBase) {
    const before = text;
    const escapedBase = blobBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      "`" + escapedBase + "img/filmstrip/\\$\\{f\\}\\.jpg`",
      "g",
    );
    text = text.replace(re, "`/assets/img/filmstrip/${f}.jpg`");
    console.log(`  lib/content.ts (filmstrip template): ${text !== before ? "updated" : "no match found"}.`);
  } else {
    console.warn("  ⚠ lib/content.ts filmstrip template NOT reverted — predictable-URL check failed, needs manual handling.");
  }
  writeFileSync(p, text);
}

// ---- lib/generated/projects-media.json ----------------------------------
{
  const p = path.join(ROOT, "lib", "generated", "projects-media.json");
  const manifest = JSON.parse(readFileSync(p, "utf8"));
  const reverseMap = Object.fromEntries(reverseEntries);
  let replaced = 0;
  let missing = 0;
  for (const item of manifest) {
    for (const field of ["src", "poster"]) {
      if (!item[field]) continue;
      const localPath = reverseMap[item[field]];
      if (localPath) {
        item[field] = localPath;
        replaced++;
      } else if (item[field].includes("vercel-storage.com")) {
        missing++;
        console.warn(`  ⚠ no reverse-map entry for ${item[field]} (id: ${item.id})`);
      }
    }
  }
  writeFileSync(p, JSON.stringify(manifest, null, 2));
  console.log(`  lib/generated/projects-media.json: replaced ${replaced} field(s), ${missing} missing from map.`);
}

console.log("\nDone. Grep for vercel-storage.com across lib/ and components/ to confirm zero remaining references.");
