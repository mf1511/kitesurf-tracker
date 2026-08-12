/**
 * Importe la formation « Twintip avancé » :
 * 1) Compresse chaque MP4 (≤ ~42 Mo, 720p H.264)
 * 2) Merge sur figures existantes OU crée des figures (active: false)
 * 3) Upload Storage bucket figure-videos
 *
 * Usage :
 *   npx tsx scripts/import-avance-videos.ts
 *   npx tsx scripts/import-avance-videos.ts --dry-run
 *   npx tsx scripts/import-avance-videos.ts --skip-compress
 *
 * Source : ~/Downloads/2) Twintip avancé 2
 */
import { execFileSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import {
  normalizeTwintipAvanceSection,
  TWINTIP_AVANCE_CATEGORY,
} from "../src/lib/twintip-avance";

const CATEGORY = TWINTIP_AVANCE_CATEGORY;
const BUCKET = "figure-videos";
const MAX_OUT_BYTES = 42 * 1024 * 1024;
const SOURCE_DIR =
  process.env.AVANCE_SOURCE ??
  path.join(process.env.HOME ?? "", "Downloads", "2) Twintip avancé 2");
const OUT_DIR =
  process.env.AVANCE_OUT ??
  path.join(process.cwd(), ".tmp", "avance-compressed");

const DRY = process.argv.includes("--dry-run");
const SKIP_COMPRESS = process.argv.includes("--skip-compress");

/**
 * Vidéo trick → figure existante (catégorie / active inchangés).
 * Clé = slugify(libellé fichier sans préfixe « N) »).
 */
const MERGE_BY_SLUG: Record<
  string,
  { figureSlug: string; displayName?: string }
> = {
  "la-transition": { figureSlug: "transition-simple" },
  "les-bases-du-saut-aile-haute": { figureSlug: "saut-droit" },
  "l-amorce-du-saut": { figureSlug: "saut-droit" },
  "que-faire-une-fois-en-l-air": { figureSlug: "saut-droit" },
  "la-reception-du-saut": { figureSlug: "saut-droit" },
  "sauter-plus-haut": { figureSlug: "saut-droit" },
  "analyse-technique-du-saut-014": { figureSlug: "saut-droit" },
  "le-tail-grab": { figureSlug: "grab-tail" },
  "analyse-technique-tail-grab-016": { figureSlug: "grab-tail" },
  "le-one-foot": { figureSlug: "one-foot-air" },
  "le-board-off": { figureSlug: "board-off" },
  "decouvrir-le-backroll": { figureSlug: "backroll-simple" },
  "analyse-technique-backroll-002": { figureSlug: "backroll-simple" },
  "decouvrir-le-frontroll": { figureSlug: "frontroll-simple" },
  "analyse-technique-frontroll": { figureSlug: "frontroll-simple" },
  "le-saut-transition": { figureSlug: "jump-transition" },
  "le-backroll-transition": { figureSlug: "backroll-transition" },
  "comprendre-le-kiteloop": { figureSlug: "kite-loop-simple" },
  "le-kiteloop-premiere-approche": { figureSlug: "kite-loop-simple" },
  "les-kiteloops-engages": { figureSlug: "kite-loop-simple" },
  "les-loops-de-reception": { figureSlug: "kite-loop-pendant-saut" },
  "le-backroll-hand-drag": { figureSlug: "hand-drag-backroll" },
  "le-darkslide": { figureSlug: "darkslide" },
  "analyse-technique-darkslide-010": { figureSlug: "darkslide" },
  "le-toeside": { figureSlug: "toe-side-riding" },
  "le-blind": { figureSlug: "riding-blind" },
};

/**
 * Création forcée (slug / nom / catégorie).
 * Sinon : avance-{slug} dans « Twintip avancé », active: false.
 */
const CREATE_OVERRIDE: Record<
  string,
  { slug: string; name: string; category?: string }
> = {
  "la-fleche": {
    slug: "avance-la-fleche-bis",
    name: "La flèche bis",
  },
  "le-role-des-lignes": {
    slug: "avance-le-role-des-lignes-bis",
    name: "Le rôle des lignes bis",
  },
  "le-beachstart": {
    slug: "beach-start",
    name: "Beachstart",
    category: "Bases et transitions",
  },
  "lacher-une-main": {
    slug: "one-hand-jump",
    name: "Lâcher une main",
    category: "Sauts & Big Air",
  },
  "le-saut-aile-basse-basique": {
    slug: "low-kite-jump",
    name: "Saut aile basse",
    category: "Sauts & Big Air",
  },
  "le-saut-aile-basse-avance": {
    slug: "low-kite-jump-advanced",
    name: "Saut aile basse avancé",
    category: "Sauts & Big Air",
  },
  "le-saut-transitioin-grabe": {
    slug: "jump-transition-grab",
    name: "Saut transition grabé",
    category: "Sauts & Big Air",
  },
  "le-toeslide": {
    slug: "toeslide",
    name: "Toeslide",
    category: "Surface tricks & drags",
  },
  "le-toeside-ole": {
    slug: "toeside-ole",
    name: "Toeside ole",
    category: "Toeside freestyle",
  },
  "le-blind-ole": {
    slug: "blind-ole",
    name: "Blind olé",
    category: "Surface tricks & drags",
  },
};

type Lesson = {
  sectionIndex: number;
  sectionName: string;
  lessonIndex: number;
  name: string;
  slug: string;
  sourcePath: string;
  order: number;
};

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
    if (!process.env[k]) process.env[k] = v;
  }
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parsePrefixed(name: string): { index: number; label: string } {
  const m = name.normalize("NFC").match(/^(\d+)\)\s*(.+?)(?:\.mp4)?$/i);
  if (!m) return { index: 99, label: name.replace(/\.mp4$/i, "") };
  return { index: parseInt(m[1], 10), label: m[2].trim() };
}

