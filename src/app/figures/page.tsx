import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FiguresCatalog } from "@/components/figures-catalog";
import { resolveDebuterSection } from "@/lib/debuter";
import { isCompleted, isUnlocked, sortCategories, xpForCategory } from "@/lib/gamification";

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Inclus les inactives : visibles mais non cliquables côté user
  const figures = await prisma.figure.findMany({
    include: {
      prerequisites: { select: { id: true } },
      progress: { where: { userId } },
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const doneIds = new Set(figures.filter((f) => isCompleted(f)).map((f) => f.id));
  const categories = sortCategories(Array.from(new Set(figures.map((f) => f.category))));
  const doneCount = doneIds.size;

  // Sérialisation pour le catalogue client (recherche/tri instantanés)
  const catalogFigures = figures.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    category: f.category,
    section:
      f.category === "Débuter"
        ? resolveDebuterSection(f.description, f.order)
        : null,
    order: f.order,
    completed: doneIds.has(f.id),
    locked: !isUnlocked(f, doneIds),
    active: f.active,
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
      </div>

      <FiguresCatalog
        figures={catalogFigures}
        categories={categories}
        initialCategory={searchParams.category}
      />
    </div>
  );
}
