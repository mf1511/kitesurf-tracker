import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Catalogue figures partagé (sans progression user) — cache serveur ~2 min */
export const getCachedFiguresCatalog = unstable_cache(
  async () => {
    return prisma.figure.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        description: true,
        order: true,
        active: true,
        prerequisites: { select: { id: true } },
        _count: { select: { videos: true } },
      },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
  },
  ["figures-catalog-v1"],
  { revalidate: 120, tags: ["figures-catalog"] }
);

export async function invalidateFiguresCatalog() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("figures-catalog");
}
