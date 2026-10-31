/**
 * Sur les figures multi-vidéos qui ont au moins 1 Duotone :
 * garde Duotone + SA Masterclass, supprime le reste (Storage + DB).
 *
 * Usage:
 *   npx tsx scripts/prune-non-duo-sa-dupes.ts          # dry-run
 *   npx tsx scripts/prune-non-duo-sa-dupes.ts --apply  # exécute
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const BUCKET = "figure-videos";
const APPLY = process.argv.includes("--apply");

function loadEnv() {
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
    if (!process.env[k]) process.env[k] = v;
  }
}

function isDuo(title: string | null) {
  return /duotone/i.test(title ?? "");
}

function isSA(title: string | null) {
  const s = title ?? "";
  return (
    /SA Masterclass/i.test(s) ||
    /Kiteboarding SA/i.test(s) ||
    /Kite Foil SA/i.test(s)
  );
}

function keepVideo(title: string | null) {
  return isDuo(title) || isSA(title);
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env manquant");

  const prisma = new PrismaClient();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const figures = await prisma.figure.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      videos: {
        select: {
          id: true,
          title: true,
          sizeBytes: true,
          storagePath: true,
          order: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  const toDelete: {
    id: string;
    slug: string;
    title: string;
    sizeBytes: number;
    storagePath: string;
  }[] = [];

  for (const f of figures) {
    if (f.videos.length < 2) continue;
    if (!f.videos.some((v) => isDuo(v.title))) continue;
    for (const v of f.videos) {
      if (keepVideo(v.title)) continue;
      toDelete.push({
        id: v.id,
        slug: f.slug,
        title: v.title ?? "(sans titre)",
        sizeBytes: v.sizeBytes ?? 0,
        storagePath: v.storagePath,
      });
    }
  }

  const bytes = toDelete.reduce((a, v) => a + v.sizeBytes, 0);
  console.log(
    `${APPLY ? "APPLY" : "DRY-RUN"} — ${toDelete.length} vidéos, ${(
      bytes /
      1e9
    ).toFixed(2)} Go`
  );

  if (!APPLY) {
    for (const v of toDelete.slice(0, 20)) {
      console.log(
        `  ${v.slug} | ${(v.sizeBytes / 1e6).toFixed(1)} Mo | ${v.title}`
      );
    }
    if (toDelete.length > 20) console.log(`  … +${toDelete.length - 20}`);
    await prisma.$disconnect();
    return;
  }

  // Storage par lots
  const paths = toDelete.map((v) => v.storagePath);
  for (let i = 0; i < paths.length; i += 50) {
    const chunk = paths.slice(i, i + 50);
    const { error } = await supabase.storage.from(BUCKET).remove(chunk);
    if (error) {
      console.error(`storage remove batch ${i}:`, error.message);
    } else {
      console.log(`storage OK ${i + chunk.length}/${paths.length}`);
    }
  }

  // DB
  const ids = toDelete.map((v) => v.id);
  const { count } = await prisma.video.deleteMany({
    where: { id: { in: ids } },
  });
  console.log(`DB deleted ${count} rows`);

  // Reorder restant sur figures touchées
  const touched = [...new Set(toDelete.map((v) => v.slug))];
  for (const slug of touched) {
    const vids = await prisma.video.findMany({
      where: { figure: { slug } },
      orderBy: { order: "asc" },
      select: { id: true },
    });
    for (let i = 0; i < vids.length; i++) {
      await prisma.video.update({
        where: { id: vids[i].id },
        data: { order: i },
      });
    }
  }
  console.log(`reordered ${touched.length} figures`);

  // Point post-prune
  const left = await prisma.video.findMany({ select: { sizeBytes: true } });
  const total = left.reduce((a, v) => a + (v.sizeBytes ?? 0), 0);
  console.log(
    `RESTE: ${left.length} vidéos, ${(total / 1e9).toFixed(2)} Go`
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
