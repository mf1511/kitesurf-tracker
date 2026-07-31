import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FigureCheckbox from "@/components/FigureCheckbox";
import { isCompleted, isUnlocked, xpForCategory } from "@/lib/gamification";

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const figures = await prisma.figure.findMany({
    include: {
      prerequisites: { select: { id: true } },
      progress: userId ? { where: { userId } } : false,
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const doneIds = new Set(
    figures.filter((f) => isCompleted(f)).map((f) => f.id)
  );

  const categories = Array.from(new Set(figures.map((f) => f.category)));
  const activeCategory = searchParams.category;
  const doneCount = doneIds.size;

  return (
    <div className="figures-page">
      <h1>Toutes les figures</h1>
      <p className="figures-lead">
        {userId
          ? `${doneCount} / ${figures.length} validées — coche pour gagner de l’XP !`
          : `${figures.length} figures à conquérir — connecte-toi pour suivre ta progression.`}
      </p>

      <div className="category-filters">
        <Link href="/figures" className={!activeCategory ? "active" : ""}>
          Toutes
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/figures?category=${encodeURIComponent(cat)}`}
            className={activeCategory === cat ? "active" : ""}
          >
            {cat}
          </Link>
        ))}
      </div>

      {categories
        .filter((cat) => !activeCategory || cat === activeCategory)
        .map((cat) => (
          <section key={cat} className="figure-section">
            <h2>{cat}</h2>
            <div className="figure-grid">
              {figures
                .filter((f) => f.category === cat)
                .map((f) => {
                  const locked = !isUnlocked(f, doneIds);
                  const completed = doneIds.has(f.id);
                  const xp = xpForCategory(f.category);
                  const state = completed ? "done" : locked ? "locked" : "open";
                  return (
                    <div key={f.id} className={`figure-card ${state}`}>
                      <span className={`status-dot ${state}`} aria-hidden />
                      {userId ? (
                        <FigureCheckbox
                          figureId={f.id}
                          initialCompleted={completed}
                          locked={locked && !completed}
                          size="sm"
                          xpReward={xp}
                        />
                      ) : (
                        <div className="checkbox sm" />
                      )}
                      <Link href={`/figures/${f.slug}`} className="figure-card-name">
                        {f.name}
                      </Link>
                      <span className="xp-pill">+{xp} XP</span>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
    </div>
  );
}
