import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OfflinePackButton from "@/components/offline-pack-button";
import { FiguresCatalog, type CatalogFigure } from "@/components/figures-catalog";
import { isCompleted, isUnlocked, xpForCategory } from "@/lib/gamification";

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const figures = await prisma.figure.findMany({
    where: { active: true },
    include: {
      prerequisites: { select: { id: true } },
      progress: { where: { userId } },
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const doneIds = new Set(figures.filter((f) => isCompleted(f)).map((f) => f.id));
  const categories = Array.from(new Set(figures.map((f) => f.category)));
  const doneCount = doneIds.size;

  // Sérialisation pour le catalogue client (recherche/tri instantanés)
  const catalogFigures: CatalogFigure[] = figures.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    category: f.category,
    completed: doneIds.has(f.id),
    locked: !isUnlocked(f, doneIds),
    xp: xpForCategory(f.category),
  }));

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
        <OfflinePackButton label="Télécharger le catalogue (hors-ligne)" />
        <Link href="/offline" className="btn btn-ghost">
          Gérer hors-ligne
        </Link>
      </div>

      <FiguresCatalog
        figures={catalogFigures}
        categories={categories}
        initialCategory={searchParams.category}
      />
    </div>
  );
}
