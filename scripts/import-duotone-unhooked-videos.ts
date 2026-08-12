/**
 * Download (yt-dlp) + compress + import vidéos Duotone Academy Unhooked.
 * Si la figure a déjà des vidéos → on AJOUTÉ (skip seulement si même titre).
 *
 * Usage :
 *   npx tsx scripts/import-duotone-unhooked-videos.ts --dry-run
 *   npx tsx scripts/import-duotone-unhooked-videos.ts
 *   npx tsx scripts/import-duotone-unhooked-videos.ts --skip-download
 *   npx tsx scripts/import-duotone-unhooked-videos.ts --skip-compress
 *   npx tsx scripts/import-duotone-unhooked-videos.ts --only=id1,id2
 *
 * Prérequis : yt-dlp, ffmpeg, .env (DATABASE_URL, Supabase)
 */
import { execFileSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import {
  DUOTONE_UNHOOKED_LESSONS,
  type DuotoneUnhookedLesson,
} from "./data/duotone-unhooked-catalog";
import { compressUnderLimit } from "./lib/compress-under-limit";

const BUCKET = "figure-videos";
const RAW_DIR = path.join(process.cwd(), ".tmp", "duotone-unhooked-raw");
const OUT_DIR = path.join(process.cwd(), ".tmp", "duotone-unhooked-compressed");

const DRY = process.argv.includes("--dry-run");
const SKIP_DOWNLOAD = process.argv.includes("--skip-download");
const SKIP_COMPRESS = process.argv.includes("--skip-compress");
const ONLY_ARG = process.argv.find((a) => a.startsWith("--only="));
const ONLY = ONLY_ARG
  ? new Set(ONLY_ARG.slice("--only=".length).split(",").filter(Boolean))
  : null;

function loadEnv() {
  const map: Record<string, string> = {};
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    map[k] = v;
  }
  for (const [k, v] of Object.entries(map)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function findYtDlp(): string {
  try {
    return execFileSync("which", ["yt-dlp"], { encoding: "utf8" }).trim();
  } catch {
    throw new Error("yt-dlp introuvable — brew install yt-dlp");
  }
}

function newVideoId(): string {
  return `vid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function findRawFile(youtubeId: string): string | null {
  if (!existsSync(RAW_DIR)) return null;
  const hit = readdirSync(RAW_DIR).find(
    (f) => f.startsWith(youtubeId + ".") && !f.endsWith(".part")
  );
  return hit ? path.join(RAW_DIR, hit) : null;
}

function download(lesson: DuotoneUnhookedLesson, ytDlp: string): string {
  const existing = findRawFile(lesson.youtubeId);
  if (existing && statSync(existing).size > 1000) {
    console.log(`  skip download (déjà) ${path.basename(existing)}`);
    return existing;
  }
  mkdirSync(RAW_DIR, { recursive: true });
  const outTpl = path.join(RAW_DIR, `${lesson.youtubeId}.%(ext)s`);
  console.log(`  download ${lesson.youtubeId}…`);
  try {
    execFileSync(
      ytDlp,
      [
        "-f",
        "bv*[height<=1080]+ba/b[height<=1080]/b",
        "--merge-output-format",
        "mp4",
        "--retries",
        "5",
        "--extractor-args",
        "youtube:player_client=android,ios,web",
        "-o",
        outTpl,
        "--no-playlist",
        lesson.url,
      ],
      { stdio: ["ignore", "inherit", "pipe"] }
    );
  } catch (e) {
    const err = e as { stderr?: Buffer; message?: string };
    const stderr = err.stderr?.toString("utf8") || err.message || "";
    if (/members-only/i.test(stderr)) throw new Error("members-only");
    throw new Error(stderr.trim().split("\n").filter(Boolean).pop() || "yt-dlp failed");
  }
  const found = findRawFile(lesson.youtubeId);
  if (!found) throw new Error(`Download OK mais fichier introuvable pour ${lesson.youtubeId}`);
  return found;
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquant");

  console.log(`\n${DUOTONE_UNHOOKED_LESSONS.length} leçons Duotone Academy Unhooked\n`);
  if (DRY) {
    for (const l of DUOTONE_UNHOOKED_LESSONS) {
      const dest = l.mergeSlug
        ? `merge → ${l.mergeSlug}`
        : `create ${l.create!.slug} (${l.create!.category})`;
      console.log(`[${l.youtubeId}] ${l.title}\n  ${dest}`);
    }
    console.log("\n(dry-run — rien téléchargé)");
    return;
  }

  const ytDlp = findYtDlp();
  const dbUrl = (() => {
    const base = process.env.DATABASE_URL!;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}connection_limit=3&pool_timeout=120`;
  })();
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function ensureDb() {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      console.warn("  reconnect Prisma…");
      await prisma.$disconnect().catch(() => null);
      await prisma.$connect();
    }
  }

  await ensureDb();
  const admin =
    (await prisma.user.findFirst({ where: { role: "admin" } })) ??
    (await prisma.user.findFirst());
  if (!admin) throw new Error("Aucun utilisateur en base pour Video.userId");

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const lesson of DUOTONE_UNHOOKED_LESSONS) {
    if (ONLY && !ONLY.has(lesson.youtubeId)) continue;
    console.log(`\n▶ ${lesson.title}`);
    try {
      await ensureDb();

      // Resolve figure
      let figure = lesson.mergeSlug
        ? await prisma.figure.findUnique({ where: { slug: lesson.mergeSlug } })
        : await prisma.figure.findUnique({
            where: { slug: lesson.create!.slug },
          });

      if (lesson.mergeSlug && !figure) {
        throw new Error(`Figure merge introuvable : ${lesson.mergeSlug}`);
      }

      if (!figure && lesson.create) {
        // Nouvelles figures (Sécurité / Tutoriels / Kitefoil / Wingfoil / Strapless…) : inactive
        figure = await prisma.figure.create({
          data: {
            slug: lesson.create.slug,
            name: lesson.create.name,
            category: lesson.create.category,
            description:
              lesson.create.description ??
              "Duotone Academy — Unhooked.",
            steps: JSON.stringify([
              "Regarde la vidéo jusqu’au bout",
              "Note 1–2 points à appliquer",
              "Pratique en conditions adaptées",
            ]),
            order: 9000,
            active: false,
          },
        });
        console.log(`  figure créée ${figure.slug} (inactive)`);
      } else if (figure && lesson.create) {
        console.log(`  figure ${figure.slug} (${figure.category})`);
      } else if (figure) {
        console.log(
          `  merge → ${figure.slug} (${figure.category}, active=${figure.active})`
        );
      }

      if (!figure) throw new Error("Figure non résolue");

      // Idempotent par titre : sinon on AJOUTÉ une vidéo (order max+1)
      const already = await prisma.video.findFirst({
        where: { figureId: figure.id, title: lesson.title },
      });
      if (already) {
        console.log(`  vidéo déjà en base (${already.id}), skip`);
        ok++;
        continue;
      }

      let raw: string;
      if (SKIP_DOWNLOAD) {
        const f = findRawFile(lesson.youtubeId);
        if (!f) {
          console.warn("  raw manquant, skip");
          skipped++;
          continue;
        }
        raw = f;
      } else {
        raw = download(lesson, ytDlp);
      }

      const compressed = path.join(OUT_DIR, `${lesson.youtubeId}.mp4`);
      if (!SKIP_COMPRESS) {
        compressUnderLimit(raw, compressed);
      } else if (!existsSync(compressed)) {
        console.warn("  compressé manquant, skip");
        skipped++;
        continue;
      }

      await ensureDb();
      const sizeBytes = statSync(compressed).size;
      const videoId = newVideoId();
      const storagePath = `${figure.id}/${videoId}.mp4`;
      const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${storagePath}`;

      const maxOrder = await prisma.video.aggregate({
        where: { figureId: figure.id },
        _max: { order: true },
      });
      const videoOrder = (maxOrder._max.order ?? -1) + 1;

      await prisma.video.create({
        data: {
          id: videoId,
          figureId: figure.id,
          userId: admin.id,
          url: publicUrl,
          storagePath,
          title: lesson.title,
          mimeType: "video/mp4",
          sizeBytes,
          order: videoOrder,
        },
      });

      console.log(
        `  upload ${storagePath} (${(sizeBytes / 1024 / 1024).toFixed(1)} Mo)`
      );
      const buf = readFileSync(compressed);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buf, {
          contentType: "video/mp4",
          upsert: false,
        });
      if (error) {
        await prisma.video.delete({ where: { id: videoId } }).catch(() => null);
        throw new Error(`Upload Storage : ${error.message}`);
      }

      try {
        unlinkSync(compressed);
      } catch {
        /* ignore */
      }
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/members-only/i.test(msg)) {
        console.log("  skip members-only");
        skipped++;
      } else {
        failed++;
        console.error(`  ✖ échec (on continue) :`, msg);
      }
    }
  }

  console.log(
    `\n✔ ${ok} importées, ${skipped} skip, ${failed} échec(s)`
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
