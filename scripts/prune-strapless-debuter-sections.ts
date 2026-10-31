/**
 * Supprime les vidéos :
 * - catégorie Strapless (toutes)
 * - Débuter › Sur la plage | À l'eau | Adapter sa pratique
 *
 * Usage:
 *   npx tsx scripts/prune-strapless-debuter-sections.ts
 *   npx tsx scripts/prune-strapless-debuter-sections.ts --apply
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolveDebuterSection } from "../src/lib/debuter";

const BUCKET = "figure-videos";
const APPLY = process.argv.includes("--apply");
const TARGET_DEBUTER = new Set([
  "Sur la plage",
  "À l'eau",
  "Adapter sa pratique",
]);

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
      slug: true,
      category: true,
      description: true,
      order: true,
      videos: {
        select: {
          id: true,
          title: true,
          sizeBytes: true,
          storagePath: true,
        },
      },
    },
  });

  const toDelete: {
    id: string;
    storagePath: string;
    reason: string;
    slug: string;
    title: string;
    sizeBytes: number;
  }[] = [];

  for (const f of figures) {
    let reason: string | null = null;
    if (f.category === "Strapless") reason = "Strapless";
    else if (f.category === "Débuter") {
      const sec = resolveDebuterSection(f.description, f.order);
      if (sec && TARGET_DEBUTER.has(sec)) reason = `Débuter › ${sec}`;
    }
    if (!reason) continue;
    for (const v of f.videos) {
      toDelete.push({
        id: v.id,
        storagePath: v.storagePath,
        reason,
        slug: f.slug,
        title: v.title ?? "(sans titre)",
        sizeBytes: v.sizeBytes ?? 0,
      });
    }
  }

  const bytes = toDelete.reduce((a, v) => a + v.sizeBytes, 0);
  console.log(
    `${APPLY ? "APPLY" : "DRY-RUN"} — ${toDelete.length} vidéos, ${(
      bytes / 1e9
    ).toFixed(2)} Go`
  );

  const byReason = new Map<string, number>();
  for (const v of toDelete) {
    byReason.set(v.reason, (byReason.get(v.reason) ?? 0) + 1);
  }
  for (const [r, n] of byReason) console.log(`  ${r}: ${n}`);

  if (!APPLY) {
    await prisma.$disconnect();
    return;
  }

  const paths = toDelete.map((v) => v.storagePath);
  for (let i = 0; i < paths.length; i += 50) {
    const chunk = paths.slice(i, i + 50);
    const { error } = await supabase.storage.from(BUCKET).remove(chunk);
    if (error) console.error(`storage batch ${i}:`, error.message);
    else console.log(`storage OK ${i + chunk.length}/${paths.length}`);
  }

  const { count } = await prisma.video.deleteMany({
    where: { id: { in: toDelete.map((v) => v.id) } },
  });
  console.log(`DB deleted ${count} rows`);

  const left = await prisma.video.findMany({ select: { sizeBytes: true } });
  const total = left.reduce((a, v) => a + (v.sizeBytes ?? 0), 0);
  console.log(`RESTE: ${left.length} vidéos, ${(total / 1e9).toFixed(2)} Go`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
