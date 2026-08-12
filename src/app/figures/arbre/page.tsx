import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SkillTreeCanvas from "@/components/skill-tree-canvas";
import { resolveDebuterSection, sortDebuterSections } from "@/lib/debuter";
import {
  isTwintipAvanceImportFigure,
  resolveTwintipAvanceSection,
  sortTwintipAvanceSections,
  TWINTIP_AVANCE_CATEGORY,
} from "@/lib/twintip-avance";
import { isCompleted, isUnlocked, sortCategories, xpForCategory } from "@/lib/gamification";
import {
  layoutDebuterChains,
  layoutSkillTree,
  type SkillTreeInput,
} from "@/lib/skill-tree-layout";

export const metadata = { title: "Arbre de progression — KiteQuest" };

export default async function SkillTreePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Inclus les inactives : visibles dans l’arbre, non cliquables
  const figures = await prisma.figure.findMany({
    include: {
      prerequisites: { select: { id: true } },
      progress: { where: { userId } },
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const doneIds = new Set(figures.filter((f) => isCompleted(f)).map((f) => f.id));
  const categories = sortCategories(Array.from(new Set(figures.map((f) => f.category))));
  const category =
    searchParams.category && categories.includes(searchParams.category)
      ? searchParams.category
      : categories[0];

  const catFigures = figures.filter((f) => f.category === category);
  const catIds = new Set(catFigures.map((f) => f.id));

  const inputs: SkillTreeInput[] = catFigures.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    state: !f.active
      ? "locked"
      : doneIds.has(f.id)
      ? "done"
      : isUnlocked(f, doneIds)
      ? "open"
      : "locked",
    active: f.active,
    soonHighlight: isTwintipAvanceImportFigure(f),
    xp: xpForCategory(f.category),
    // Prérequis internes à la catégorie seulement
    prereqIds: f.prerequisites.filter((p) => catIds.has(p.id)).map((p) => p.id),
    order: f.order,
    section:
      category === "Débuter"
        ? resolveDebuterSection(f.description, f.order)
        : category === TWINTIP_AVANCE_CATEGORY
        ? resolveTwintipAvanceSection(f.description, f.order)
        : null,
  }));

  const sectionOrder =
    category === "Débuter"
      ? sortDebuterSections
      : category === TWINTIP_AVANCE_CATEGORY
      ? sortTwintipAvanceSections
      : null;

  const layout = sectionOrder
    ? layoutDebuterChains(
        inputs,
        sectionOrder(
          Array.from(
            new Set(inputs.map((n) => n.section).filter(Boolean) as string[])
          )
        )
      )
    : layoutSkillTree(inputs);

  const doneInCat = catFigures.filter((f) => doneIds.has(f.id)).length;
  // Retour exact (catégorie) après ouverture d’une fiche
  const returnTo = `/figures/arbre?category=${encodeURIComponent(category)}`;

  return (
    <div className="figures-page skill-tree-page">
      <Link href="/figures" className="back-link">
        ← Toutes les figures
      </Link>
      <h1>Arbre de progression</h1>
      <p className="figures-lead">
        {category === "Débuter" || category === TWINTIP_AVANCE_CATEGORY
          ? "Parcours linéaire par module — "
          : "Chaque figure débloque les suivantes — "}
        {doneInCat}/{catFigures.length} validées dans ce monde.
      </p>

      <div className="category-filters">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/figures/arbre?category=${encodeURIComponent(cat)}`}
            className={category === cat ? "active" : ""}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="tree-legend">
        <span>
          <span className="tree-legend-dot done" aria-hidden /> validée
        </span>
        <span>
          <span className="tree-legend-dot open" aria-hidden /> débloquée
        </span>
        <span>
          <span className="tree-legend-dot locked" aria-hidden /> verrouillée
        </span>
        <span className="tree-legend-hint">Glisse pour naviguer</span>
      </div>

      <SkillTreeCanvas layout={layout} returnTo={returnTo} />
    </div>
  );
}
