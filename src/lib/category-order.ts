import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORY_ORDER } from "@/lib/gamification";

export const CATEGORY_ORDER_KEY = "category_order";
export const CATEGORY_ORDER_TAG = "category-order";

/** Parse JSON string[] — ignore valeurs non-string */
function parseOrder(raw: string | null | undefined): string[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(
      (x): x is string => typeof x === "string" && x.length > 0
    );
    return list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

/** Lit category_order via SQL (évite un PrismaClient stale sans modèle AppSetting) */
async function readOrderFromDb(): Promise<string[] | null> {
  const rows = await prisma.$queryRawUnsafe<{ value: string }[]>(
    `SELECT "value" FROM "AppSetting" WHERE "key" = $1 LIMIT 1`,
    CATEGORY_ORDER_KEY
  );
  return parseOrder(rows[0]?.value ?? null);
}

/** Ordre catégories (DB) — fallback DEFAULT_CATEGORY_ORDER si table absente */
export const getCategoryOrder = unstable_cache(
  async (): Promise<string[]> => {
    try {
      return (await readOrderFromDb()) ?? [...DEFAULT_CATEGORY_ORDER];
    } catch {
      // Table pas encore migrée
      return [...DEFAULT_CATEGORY_ORDER];
    }
  },
  ["category-order-v1"],
  { revalidate: 120, tags: [CATEGORY_ORDER_TAG] }
);

/** Écrit l’ordre et invalide le cache */
export async function setCategoryOrder(order: string[]): Promise<void> {
  const value = JSON.stringify(order);
  // Upsert SQL — compatible même si le singleton Prisma n’a pas encore AppSetting
  await prisma.$executeRawUnsafe(
    `INSERT INTO "AppSetting" ("key", "value") VALUES ($1, $2)
     ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value"`,
    CATEGORY_ORDER_KEY,
    value
  );
  const { revalidateTag } = await import("next/cache");
  revalidateTag(CATEGORY_ORDER_TAG);
}
