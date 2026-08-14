import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SkillTreeCanvas from "@/components/skill-tree-canvas";
import SkillTreeMindmap from "@/components/skill-tree-mindmap";
import { getCategoryOrder } from "@/lib/category-order";
import { resolveDebuterSection, sortDebuterSections } from "@/lib/debuter";
import {
  isTwintipAvanceImportFigure,
  resolveTwintipAvanceSection,
  sortTwintipAvanceSections,
  TWINTIP_AVANCE_CATEGORY,
} from "@/lib/twintip-avance";
import {
  isCompleted,
  isUnlocked,
  sortCategories,
  xpForCategory,
} from "@/lib/gamification";
import {
  layoutDebuterChains,
  layoutSkillTree,
  type SkillTreeInput,
} from "@/lib/skill-tree-layout";
import type {
  MindmapCategoryInput,
  MindmapFigureInput,
  MindmapSectionInput,
} from "@/lib/mindmap-layout";

export const metadata = { title: "Arbre de progression — KiteQuest" };

export default async function SkillTreePage({
  searchParams,
}: {
  searchParams: { category?: string; mode?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  const mindmapMode = searchParams.mode === "mindmap";

  const [figures, categoryOrder] = await Promise.all([
    prisma.figure.findMany({
      include: {
        prerequisites: { select: { id: true } },
        progress: { where: { userId } },
      },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    }),
    getCategoryOrder(),
  ]);

  const doneIds = new Set(
    figures.filter((f) => isCompleted(f)).map((f) => f.id)
  );
  const categories = sortCategories(
    Array.from(new Set(figures.map((f) => f.category))),
    categoryOrder
  );

  // ——— Mindmap : toutes les catégories ———
  if (mindmapMode) {
    const mindmapCategories: MindmapCategoryInput[] = categories.map((cat) => {
      const list = figures.filter((f) => f.category === cat);
      const mapped: MindmapFigureInput[] = list.map((f) => ({
        id: f.id,
        slug: f.slug,
        name: f.name,
        state: !f.active
          ? ("locked" as const)
          : doneIds.has(f.id)
          ? ("done" as const)
          : isUnlocked(f, doneIds)
          ? ("open" as const)
          : ("locked" as const),
        active: f.active,
        soonHighlight: isTwintipAvanceImportFigure(f),
        xp: xpForCategory(f.category),
        order: f.order,
        prereqIds: f.prerequisites.map((p) => p.id),
      }));

      const resolveSection =
        cat === "Débuter"
          ? (f: (typeof list)[number]) =>
              resolveDebuterSection(f.description, f.order)
          : cat === TWINTIP_AVANCE_CATEGORY
          ? (f: (typeof list)[number]) =>
              resolveTwintipAvanceSection(f.description, f.order)
          : null;
      const sortSections =
        cat === "Débuter"
          ? sortDebuterSections
          : cat === TWINTIP_AVANCE_CATEGORY
          ? sortTwintipAvanceSections
          : null;

      let sections: MindmapSectionInput[] | undefined;
      if (resolveSection && sortSections) {
        const bySec = new Map<string, MindmapFigureInput[]>();
        list.forEach((f, idx) => {
          const sec = resolveSection(f) ?? "Autres";
          const arr = bySec.get(sec) ?? [];
          arr.push(mapped[idx]);
          bySec.set(sec, arr);
        });
        sections = sortSections([...bySec.keys()]).map((name) => ({
          name,
          figures: bySec.get(name) ?? [],
        }));
      }

      return { name: cat, figures: mapped, sections };
    });

    const doneTotal = figures.filter((f) => doneIds.has(f.id)).length;
    const returnTo = "/figures/arbre?mode=mindmap";

    return (
      <div className="figures-page skill-tree-page">
        <Link href="/figures" className="back-link">
          ← Toutes les figures
        </Link>
        <h1>Arbre de progression</h1>
        <p className="figures-lead">
          Vue mindmap — {doneTotal}/{figures.length} figures validées.
        </p>

        <div className="arbre-mode-toggle" role="group" aria-label="Mode d’affichage">
          <Link href="/figures/arbre" className="btn btn-ghost">
            Arbre
          </Link>
          <Link
            href="/figures/arbre?mode=mindmap"
            className="btn btn-ghost is-active"
          >
            Mindmap
          </Link>
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
        </div>

        <SkillTreeMindmap categories={mindmapCategories} returnTo={returnTo} />
      </div>
    );
  }

  // ——— Arbre classique (1 catégorie) ———
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

      <div className="arbre-mode-toggle" role="group" aria-label="Mode d’affichage">
        <Link href={`/figures/arbre?category=${encodeURIComponent(category)}`} className="btn btn-ghost is-active">
          Arbre
        </Link>
        <Link href="/figures/arbre?mode=mindmap" className="btn btn-ghost">
          Mindmap
        </Link>
      </div>

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
