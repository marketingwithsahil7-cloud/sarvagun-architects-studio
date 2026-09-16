#!/usr/bin/env node
/**
 * One-off audit: reports codec, resolution, bitrate and file size for every
 * video under public/assets/video/ — the diagnostic step before deciding
 * whether/how much re-encoding can shrink the 5.3GB media total.
 *
 * Usage: node scripts/audit-videos.mjs
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const VIDEO_DIR = path.join(ROOT, "public", "assets", "video");
const FFPROBE = "ffprobe";

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

async function probe(fullPath) {
  const { stdout } = await execFileAsync(FFPROBE, [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=codec_name,width,height,bit_rate,avg_frame_rate",
    "-show_entries", "format=bit_rate,duration",
    "-of", "json",
    fullPath,
  ]);
  return JSON.parse(stdout);
}

async function main() {
  const files = (await walk(VIDEO_DIR)).sort();
  const rows = [];
  let totalSize = 0;

  for (const rel of files) {
    const fullPath = path.join(VIDEO_DIR, rel);
    const { size } = await stat(fullPath);
    totalSize += size;
    try {
      const info = await probe(fullPath);
      const stream = info.streams?.[0] ?? {};
      const format = info.format ?? {};
      const bitrateKbps = Math.round((Number(stream.bit_rate || format.bit_rate || 0)) / 1000);
      rows.push({
        rel,
        sizeMB: (size / 1048576).toFixed(1),
        codec: stream.codec_name ?? "?",
        resolution: stream.width && stream.height ? `${stream.width}x${stream.height}` : "?",
        durationSec: format.duration ? Math.round(Number(format.duration)) : "?",
        bitrateKbps: bitrateKbps || "?",
      });
    } catch (err) {
      rows.push({ rel, sizeMB: (size / 1048576).toFixed(1), codec: "PROBE FAILED", resolution: "?", durationSec: "?", bitrateKbps: err.message.slice(0, 80) });
    }
  }

  console.log(
    "size(MB)".padEnd(10) +
      "codec".padEnd(8) +
      "resolution".padEnd(12) +
      "dur(s)".padEnd(8) +
      "bitrate(kbps)".padEnd(15) +
      "path",
  );
  for (const r of rows) {
    console.log(
      String(r.sizeMB).padEnd(10) +
        String(r.codec).padEnd(8) +
        String(r.resolution).padEnd(12) +
        String(r.durationSec).padEnd(8) +
        String(r.bitrateKbps).padEnd(15) +
        r.rel,
    );
  }
  console.log(`\nTotal: ${(totalSize / 1073741824).toFixed(2)}GB across ${files.length} videos.`);
}

main();
