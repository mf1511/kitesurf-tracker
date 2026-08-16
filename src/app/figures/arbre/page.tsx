import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SkillTreeMindmap from "@/components/skill-tree-mindmap";
import { getCategoryOrder } from "@/lib/category-order";
import {
  categoryHasSections,
  resolveFigureSection,
  sortFigureSections,
} from "@/lib/figure-sections";
import { isTwintipAvanceImportFigure } from "@/lib/twintip-avance";
import {
  isCompleted,
  isUnlocked,
  sortCategories,
  xpForCategory,
} from "@/lib/gamification";
import type {
  MindmapCategoryInput,
  MindmapFigureInput,
  MindmapSectionInput,
} from "@/lib/mindmap-layout";

export const metadata = { title: "Arbre de progression — KiteQuest" };

export default async function SkillTreePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

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

    let sections: MindmapSectionInput[] | undefined;
    if (categoryHasSections(cat)) {
      const bySec = new Map<string, MindmapFigureInput[]>();
      list.forEach((f, idx) => {
        const sec =
          resolveFigureSection(
            cat,
            f.description,
            f.order,
            f.slug,
            f.name
          ) ?? "Autres";
        const arr = bySec.get(sec) ?? [];
        arr.push(mapped[idx]);
        bySec.set(sec, arr);
      });
      sections = sortFigureSections(cat, [...bySec.keys()]).map((name) => ({
        name,
        figures: bySec.get(name) ?? [],
      }));
    }

    return { name: cat, figures: mapped, sections };
  });

  const doneTotal = figures.filter((f) => doneIds.has(f.id)).length;
  const returnTo = "/figures/arbre";

  return (
    <div className="figures-page skill-tree-page">
      <Link href="/figures" className="back-link">
        ← Toutes les figures
      </Link>
      <h1>Arbre de progression</h1>
      <p className="figures-lead">
        {doneTotal}/{figures.length} figures validées.
      </p>

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
