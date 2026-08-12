import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FigureCheckbox from "@/components/FigureCheckbox";
import FigureFavoriteButton from "@/components/figure-favorite-button";
import { isCompleted, xpForCategory } from "@/lib/gamification";
import { figureHref } from "@/lib/nav-return";

export default async function FavorisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const favorites = await prisma.figureFavorite.findMany({
    where: {
      userId,
      figure: { active: true },
    },
    include: {
      figure: {
        include: {
          progress: { where: { userId } },
          _count: { select: { videos: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="figures-page favoris-page">
      <h1>Mes favoris</h1>
      <p className="figures-lead">
        {favorites.length === 0
          ? "Aucune figure en favori pour l’instant."
          : `${favorites.length} figure${favorites.length > 1 ? "s" : ""} — étoile sur une fiche pour ajouter / retirer.`}
      </p>

      <div className="offline-pack-bar">
        <Link href="/figures" className="btn btn-ghost">
          Toutes les figures
        </Link>
      </div>

      {favorites.length === 0 ? (
        <p className="feed-meta">
          Sur une figure, clique l’étoile pour la retrouver ici.
        </p>
      ) : (
        <div className="figure-grid">
          {favorites.map(({ figure: f }) => {
            const completed = isCompleted(f);
            const xp = xpForCategory(f.category);
            const state = completed ? "done" : "open";
            return (
              <div key={f.id} className={`figure-card ${state}`}>
                <span className={`status-dot ${state}`} aria-hidden />
                <FigureFavoriteButton
                  figureId={f.id}
                  initialFavorite
                  size="sm"
                />
                <FigureCheckbox
                  figureId={f.id}
                  initialCompleted={completed}
                  size="sm"
                  xpReward={xp}
                />
                <Link
                  href={figureHref(f.slug, "/favoris")}
                  className="figure-card-name"
                >
                  {f.name}
                </Link>
                <span className="figure-video-count">
                  {f._count.videos} vidéo{f._count.videos === 1 ? "" : "s"}
                </span>
                <span className="xp-pill">+{xp} XP</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
