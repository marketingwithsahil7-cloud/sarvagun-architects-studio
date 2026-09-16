#!/usr/bin/env node
/**
 * One-off re-encode: every video under public/assets/video/ was straight
 * off a camera — already H.264, but at up to 3838x2160 and bitrates as high
 * as 105,000kbps (a well-encoded 1080p web video needs roughly 3,000–5,000).
 * That's why 31 clips totalled 5.27GB despite none of them being
 * exotic/cinema content — mostly slow-panning architecture walkthroughs and
 * site-supervision footage, which compress extremely well.
 *
 * Downscales anything above 1080p, re-encodes with a quality-targeted CRF
 * (not a blind bitrate cap — CRF adapts to each clip's actual complexity,
 * so a static shot gets smaller and a busier one gets more bits without
 * hand-tuning per file), and moves the moov atom to the front
 * (`+faststart`) for web/progressive playback.
 *
 * Re-encodes into <original>.compressed.mp4 first and only swaps it in for
 * the original after ffmpeg exits 0 and the output file is non-trivial in
 * size — so an interrupted run never leaves a half-written file where a
 * real video used to be. Writes scripts/generated/compress-log.json
 * incrementally (before/after size per file) — safe to re-run; already
 * confirmed files (final size ⩽ CAP_MB) are skipped.
 *
 * Usage: node scripts/compress-videos.mjs
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, stat, rename, unlink, mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const VIDEO_DIR = path.join(ROOT, "public", "assets", "video");
const LOG_PATH = path.join(ROOT, "scripts", "generated", "compress-log.json");
const FFMPEG = "ffmpeg";

const CRF = 27; // quality-targeted, not a fixed bitrate — see header note
const MAX_DIMENSION = 1080; // downscale anything taller/wider than this

async function walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await walk(full, base));
    else if (entry.name.toLowerCase().endsWith(".mp4")) files.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return files;
}

function loadLog() {
  if (!existsSync(LOG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(LOG_PATH, "utf8"));
  } catch {
    return {};
  }
}
async function saveLog(log) {
  await mkdir(path.dirname(LOG_PATH), { recursive: true });
  await writeFile(LOG_PATH, JSON.stringify(log, null, 2));
}

async function compressOne(fullPath) {
  const tmpOut = fullPath + ".compressed.mp4";
  if (existsSync(tmpOut)) await unlink(tmpOut);

  await execFileAsync(
    FFMPEG,
    [
      "-y",
      "-i", fullPath,
      "-vf", `scale='min(${MAX_DIMENSION},iw)':'min(${MAX_DIMENSION},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`,
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", String(CRF),
      "-c:a", "aac",
      "-b:a", "96k",
      "-movflags", "+faststart",
      tmpOut,
    ],
    { maxBuffer: 50 * 1024 * 1024, timeout: 30 * 60 * 1000 },
  );

  const { size: newSize } = await stat(tmpOut);
  if (newSize < 10 * 1024) {
    // Sanity guard — a valid re-encoded clip should never be this small;
    // treat as a failure rather than silently swap in a broken file.
    await unlink(tmpOut);
    throw new Error(`Output suspiciously small (${newSize} bytes) — not swapping in.`);
  }

  await unlink(fullPath);
  await rename(tmpOut, fullPath);
  return newSize;
}

async function main() {
  const log = loadLog();
  const files = (await walk(VIDEO_DIR)).sort();

  let totalBefore = 0;
  let totalAfter = 0;
  let ok = 0;
  let fail = 0;
  let skipped = 0;

  console.log(`${files.length} videos found. CRF ${CRF}, max ${MAX_DIMENSION}px.\n`);

  for (let i = 0; i < files.length; i++) {
    const rel = files[i];
    const fullPath = path.join(VIDEO_DIR, rel);

    if (log[rel]?.done) {
      const { size } = await stat(fullPath);
      totalBefore += log[rel].before;
      totalAfter += size;
      skipped++;
      continue;
    }

    const { size: before } = await stat(fullPath);
    const label = `[${i + 1}/${files.length}] ${rel} (${(before / 1048576).toFixed(1)}MB)`;

    try {
      const after = await compressOne(fullPath);
      totalBefore += before;
      totalAfter += after;
      log[rel] = { done: true, before, after };
      await saveLog(log);
      ok++;
      const pct = (100 * (1 - after / before)).toFixed(0);
      console.log(`✓ ${label} -> ${(after / 1048576).toFixed(1)}MB (-${pct}%)`);
    } catch (err) {
      fail++;
      console.error(`✗ ${label} FAILED: ${err.message.slice(0, 200)}`);
    }
  }

  console.log(
    `\n${ok} compressed, ${skipped} already done, ${fail} failed.\n` +
      `Before: ${(totalBefore / 1073741824).toFixed(2)}GB -> After: ${(totalAfter / 1073741824).toFixed(2)}GB ` +
      `(${(100 * (1 - totalAfter / totalBefore)).toFixed(0)}% smaller).`,
  );
  if (fail > 0) process.exitCode = 1;
}

main();
