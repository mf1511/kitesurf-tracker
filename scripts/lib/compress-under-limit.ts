/**
 * Compresse une vidéo sous la limite Storage Supabase (~42 Mo).
 * Escalade : 720p bitrate → 540p → 480p CRF30 → 360p CRF34.
 */
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, statSync, unlinkSync } from "fs";
import path from "path";

export const MAX_OUT_BYTES = 42 * 1024 * 1024;

function probeDurationSec(file: string): number {
  const out = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      file,
    ],
    { encoding: "utf8" }
  ).trim();
  const d = parseFloat(out);
  return Number.isFinite(d) && d > 0 ? d : 60;
}

function runBitrate(
  src: string,
  vf: string,
  vbr: number,
  abr: number,
  out: string
): void {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      src,
      "-vf",
      vf,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-b:v",
      `${vbr}k`,
      "-maxrate",
      `${vbr}k`,
      "-bufsize",
      `${vbr * 2}k`,
      "-c:a",
      "aac",
      "-b:a",
      `${abr}k`,
      "-movflags",
      "+faststart",
      out,
    ],
    { stdio: ["ignore", "ignore", "inherit"] }
  );
}

function runCrf(
  src: string,
  vf: string,
  crf: number,
  abr: number,
  out: string
): void {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      src,
      "-vf",
      vf,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      String(crf),
      "-c:a",
      "aac",
      "-b:a",
      `${abr}k`,
      "-movflags",
      "+faststart",
      out,
    ],
    { stdio: ["ignore", "ignore", "inherit"] }
  );
}

function replaceDest(tmp: string, dest: string): number {
  if (existsSync(dest)) unlinkSync(dest);
  execFileSync("mv", [tmp, dest]);
  return statSync(dest).size;
}

export function compressUnderLimit(src: string, dest: string): void {
  mkdirSync(path.dirname(dest), { recursive: true });
  if (
    existsSync(dest) &&
    statSync(dest).size > 0 &&
    statSync(dest).size <= MAX_OUT_BYTES
  ) {
    console.log(`  skip compress (déjà OK) ${path.basename(dest)}`);
    return;
  }

  const duration = probeDurationSec(src);
  // Budget ~40 Mo : ne pas forcer un plancher 300 kbps (casse les tutos > ~20 min)
  const targetBits = 40 * 1024 * 1024 * 8;
  const fitKbps = Math.floor(targetBits / duration / 1000) - 96;
  const videoKbps = Math.max(80, Math.min(1400, fitKbps));
  console.log(
    `  compress → ${videoKbps} kbps / 720p (~${Math.round(duration)}s)`
  );

  runBitrate(src, "scale='min(1280,iw)':-2", videoKbps, 80, dest);
  let size = statSync(dest).size;

  if (size > MAX_OUT_BYTES) {
    console.log(
      `  encore trop gros (${(size / 1024 / 1024).toFixed(1)} Mo) → 540p`
    );
    const tmp = dest + ".retry.mp4";
    runBitrate(
      src,
      "scale='min(960,iw)':-2",
      Math.max(80, Math.floor(videoKbps * 0.7)),
      64,
      tmp
    );
    size = replaceDest(tmp, dest);
  }

  if (size > MAX_OUT_BYTES) {
    console.log(
      `  encore trop gros (${(size / 1024 / 1024).toFixed(1)} Mo) → 480p CRF 30`
    );
    const tmp = dest + ".crf.mp4";
    runCrf(src, "scale='min(854,iw)':-2", 30, 64, tmp);
    size = replaceDest(tmp, dest);
  }

  if (size > MAX_OUT_BYTES) {
    console.log(
      `  encore trop gros (${(size / 1024 / 1024).toFixed(1)} Mo) → 360p CRF 34`
    );
    const tmp = dest + ".crf2.mp4";
    runCrf(src, "scale='min(640,iw)':-2", 34, 48, tmp);
    size = replaceDest(tmp, dest);
  }

  // Forçage CBR pour les très longues (CRF peut encore dépasser)
  if (size > MAX_OUT_BYTES) {
    const forced = Math.max(60, fitKbps - 40);
    console.log(
      `  encore trop gros (${(size / 1024 / 1024).toFixed(1)} Mo) → 360p ${forced} kbps forcé`
    );
    const tmp = dest + ".force.mp4";
    runBitrate(src, "scale='min(640,iw)':-2", forced, 48, tmp);
    size = replaceDest(tmp, dest);
  }

  if (size > MAX_OUT_BYTES) {
    throw new Error(
      `Compression échouée : ${(size / 1024 / 1024).toFixed(1)} Mo > 42 Mo (${src})`
    );
  }
  console.log(`  → ${(size / 1024 / 1024).toFixed(1)} Mo`);
}