function listLessons(root: string): Lesson[] {
  const lessons: Lesson[] = [];
  const sections = readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => {
      const p = parsePrefixed(d.name);
      return { dir: path.join(root, d.name), ...p };
    })
    .sort((a, b) => a.index - b.index);

  for (const sec of sections) {
    const files = readdirSync(sec.dir)
      .filter((f) => f.toLowerCase().endsWith(".mp4") && !f.startsWith("."))
      .map((f) => {
        const p = parsePrefixed(f);
        return { file: f, ...p };
      })
      .sort((a, b) => a.index - b.index || a.label.localeCompare(b.label, "fr"));

    let seq = 0;
    for (const f of files) {
      seq += 1;
      const slug = slugify(f.label);
      lessons.push({
        sectionIndex: sec.index,
        sectionName: normalizeTwintipAvanceSection(sec.label),
        lessonIndex: f.index,
        name: f.label.normalize("NFC"),
        slug,
        sourcePath: path.join(sec.dir, f.file),
        // seq évite collisions si deux « 2) » dans le même module
        order: sec.index * 100 + f.index * 10 + (seq % 10),
      });
    }
  }
  return lessons;
}

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

function compress(src: string, dest: string): void {
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
  const targetBits = 40 * 1024 * 1024 * 8;
  const videoKbps = Math.max(
    300,
    Math.min(1400, Math.floor(targetBits / duration / 1000) - 80)
  );

  console.log(
    `  compress ${path.basename(src)} → ${videoKbps} kbps / 720p (~${Math.round(duration)}s)`
  );

  const run = (vf: string, vbr: number, abr: number, out: string) => {
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
  };

  run("scale='min(1280,iw)':-2", videoKbps, 80, dest);
  let size = statSync(dest).size;

  if (size > MAX_OUT_BYTES) {
    console.log(`  encore trop gros (${(size / 1024 / 1024).toFixed(1)} Mo) → 540p`);
    const tmp = dest + ".retry.mp4";
    run("scale='min(960,iw)':-2", Math.max(250, Math.floor(videoKbps * 0.65)), 64, tmp);
    unlinkSync(dest);
    execFileSync("mv", [tmp, dest]);
    size = statSync(dest).size;
  }

  if (size > MAX_OUT_BYTES) {
    console.log(`  encore trop gros (${(size / 1024 / 1024).toFixed(1)} Mo) → 480p CRF 30`);
    const tmp = dest + ".crf.mp4";
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        src,
        "-vf",
        "scale='min(854,iw)':-2",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-movflags",
        "+faststart",
        tmp,
      ],
      { stdio: ["ignore", "ignore", "inherit"] }
    );
    unlinkSync(dest);
    execFileSync("mv", [tmp, dest]);
    size = statSync(dest).size;
  }

  if (size > MAX_OUT_BYTES) {
    throw new Error(
      `Compression échouée : ${(size / 1024 / 1024).toFixed(1)} Mo > 42 Mo (${src})`
    );
  }
  console.log(`  → ${(size / 1024 / 1024).toFixed(1)} Mo`);
}

