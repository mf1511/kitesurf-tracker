/**
 * Migre les vidéos figure-videos de Supabase Storage → Cloudflare R2,
 * puis met à jour Video.url vers l’URL publique R2.
 *
 * Prérequis (.env) :
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_NAME, NEXT_PUBLIC_R2_PUBLIC_BASE_URL
 *   + DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL (source)
 *
 * Usage :
 *   npx tsx scripts/migrate-videos-to-r2.ts           # dry-run
 *   npx tsx scripts/migrate-videos-to-r2.ts --apply
 *   npx tsx scripts/migrate-videos-to-r2.ts --apply --delete-supabase
 *   npx tsx scripts/migrate-videos-to-r2.ts --apply --limit=5
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import {
  isR2Enabled,
  putR2Object,
  r2ObjectExists,
} from "../src/lib/r2";

function publicVideoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "");
  return `${base}/${storagePath}`;
}

const APPLY = process.argv.includes("--apply");
const DELETE_SUPABASE = process.argv.includes("--delete-supabase");
const LIMIT = (() => {
  const a = process.argv.find((x) => x.startsWith("--limit="));
  return a ? Math.max(1, parseInt(a.split("=")[1], 10) || 0) : 0;
})();
const CONCURRENCY = 3;
const SUPABASE_BUCKET = "figure-videos";

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

function r2PublicBase() {
  return process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "");
}

function alreadyOnR2(url: string): boolean {
  return url.startsWith(r2PublicBase() + "/");
}

async function mapPool<T>(
  items: T[],
  size: number,
  fn: (item: T, i: number) => Promise<void>
) {
  let i = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

async function main() {
  loadEnv();
  if (!isR2Enabled()) {
    throw new Error(
      "R2 non configuré — vois docs/r2-setup.md (.env R2_* + NEXT_PUBLIC_R2_PUBLIC_BASE_URL)"
    );
  }

  const prisma = new PrismaClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase =
    supabaseUrl && serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;

  let videos = await prisma.video.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      url: true,
      storagePath: true,
      mimeType: true,
      sizeBytes: true,
      title: true,
    },
  });
  if (LIMIT > 0) videos = videos.slice(0, LIMIT);

  const pending = videos.filter((v) => !alreadyOnR2(v.url));
  const skipped = videos.length - pending.length;
  const bytes = pending.reduce((a, v) => a + (v.sizeBytes ?? 0), 0);

  console.log(
    `${APPLY ? "APPLY" : "DRY-RUN"} — ${pending.length} à migrer, ${skipped} déjà R2, ~${(
      bytes / 1e9
    ).toFixed(2)} Go`
  );
  if (!APPLY) {
    for (const v of pending.slice(0, 10)) {
      console.log(
        `  ${v.storagePath} | ${((v.sizeBytes ?? 0) / 1e6).toFixed(1)} Mo | ${v.title ?? ""}`
      );
    }
    if (pending.length > 10) console.log(`  … +${pending.length - 10}`);
    await prisma.$disconnect();
    return;
  }

  let ok = 0;
  let fail = 0;

  await mapPool(pending, CONCURRENCY, async (v) => {
    const label = v.storagePath;
    try {
      // Skip upload si déjà présent (reprise)
      const exists = await r2ObjectExists(v.storagePath);
      if (!exists) {
        let buf: Buffer | null = null;

        // 1) URL publique actuelle
        const res = await fetch(v.url);
        if (res.ok) {
          buf = Buffer.from(await res.arrayBuffer());
        } else if (supabase) {
          // 2) Fallback download auth Supabase
          const { data, error } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .download(v.storagePath);
          if (error || !data) {
            throw new Error(
              `download fail HTTP ${res.status} / supabase ${error?.message}`
            );
          }
          buf = Buffer.from(await data.arrayBuffer());
        } else {
          throw new Error(`download fail HTTP ${res.status}`);
        }

        await putR2Object(
          v.storagePath,
          buf,
          v.mimeType || "video/mp4"
        );
      }

      const newUrl = publicVideoUrl(v.storagePath);
      await prisma.video.update({
        where: { id: v.id },
        data: { url: newUrl },
      });

      if (DELETE_SUPABASE && supabase) {
        await supabase.storage
          .from(SUPABASE_BUCKET)
          .remove([v.storagePath])
          .catch(() => null);
      }

      ok++;
      console.log(`OK ${ok}/${pending.length} ${label}`);
    } catch (e) {
      fail++;
      console.error(`FAIL ${label}`, e instanceof Error ? e.message : e);
    }
  });

  console.log(`Done — ok=${ok} fail=${fail}`);
  await prisma.$disconnect();
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
