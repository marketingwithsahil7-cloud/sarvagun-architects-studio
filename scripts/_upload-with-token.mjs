#!/usr/bin/env node
// One-off variant of upload-to-blob.mjs that passes an explicit --rw-token,
// since ambient `vercel blob put` auth fails with "Access denied" in this
// session (same issue hit and worked around manually earlier). Token comes
// from process.env.BLOB_RW_TOKEN, populated by the caller via `vercel env
// pull` immediately before running this — never written to a file here.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, stat, mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const ASSET_ROOTS = ["img", "video"];
const PUBLIC_ASSETS = path.join(ROOT, "public", "assets");
const MAP_OUT = path.join(ROOT, "scripts", "generated", "blob-map.json");
const VERCEL_BIN = process.platform === "win32" ? "npx.cmd" : "npx";
const TOKEN = process.env.BLOB_RW_TOKEN;
if (!TOKEN) {
  console.error("BLOB_RW_TOKEN env var not set.");
  process.exit(1);
}

async function walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await walk(full, base));
    else files.push(path.relative(base, full).split(path.sep).join("/"));
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

const q = (s) => `"${s.replace(/"/g, '\\"')}"`;

async function uploadOne(fullPath, pathname) {
  const { stdout, stderr } = await execFileAsync(
    VERCEL_BIN,
    ["vercel", "blob", "put", q(fullPath), "--pathname", q(pathname), "--access", "public", "--allow-overwrite", "true", "--rw-token", q(TOKEN)],
    { cwd: ROOT, maxBuffer: 10 * 1024 * 1024, shell: true, timeout: 20 * 60 * 1000 },
  );
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
    const rel = await walk(dir, PUBLIC_ASSETS);
    allFiles = allFiles.concat(rel);
  }
  allFiles.sort();

  const total = allFiles.length;
  let ok = Object.keys(map).length;
  let fail = 0;
  let skipped = 0;

  console.log(`${total} files found. ${ok} already in map, will be skipped.\n`);

  for (let i = 0; i < allFiles.length; i++) {
    const rel = allFiles[i];
    const localRef = `/assets/${rel}`;
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
      await saveMap(map);
      ok++;
      console.log(`✓ ${label} -> ${url}`);
    } catch (err) {
      fail++;
      console.error(`✗ ${label} FAILED: ${err.message.slice(0, 300)}`);
    }
  }

  console.log(`\n${ok} uploaded/already-done, ${skipped} skipped, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main();
