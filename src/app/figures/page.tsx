import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FiguresCatalog } from "@/components/figures-catalog";
import { resolveFigureSection } from "@/lib/figure-sections";
import { getCachedFiguresCatalog } from "@/lib/figures-catalog-cache";
import { getCategoryOrder } from "@/lib/category-order";
import { isUnlocked, sortCategories, xpForCategory } from "@/lib/gamification";

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: { category?: string; favorites?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Catalogue partagé en cache + état perso (progress / favoris) en parallèle
  const [figures, progressRows, favoriteRows, categoryOrder] =
    await Promise.all([
      getCachedFiguresCatalog(),
      prisma.userProgress.findMany({
        where: { userId, completed: true },
        select: { figureId: true },
      }),
      prisma.figureFavorite.findMany({
        where: { userId },
        select: { figureId: true },
      }),
      getCategoryOrder(),
    ]);

  const doneIds = new Set(progressRows.map((p) => p.figureId));
  const favoriteIds = new Set(favoriteRows.map((r) => r.figureId));
  const categories = sortCategories(
    Array.from(new Set(figures.map((f) => f.category))),
    categoryOrder
  );
  const doneCount = figures.filter((f) => doneIds.has(f.id)).length;

  const catalogFigures = figures.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    category: f.category,
    description: f.description,
    section: resolveFigureSection(
      f.category,
      f.description,
      f.order,
      f.slug,
      f.name
    ),
    order: f.order,
    completed: doneIds.has(f.id),
    locked: !isUnlocked(f, doneIds),
    active: f.active,
    xp: xpForCategory(f.category),
    videoCount: f._count.videos,
    favorite: favoriteIds.has(f.id),
  }));

  const favoritesOnly =
    searchParams.favorites === "1" || searchParams.favorites === "true";

  return (
    <div className="figures-page">
      <h1>Toutes les figures</h1>
      <p className="figures-lead">
        {doneCount} / {figures.length} validées — coche pour gagner de l’XP !
      </p>

      <div className="offline-pack-bar">
        <Link href="/figures/arbre" className="btn btn-ghost">
          🌳 Arbre de progression
        </Link>
        <Link href="/figures/arbre?mode=mindmap" className="btn btn-ghost">
          Mindmap
        </Link>
      </div>

      <FiguresCatalog
        figures={catalogFigures}
        categories={categories}
        initialCategory={searchParams.category}
        initialFavoritesOnly={favoritesOnly}
      />
    </div>
  );
}
