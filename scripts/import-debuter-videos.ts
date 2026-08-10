/**
 * Importe la formation « Vers l'autonomie du twintip » en catégorie Débuter :
 * 1) Compresse chaque MP4 (≤ ~90 Mo, 720p H.264)
 * 2) Crée / met à jour les figures
 * 3) Upload vers Supabase Storage (bucket figure-videos)
 *
 * Usage :
 *   npx tsx scripts/import-debuter-videos.ts
 *   npx tsx scripts/import-debuter-videos.ts --dry-run
 *   npx tsx scripts/import-debuter-videos.ts --skip-compress   # si déjà compressé
 *
 * Source par défaut : ~/Downloads/1) Vers l_autonomie du twintip 2
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

const CATEGORY = "Débuter";
const BUCKET = "figure-videos";
/** Limite Storage Supabase Free/Pro par défaut ≈ 50 Mo — on vise 42 Mo */
const MAX_OUT_BYTES = 42 * 1024 * 1024;
const SOURCE_DIR =
  process.env.DEBUTER_SOURCE ??
  path.join(
    process.env.HOME ?? "",
    "Downloads",
    "1) Vers l_autonomie du twintip 2"
  );
const OUT_DIR =
  process.env.DEBUTER_OUT ??
  path.join(process.cwd(), ".tmp", "debuter-compressed");

const DRY = process.argv.includes("--dry-run");
const SKIP_COMPRESS = process.argv.includes("--skip-compress");

/**
 * Doublons « À l'eau » → figure existante (déplacée en Débuter, slug conservé).
 * displayName : libellé final si plusieurs vidéos fusionnent sur la même figure.
 */
const MERGE_BY_SLUG: Record<
  string,
  { figureSlug: string; displayName?: string }
