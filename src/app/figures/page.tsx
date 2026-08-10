import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FigureCheckbox from "@/components/FigureCheckbox";
import OfflinePackButton from "@/components/offline-pack-button";
import { isCompleted, isUnlocked, xpForCategory } from "@/lib/gamification";

/** Construit l’URL /figures en gardant catégorie + filtre acquis */
function figuresHref(opts: { category?: string; hideDone?: boolean }) {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.hideDone) params.set("hideDone", "1");
  const q = params.toString();
  return q ? `/figures?${q}` : "/figures";
}

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: { category?: string; hideDone?: string };
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

  const doneIds = new Set(
    figures.filter((f) => isCompleted(f)).map((f) => f.id)
  );

  const categories = Array.from(new Set(figures.map((f) => f.category)));
  const activeCategory = searchParams.category;
  const hideDone = searchParams.hideDone === "1";
  const doneCount = doneIds.size;

  const visibleFigures = hideDone
    ? figures.filter((f) => !doneIds.has(f.id))
    : figures;

  const visibleCategories = categories.filter((cat) => {
    if (activeCategory && cat !== activeCategory) return false;
    return visibleFigures.some((f) => f.category === cat);
  });

  return (
    <div className="figures-page">
      <h1>Toutes les figures</h1>
      <p className="figures-lead">
        {doneCount} / {figures.length} validées — coche pour gagner de l’XP !
      </p>

      <div className="offline-pack-bar">
        <OfflinePackButton label="Télécharger le catalogue (hors-ligne)" />
        <Link href="/offline" className="btn btn-ghost">
          Gérer hors-ligne
        </Link>
      </div>

      <div className="category-filters">
        <Link
          href={figuresHref({ hideDone })}
          className={!activeCategory ? "active" : ""}
        >
          Toutes
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={figuresHref({ category: cat, hideDone })}
            className={activeCategory === cat ? "active" : ""}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="figure-done-filter">
        <Link
          href={figuresHref({ category: activeCategory, hideDone: false })}
          className={!hideDone ? "active" : ""}
        >
          Toutes
        </Link>
        <Link
          href={figuresHref({ category: activeCategory, hideDone: true })}
          className={hideDone ? "active" : ""}
        >
          Masquer les validées
        </Link>
      </div>

      {visibleCategories.length === 0 ? (
        <p className="quest-empty">
          {hideDone
            ? "Plus rien à afficher — tu as tout validé dans ce filtre."
            : "Aucune figure dans cette catégorie."}
        </p>
      ) : (
        visibleCategories.map((cat) => (
          <section key={cat} className="figure-section">
            <h2>{cat}</h2>
            <div className="figure-grid">
              {visibleFigures
                .filter((f) => f.category === cat)
                .map((f) => {
                  const locked = !isUnlocked(f, doneIds);
                  const completed = doneIds.has(f.id);
                  const xp = xpForCategory(f.category);
                  const state = completed ? "done" : locked ? "locked" : "open";
                  return (
                    <div key={f.id} className={`figure-card ${state}`}>
                      <span className={`status-dot ${state}`} aria-hidden />
                      <FigureCheckbox
                        figureId={f.id}
                        initialCompleted={completed}
                        locked={locked && !completed}
                        size="sm"
                        xpReward={xp}
                      />
                      <Link href={`/figures/${f.slug}`} className="figure-card-name">
                        {f.name}
                      </Link>
                      <span className="xp-pill">+{xp} XP</span>
                    </div>
                  );
                })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
