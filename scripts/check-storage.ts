/**
 * Smoke test Storage + schéma Video (ne log jamais les secrets).
 * Usage: npx tsx scripts/check-storage.ts
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

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
  return map;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  console.log(
    "NEXT_PUBLIC_SUPABASE_URL:",
    url ? `set → ${url.replace(/\/$/, "")}` : "MISSING"
  );
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    key ? `set (${key.length} chars)` : "MISSING"
  );

  if (!url || !key) process.exit(1);
  if (url.includes("/rest/")) {
    console.error("FAIL: URL must not include /rest/v1");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error("FAIL listBuckets:", bErr.message);
    process.exit(1);
  }
  console.log(
    "buckets:",
    (buckets || []).map((b) => b.name).join(", ") || "(none)"
  );

  const bucket = buckets?.find((b) => b.name === "figure-videos");
  if (!bucket) {
    console.error("FAIL: bucket figure-videos introuvable");
    process.exit(1);
  }
  console.log("OK bucket figure-videos public=", bucket.public);

  const probePath = "_healthcheck/probe.txt";
  const { data: signed, error: sErr } = await supabase.storage
    .from("figure-videos")
    .createSignedUploadUrl(probePath);
  if (sErr || !signed?.signedUrl) {
    console.error("FAIL createSignedUploadUrl:", sErr?.message || "no url");
    process.exit(1);
  }
  console.log("OK createSignedUploadUrl");

  const put = await fetch(signed.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: "kitequest-ok",
  });
  if (!put.ok) {
    console.error("FAIL upload PUT", put.status, await put.text());
    process.exit(1);
  }
  console.log("OK upload PUT", put.status);

  const pub =
    url.replace(/\/$/, "") +
    "/storage/v1/object/public/figure-videos/" +
    probePath;
  const get = await fetch(pub);
  if (!get.ok) {
    console.error(
      "FAIL public read",
      get.status,
      "— bucket public + policy SELECT ?"
    );
    await supabase.storage.from("figure-videos").remove([probePath]);
    process.exit(1);
  }
  console.log("OK public read");

  const { error: dErr } = await supabase.storage
    .from("figure-videos")
    .remove([probePath]);
  if (dErr) console.error("WARN cleanup:", dErr.message);
  else console.log("OK cleanup");

  const prisma = new PrismaClient();
  try {
    const cols: { column_name: string }[] = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Video'
      ORDER BY ordinal_position
    `;
    const names = cols.map((c) => c.column_name);
    console.log("Video columns:", names.join(", "));
    const need = ["storagePath", "mimeType", "sizeBytes", "order", "url"];
    const missing = need.filter((n) => !names.includes(n));
    if (missing.length) {
      console.error("FAIL missing columns:", missing.join(", "));
      process.exit(1);
    }
    console.log("OK schema Video,", await prisma.video.count(), "row(s)");
  } finally {
    await prisma.$disconnect();
  }

  console.log("\nRESULT: tout est bon — Storage + schéma prêts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
