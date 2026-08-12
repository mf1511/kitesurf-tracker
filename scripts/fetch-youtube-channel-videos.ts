/**
 * Liste les vidéos d’une chaîne YouTube (liens + métadonnées) via yt-dlp.
 *
 * Prérequis : `yt-dlp` dans le PATH (`brew install yt-dlp`)
 *
 * Usage :
 *   npx tsx scripts/fetch-youtube-channel-videos.ts
 *   npx tsx scripts/fetch-youtube-channel-videos.ts --channel https://www.youtube.com/@stevenakkersdijk/videos
 *   npx tsx scripts/fetch-youtube-channel-videos.ts --limit 50
 *   npx tsx scripts/fetch-youtube-channel-videos.ts --out .tmp/steven-akkersdijk-videos.json
 */

import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const DEFAULT_CHANNEL =
  "https://www.youtube.com/@stevenakkersdijk/videos";

type FlatVideo = {
  id?: string;
  title?: string;
  url?: string;
  webpage_url?: string;
  duration?: number | null;
  upload_date?: string | null; // YYYYMMDD
  view_count?: number | null;
  description?: string | null;
};

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function findYtDlp(): string {
  try {
    return execFileSync("which", ["yt-dlp"], { encoding: "utf8" }).trim();
  } catch {
    throw new Error(
      "yt-dlp introuvable. Installe-le : brew install yt-dlp"
    );
  }
}

function main() {
  const channel = argValue("--channel") ?? DEFAULT_CHANNEL;
  const limitRaw = argValue("--limit");
  const limit = limitRaw ? Math.max(1, parseInt(limitRaw, 10)) : undefined;
  const out =
    argValue("--out") ??
    path.join(".tmp", "youtube-channel-videos.json");

  const ytDlp = findYtDlp();
  console.log(`→ yt-dlp : ${ytDlp}`);
  console.log(`→ chaîne : ${channel}`);
  if (limit) console.log(`→ limite : ${limit}`);

  // --flat-playlist : métadonnées sans télécharger les fichiers
  const args = [
    "--flat-playlist",
    "--dump-single-json",
    "--no-warnings",
    channel,
  ];
  if (limit) {
    args.unshift("--playlist-end", String(limit));
  }

  console.log("→ récupération du catalogue (peut prendre 30–90s)…");
  const raw = execFileSync(ytDlp, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  const playlist = JSON.parse(raw) as {
    title?: string;
    channel?: string;
    channel_id?: string;
    uploader_id?: string;
    entries?: FlatVideo[];
  };

  const entries = (playlist.entries ?? []).filter((e) => e?.id);
  const videos = entries.map((e, i) => {
    const id = e.id!;
    const url = e.url?.startsWith("http")
      ? e.url
      : e.webpage_url ?? `https://www.youtube.com/watch?v=${id}`;
    return {
      index: i + 1,
      id,
      title: e.title ?? "",
      url,
      durationSec: e.duration ?? null,
      uploadDate: e.upload_date ?? null,
      viewCount: e.view_count ?? null,
    };
  });

  const payload = {
    fetchedAt: new Date().toISOString(),
    channelUrl: channel,
    channelTitle: playlist.title ?? playlist.channel ?? null,
    channelId: playlist.channel_id ?? null,
    count: videos.length,
    videos,
  };

  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

  // CSV léger à côté (pratique pour coller dans un sheet)
  const csvPath = out.replace(/\.json$/i, ".csv");
  const csvLines = [
    "index,id,title,url,durationSec,uploadDate,viewCount",
    ...videos.map((v) =>
      [
        v.index,
        v.id,
        `"${(v.title || "").replace(/"/g, '""')}"`,
        v.url,
        v.durationSec ?? "",
        v.uploadDate ?? "",
        v.viewCount ?? "",
      ].join(",")
    ),
  ];
  writeFileSync(csvPath, csvLines.join("\n") + "\n", "utf8");

  console.log(`\n✔ ${videos.length} vidéos`);
  console.log(`  JSON : ${out}`);
  console.log(`  CSV  : ${csvPath}`);

  if (hasFlag("--print")) {
    for (const v of videos) {
      console.log(`${v.index}\t${v.url}\t${v.title}`);
    }
  } else {
    console.log("\nAperçu (10 premières) :");
    for (const v of videos.slice(0, 10)) {
      console.log(`  ${v.index}. ${v.title}`);
      console.log(`     ${v.url}`);
    }
    if (videos.length > 10) {
      console.log(`  … +${videos.length - 10} autres`);
    }
  }
}

main();
