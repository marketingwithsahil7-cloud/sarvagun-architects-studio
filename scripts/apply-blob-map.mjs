#!/usr/bin/env node
/**
 * One-off migration step 3: rewrites every `/assets/img/...` and
 * `/assets/video/...` reference across the codebase to its Vercel Blob URL,
 * using scripts/generated/blob-map.json (written by upload-to-blob.mjs).
 *
 * Handles two shapes of reference:
 *   - Static string literals (most of lib/content.ts, lib/about-content.ts,
 *     every src/poster field in lib/generated/projects-media.json) — a
 *     direct map lookup and substring replace.
 *   - The "Index of work" filmstrip's dynamically-constructed paths
 *     (`` `/assets/img/filmstrip/${f}.jpg` ``) — resolved the same way as
 *     everything else turned out to work: uploaded blob URLs came back
 *     exactly `${BLOB_BASE}${localPath without the leading "/assets/"}`,
 *     with no random suffix, for every file in this run. That's verified
 *     against the map itself below (not assumed) before being used to
 *     rewrite the filmstrip block into a plain prefix template.
 *
 * Usage: node scripts/apply-blob-map.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const MAP_PATH = path.join(ROOT, "scripts", "generated", "blob-map.json");

if (!existsSync(MAP_PATH)) {
  console.error(`✗ ${MAP_PATH} not found — run upload-to-blob.mjs first.`);
  process.exit(1);
}
const map = JSON.parse(readFileSync(MAP_PATH, "utf8"));
const entries = Object.entries(map);
console.log(`Loaded ${entries.length} local-path -> blob-URL mappings.`);

// Confirm the "predictable URL" pattern actually holds for every entry
// before relying on it for the filmstrip's dynamic paths.
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
  for (const [localPath, url] of entries) {
    const literal = `"${localPath}"`;
    if (out.includes(literal)) {
      out = out.split(literal).join(`"${url}"`);
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
    text = text.replace(
      /\{ kind: "image", src: `\/assets\/img\/filmstrip\/\$\{f\}\.jpg`, alt: "" \}/g,
      `{ kind: "image", src: \`${blobBase}img/filmstrip/\${f}.jpg\`, alt: "" }`,
    );
    console.log(`  lib/content.ts (filmstrip template): ${text !== before ? "updated" : "no match found"}.`);
  } else {
    console.warn("  ⚠ lib/content.ts filmstrip template NOT rewritten — predictable-URL check failed, needs manual handling.");
  }
  writeFileSync(p, text);
}

// ---- lib/generated/projects-media.json ----------------------------------
{
  const p = path.join(ROOT, "lib", "generated", "projects-media.json");
  const manifest = JSON.parse(readFileSync(p, "utf8"));
  let replaced = 0;
  let missing = 0;
  for (const item of manifest) {
    for (const field of ["src", "poster"]) {
      if (!item[field]) continue;
      const url = map[item[field]];
      if (url) {
        item[field] = url;
        replaced++;
      } else if (item[field].startsWith("/assets/")) {
        missing++;
        console.warn(`  ⚠ no map entry for ${item[field]} (id: ${item.id})`);
      }
    }
  }
  writeFileSync(p, JSON.stringify(manifest, null, 2));
  console.log(`  lib/generated/projects-media.json: replaced ${replaced} field(s), ${missing} missing from map.`);
}

console.log("\nDone. Grep for /assets/img or /assets/video across lib/ and components/ to confirm zero remaining references.");