> = {
  "la-nage-tractee": { figureSlug: "body-drag", displayName: "La nage tractée" },
  "la-nage-tractee-avec-la-planche": {
    figureSlug: "body-drag-with-board",
    displayName: "La nage tractée avec la planche",
  },
  "le-waterstart": { figureSlug: "water-start", displayName: "Le waterstart" },
  "la-gestion-de-la-vitesse": {
    figureSlug: "edging-control",
    displayName: "Edging & contrôle de vitesse",
  },
  "le-crantage": {
    figureSlug: "edging-control",
    displayName: "Edging & contrôle de vitesse",
  },
  "la-remontee-au-vent": {
    figureSlug: "riding-upwind",
    displayName: "La remontée au vent",
  },
  "la-transition": {
    figureSlug: "transition-simple",
    displayName: "La transition",
  },
  "analyse-technique-transition-014": {
    figureSlug: "transition-simple",
    displayName: "La transition",
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

/** Normalise pour slugs (accents, underscores, etc.) */
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

/** Export Drive : « À l_eau » → « À l'eau » */
function tidySectionLabel(label: string): string {
  const t = label.trim();
  if (/^à\s*l_eau$/iu.test(t) || /^a\s*l_eau$/iu.test(t)) return "À l'eau";
  return t;
}

/** "1) Les bases essentielles" → { index: 1, name: "Les bases essentielles" } */
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
      .sort((a, b) => a.index - b.index);

    for (const f of files) {
      const slug = slugify(f.label);
      lessons.push({
        sectionIndex: sec.index,
        sectionName: tidySectionLabel(sec.label),
        lessonIndex: f.index,
        name: f.label,
        slug,
        sourcePath: path.join(sec.dir, f.file),
        order: sec.index * 100 + f.index,
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

/** Compresse vers ≤ MAX_OUT_BYTES (bitrate calculé + fallback CRF) */
function compress(src: string, dest: string): void {
  mkdirSync(path.dirname(dest), { recursive: true });
  if (existsSync(dest) && statSync(dest).size > 0 && statSync(dest).size <= MAX_OUT_BYTES) {
    console.log(`  skip compress (déjà OK) ${path.basename(dest)}`);
    return;
  }

  const duration = probeDurationSec(src);
  // Budget ~40 Mo → kbps total, dont ~80k audio
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
    const vbr2 = Math.max(250, Math.floor(videoKbps * 0.65));
    run("scale='min(960,iw)':-2", vbr2, 64, tmp);
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

  // Manifest pour reprise
  mkdirSync(OUT_DIR, { recursive: true });
  const manifestPath = path.join(OUT_DIR, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(lessons, null, 2));

  if (DRY) {
    for (const l of lessons) {
      const merge = MERGE_BY_SLUG[l.slug];
      console.log(
        `[${l.order}] ${l.sectionName} › ${l.name}` +
          (merge ? `  ⟶ merge ${merge.figureSlug}` : "  ⟶ new")
      );
    }
    console.log("\n--dry-run : stop.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants");
  }

  const prisma = new PrismaClient();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const admin =
    (await prisma.user.findFirst({ where: { role: "admin" } })) ??
    (await prisma.user.findFirst());
  if (!admin) throw new Error("Aucun utilisateur en base pour Video.userId");

  // Figures déjà en Débuter (idempotence)
  const existingDebut = await prisma.figure.findMany({
    where: { category: CATEGORY },
    select: { id: true, slug: true },
  });
  const debutBySlug = new Map(existingDebut.map((f) => [f.slug, f.id]));

  let ok = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    console.log(`\n▶ ${lesson.sectionName} — ${lesson.name}`);
    const compressed = path.join(OUT_DIR, `${lesson.order.toString().padStart(3, "0")}-${lesson.slug}.mp4`);

    if (!SKIP_COMPRESS) {
      compress(lesson.sourcePath, compressed);
    } else if (!existsSync(compressed)) {
      console.warn("  fichier compressé manquant, skip");
      skipped++;
      continue;
    }

    const sizeBytes = statSync(compressed).size;
    const merge = MERGE_BY_SLUG[lesson.slug];
    const debutSlug = `debuter-${lesson.slug}`;

    // Résoudre / créer la figure
    let figure = merge
      ? await prisma.figure.findUnique({ where: { slug: merge.figureSlug } })
      : await prisma.figure.findUnique({ where: { slug: debutSlug } });

    if (merge && !figure) {
      console.warn(`  merge cible ${merge.figureSlug} introuvable → création Débuter`);
    }

    if (!figure) {
      figure = await prisma.figure.create({
        data: {
          slug: debutSlug,
          name: lesson.name,
          category: CATEGORY,
          description: `Module « ${lesson.sectionName} » — formation vers l'autonomie twintip.`,
          steps: JSON.stringify([
            "Regarde la vidéo jusqu’au bout",
            "Reproduis les points clés à sec",
            "Pratique en conditions adaptées",
          ]),
          order: lesson.order,
          active: true,
        },
      });
      console.log(`  figure créée ${figure.slug}`);
    } else {
      // Déplace en Débuter — slug historique conservé (prérequis / liens)
      const displayName = merge?.displayName ?? lesson.name;
      // Garde le plus petit order si plusieurs vidéos (ex. edging : 505 puis 508)
      const nextOrder =
        figure.category === CATEGORY
          ? Math.min(figure.order, lesson.order)
          : lesson.order;
      figure = await prisma.figure.update({
        where: { id: figure.id },
        data: {
          category: CATEGORY,
          name: displayName,
          description: `Module « ${lesson.sectionName} » — formation vers l'autonomie twintip.`,
          order: nextOrder,
          active: true,
        },
      });
      console.log(`  figure maj ${figure.slug} → ${CATEGORY}`);
    }
    debutBySlug.set(figure.slug, figure.id);

    // Évite les uploads doublons (même titre sur la figure)
    const already = await prisma.video.findFirst({
      where: { figureId: figure.id, title: lesson.name },
    });
    if (already) {
      console.log(`  vidéo déjà en base (${already.id}), skip upload`);
      // Libère l'espace disque local
      try {
        unlinkSync(compressed);
      } catch {
        /* ignore */
      }
      ok++;
      continue;
    }

    const videoId = newVideoId();
    const storagePath = `${figure.id}/${videoId}.mp4`;
    const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${storagePath}`;

    // Ordre vidéo = max+1
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

    console.log(`  upload ${storagePath} (${(sizeBytes / 1024 / 1024).toFixed(1)} Mo)`);
    const buf = readFileSync(compressed);
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: "video/mp4",
      upsert: false,
    });
    if (error) {
      await prisma.video.delete({ where: { id: videoId } }).catch(() => null);
      throw new Error(`Upload Storage échoué : ${error.message}`);
    }

    // Libère le disque (24 Go libres seulement)
    try {
      unlinkSync(compressed);
    } catch {
      /* ignore */
    }
    ok++;
  }

  // Rapport des figures Bases « déplacées »
  const mergeSlugs = Array.from(
    new Set(Object.values(MERGE_BY_SLUG).map((m) => m.figureSlug))
  );
  const merged = await prisma.figure.findMany({
    where: { slug: { in: mergeSlugs }, category: CATEGORY },
    select: { slug: true, name: true },
  });
  console.log(`\n✔ ${ok} leçons importées, ${skipped} skip`);
  console.log("Figures fusionnées (retirées de Bases et transitions) :");
  for (const f of merged) console.log(`  - ${f.slug} → ${f.name}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
