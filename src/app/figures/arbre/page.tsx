import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCompleted, isUnlocked, xpForCategory } from "@/lib/gamification";

export const metadata = { title: "Arbre de progression — KiteQuest" };

type TreeNode = {
  id: string;
  slug: string;
  name: string;
  state: "done" | "open" | "locked";
  xp: number;
};

export default async function SkillTreePage({
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
  const category =
    searchParams.category && categories.includes(searchParams.category)
      ? searchParams.category
      : categories[0];

  const catFigures = figures.filter((f) => f.category === category);
  const catIds = new Set(catFigures.map((f) => f.id));

  const nodeOf = (f: (typeof catFigures)[number]): TreeNode => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    state: doneIds.has(f.id) ? "done" : isUnlocked(f, doneIds) ? "open" : "locked",
    xp: xpForCategory(f.category),
  });

  // Enfants = figures de la catégorie dont un prérequis est le parent
  const childrenOf = (parentId: string) =>
    catFigures.filter((f) => f.prerequisites.some((p) => p.id === parentId));

  // Racines = aucun prérequis dans la catégorie (prérequis externes tolérés)
  const roots = catFigures.filter(
    (f) => !f.prerequisites.some((p) => catIds.has(p.id))
  );

  // Rendu récursif (DAG : une figure à plusieurs parents apparaît sous chacun)
  const renderNode = (
    f: (typeof catFigures)[number],
    path: Set<string>,
    depth: number
  ): JSX.Element | null => {
    if (path.has(f.id) || depth > 10) return null; // garde anti-cycle
    const node = nodeOf(f);
    const children = childrenOf(f.id);
    const nextPath = new Set(path).add(f.id);

    return (
      <li key={f.id}>
        <Link href={`/figures/${f.slug}`} className={`tree-node ${node.state}`}>
          <span className="tree-node-status" aria-hidden>
            {node.state === "done" ? "✓" : node.state === "locked" ? "🔒" : "○"}
          </span>
          <span className="tree-node-name">{node.name}</span>
          <span className="tree-node-xp">+{node.xp}</span>
        </Link>
        {children.length > 0 && (
          <ul>{children.map((c) => renderNode(c, nextPath, depth + 1))}</ul>
        )}
      </li>
    );
  };

  const doneInCat = catFigures.filter((f) => doneIds.has(f.id)).length;

  return (
    <div className="figures-page skill-tree-page">
      <Link href="/figures" className="back-link">
        ← Toutes les figures
      </Link>
      <h1>Arbre de progression</h1>
      <p className="figures-lead">
        Chaque figure débloque les suivantes — {doneInCat}/{catFigures.length}{" "}
        validées dans ce monde.
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
        <span><span className="tree-legend-dot done" aria-hidden /> validée</span>
        <span><span className="tree-legend-dot open" aria-hidden /> débloquée</span>
        <span><span className="tree-legend-dot locked" aria-hidden /> verrouillée</span>
      </div>

      {roots.length === 0 ? (
        <p className="quest-empty">Aucune figure dans cette catégorie.</p>
      ) : (
        <ul className="skill-tree">
          {roots.map((r) => renderNode(r, new Set<string>(), 0))}
        </ul>
      )}
    </div>
  );
}