function newVideoId(): string {
  return `vid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

async function main() {
  loadEnv();
  if (!existsSync(SOURCE_DIR)) {
    throw new Error(`Dossier source introuvable : ${SOURCE_DIR}`);
  }

  const lessons = listLessons(SOURCE_DIR);
  console.log(`\n${lessons.length} leçons trouvées dans ${SOURCE_DIR}\n`);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(lessons, null, 2)
  );

  if (DRY) {
    for (const l of lessons) {
      const merge = MERGE_BY_SLUG[l.slug];
      const ov = CREATE_OVERRIDE[l.slug];
      const dest = merge
        ? `merge ${merge.figureSlug}`
        : ov
          ? `new ${ov.slug} (${ov.category ?? CATEGORY})`
          : `new avance-${l.slug}`;
      console.log(`[${l.order}] ${l.sectionName} › ${l.name}  ⟶ ${dest}`);
    }
    console.log("\n--dry-run : stop.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants");
  }

  // Pool serré + timeout long : les compressions ffmpeg durent plusieurs minutes
  const dbUrl = (() => {
    const base = process.env.DATABASE_URL!;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}connection_limit=3&pool_timeout=120`;
  })();
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /** Ping DB ; reconnecte si le pool a timeout pendant ffmpeg */
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

  for (const lesson of lessons) {
    console.log(`\n▶ ${lesson.sectionName} — ${lesson.name}`);
    try {
      await ensureDb();

      const merge = MERGE_BY_SLUG[lesson.slug];
      const override = CREATE_OVERRIDE[lesson.slug];
      const createSlug = override?.slug ?? `avance-${lesson.slug}`;
      const createName = override?.name ?? lesson.name;
      const createCategory = override?.category ?? CATEGORY;

      // Resolve figure avant compress pour skipper vite les déjà importées
      let figure = merge
        ? await prisma.figure.findUnique({ where: { slug: merge.figureSlug } })
        : await prisma.figure.findUnique({ where: { slug: createSlug } });

      if (merge && !figure) {
        console.warn(
          `  merge cible ${merge.figureSlug} introuvable → création ${createSlug}`
        );
      }

      if (!figure) {
        // Nouvelles figures : toujours inactive (demande produit)
        figure = await prisma.figure.create({
          data: {
            slug: merge ? `avance-${lesson.slug}` : createSlug,
            name: merge ? lesson.name : createName,
            category: merge ? CATEGORY : createCategory,
            description: `Module « ${lesson.sectionName} » — formation Twintip avancé.`,
            steps: JSON.stringify([
              "Regarde la vidéo jusqu’au bout",
              "Reproduis les points clés à sec",
              "Pratique en conditions adaptées",
            ]),
            order: lesson.order,
            active: false,
          },
        });
        console.log(`  figure créée ${figure.slug} (inactive)`);
      } else if (!merge) {
        // Idempotence création : maj méta, garde active tel quel
        figure = await prisma.figure.update({
          where: { id: figure.id },
          data: {
            name: createName,
            category: createCategory,
            description: `Module « ${lesson.sectionName} » — formation Twintip avancé.`,
            order: Math.min(figure.order || lesson.order, lesson.order),
          },
        });
        console.log(`  figure maj ${figure.slug}`);
      } else {
        // Merge : on n’active PAS et on ne change pas la catégorie
        console.log(
          `  merge → ${figure.slug} (${figure.category}, active=${figure.active})`
        );
      }

      const already = await prisma.video.findFirst({
        where: { figureId: figure.id, title: lesson.name },
      });
      if (already) {
        console.log(`  vidéo déjà en base (${already.id}), skip`);
        ok++;
        continue;
      }

      const compressed = path.join(
        OUT_DIR,
        `${lesson.order.toString().padStart(4, "0")}-${lesson.slug}.mp4`
      );

      if (!SKIP_COMPRESS) {
        compress(lesson.sourcePath, compressed);
      } else if (!existsSync(compressed)) {
        console.warn("  fichier compressé manquant, skip");
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
          title: lesson.name,
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
        throw new Error(`Upload Storage échoué : ${error.message}`);
      }

      try {
        unlinkSync(compressed);
      } catch {
        /* ignore */
      }
      ok++;
    } catch (err) {
      failed++;
      console.error(
        `  ✖ échec leçon (on continue) :`,
        err instanceof Error ? err.message : err
      );
    }
  }

  console.log(
    `\n✔ ${ok} leçons importées, ${skipped} skip, ${failed} échec(s)`
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
