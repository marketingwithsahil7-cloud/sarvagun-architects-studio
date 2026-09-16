#!/usr/bin/env node
/**
 * One-off migration: uploads every file under public/assets/img/ and
 * public/assets/video/ to Vercel Blob, preserving the exact relative path
 * (img/... , video/...) as the blob pathname — so the folder/category
 * structure already established locally (front-elevation/, walkthroughs/,
 * site-supervision/, etc.) carries straight over, and the mapping from the
 * current `/assets/...` reference used throughout the codebase to its new
 * Blob URL is a direct 1:1 lookup, not a renaming exercise.
 *
 * Shells out to `vercel blob put` per file rather than calling the
 * @vercel/blob SDK's put() directly with a token read from .env.local: this
 * coding environment redacts secret-shaped values when a file is written to
 * disk (a real, deliberate security boundary, not a bug to route around),
 * so any BLOB_READ_WRITE_TOKEN read back out of .env.local comes back as
 * the literal placeholder text, not the real value. The Vercel CLI's own
 * already-authenticated session isn't subject to that — it authenticates
 * itself directly, no token file needed on our end.
 *
 * The CLI's `--add-random-suffix false` flag does not reliably prevent a
 * random suffix on the resulting blob pathname (confirmed empirically, two
 * consecutive uploads of the same file with that flag still produced two
 * different random-suffixed URLs) — so this script does NOT rely on
 * deterministic blob URLs for idempotency. Instead it records the actual
 * returned URL per file in the map immediately after each success, and
 * skips any local path already present in that map on a re-run. Safe to
 * interrupt (Ctrl+C) and resume.
 *
 * Usage: node scripts/upload-to-blob.mjs
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, stat, mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const ASSET_ROOTS = ["img", "video"]; // relative to public/assets/
const PUBLIC_ASSETS = path.join(ROOT, "public", "assets");
const MAP_OUT = path.join(ROOT, "scripts", "generated", "blob-map.json");

const VERCEL_BIN = process.platform === "win32" ? "npx.cmd" : "npx";

async function walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walk(full, base));
    } else {
      files.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return files;
}

function loadExistingMap() {
  if (!existsSync(MAP_OUT)) return {};
  try {
    return JSON.parse(readFileSync(MAP_OUT, "utf8"));
  } catch {
    return {};
  }
}

async function saveMap(map) {
  await mkdir(path.dirname(MAP_OUT), { recursive: true });
  await writeFile(MAP_OUT, JSON.stringify(map, null, 2));
}

const q = (s) => `"${s.replace(/"/g, '\\"')}"`; // shell:true doesn't auto-quote args — our own paths have spaces

async function uploadOne(fullPath, pathname) {
  const { stdout, stderr } = await execFileAsync(
    VERCEL_BIN,
    ["vercel", "blob", "put", q(fullPath), "--pathname", q(pathname), "--access", "public", "--allow-overwrite", "true"],
    // shell: true — on Windows, npx.cmd is a batch file, not a real PE
    // executable; execFile can't spawn it directly (throws EINVAL) without
    // going through a shell. That means args are NOT auto-escaped by Node,
    // hence the manual quoting above (this repo's own path has spaces in it).
    { cwd: ROOT, maxBuffer: 10 * 1024 * 1024, shell: true, timeout: 20 * 60 * 1000 },
  );
  // The CLI writes "Success! <url>" to stderr, not stdout (confirmed
  // empirically) — check both so this isn't fragile to that detail.
  const combined = `${stdout}\n${stderr}`;
  const m = combined.match(/Success!\s+(https:\/\/\S+)/);
  if (!m) throw new Error(`Could not parse blob URL from CLI output: ${combined.slice(0, 300)}`);
  return m[1];
}

async function main() {
  const map = loadExistingMap();

  let allFiles = [];
  for (const root of ASSET_ROOTS) {
    const dir = path.join(PUBLIC_ASSETS, root);
    if (!existsSync(dir)) continue;
    const rel = await walk(dir, PUBLIC_ASSETS); // e.g. "img/hero/elevation-dusk.jpg"
    allFiles = allFiles.concat(rel);
  }
  allFiles.sort();

  const total = allFiles.length;
  let ok = Object.keys(map).length;
  let fail = 0;
  let skipped = 0;
  let bytesUploaded = 0;

  console.log(`${total} files found under public/assets/{img,video}. ${ok} already in blob-map.json, will be skipped.\n`);

  for (let i = 0; i < allFiles.length; i++) {
    const rel = allFiles[i]; // e.g. "img/hero/elevation-dusk.jpg"
    const localRef = `/assets/${rel}`; // matches the reference format used in lib/content.ts etc.

    if (map[localRef]) {
      skipped++;
      continue;
    }

    const fullPath = path.join(PUBLIC_ASSETS, rel);
    const { size } = await stat(fullPath);
    const sizeMB = (size / 1048576).toFixed(1);
    const label = `[${i + 1}/${total}] ${rel} (${sizeMB}MB)`;

    try {
      const url = await uploadOne(fullPath, rel);
      map[localRef] = url;
      await saveMap(map); // incremental — safe to Ctrl+C and resume
      bytesUploaded += size;
      ok++;
      console.log(`✓ ${label} -> ${url}`);
    } catch (err) {
      fail++;
      console.error(`✗ ${label} FAILED: ${err.message}`);
    }
  }

  console.log(
    `\n${ok} uploaded/already-done, ${skipped} skipped (already in map this run), ${fail} failed. ` +
      `${(bytesUploaded / 1073741824).toFixed(2)}GB uploaded this run.`,
  );
  console.log(`Map written to ${MAP_OUT} (${Object.keys(map).length} entries).`);
  if (fail > 0) process.exitCode = 1;
}

main();
