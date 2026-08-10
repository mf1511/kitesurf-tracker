import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FigureCheckbox from "@/components/FigureCheckbox";
import AddFigureToTrip from "@/components/add-figure-to-trip";
import FigureVideosPanel from "@/components/figure-videos-panel";
import { xpForCategory } from "@/lib/gamification";

export default async function FigureDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const figure = await prisma.figure.findUnique({
    where: { slug: params.slug },
    include: {
      prerequisites: {
        include: { progress: { where: { userId } } },
      },
      unlocks: true,
      videos: {
        where: { storagePath: { not: "" } },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      },
      progress: { where: { userId } },
    },
  });

  if (!figure) notFound();
  // Inactive = masquée pour les users (admin peut toujours ouvrir)
  if (!figure.active && session.user.role !== "admin") notFound();

  // Séjours où l’user est membre (+ si la figure y est déjà)
  const myTrips = await prisma.trip.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      name: true,
      figures: {
        where: { figureId: figure.id },
        select: { id: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const steps: string[] = JSON.parse(figure.steps);
  const completed = !!figure.progress?.[0]?.completed;
  const locked = figure.prerequisites.some(
    (p) => !p.progress?.some((prog) => prog.completed)
  );
  const xp = xpForCategory(figure.category);
  const questStatus = completed ? "done" : locked ? "locked" : "open";
  const questLabel = completed
    ? "Quête acquise"
    : locked
    ? "Quête verrouillée"
    : "Quête débloquée";

  return (
    <div className="figure-detail">
      <Link href="/figures" className="back-link">← Toutes les figures</Link>

      <div className="figure-detail-header">
        <span className="badge">{figure.category}</span>
        <h1>{figure.name}</h1>
        <p className="figure-description">{figure.description}</p>

        <div className="status-row">
          <span className={`quest-status ${questStatus}`}>{questLabel}</span>
          <span className="xp-pill">+{xp} XP</span>
        </div>

        <div className="status-row">
          <FigureCheckbox
            figureId={figure.id}
            initialCompleted={completed}
            locked={locked && !completed}
            xpReward={xp}
          />
          <span>
            {locked && !completed
              ? "Prérequis non validés"
              : completed
              ? "Figure acquise — bien joué !"
              : "Marquer comme acquise"}
          </span>
        </div>
        <div className="status-row add-to-trip-row">
          <AddFigureToTrip
            figureId={figure.id}
            trips={myTrips.map((t) => ({
              id: t.id,
              name: t.name,
              already: t.figures.length > 0,
            }))}
          />
        </div>
      </div>

      {figure.prerequisites.length > 0 && (
        <section className="figure-block">
          <h2>À maîtriser avant</h2>
          <div className="prereq-list">
            {figure.prerequisites.map((p) => {
              const pDone = !!p.progress?.[0]?.completed;
              return (
                <Link
                  key={p.id}
                  href={`/figures/${p.slug}`}
                  className={`prereq-chip ${pDone ? "done" : ""}`}
                >
                  {pDone ? "✓" : "○"} {p.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="figure-block">
        <h2>Étapes</h2>
        <ol className="steps-list">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {figure.unlocks.length > 0 && (
        <section className="figure-block">
          <h2>Cette figure débloque ensuite</h2>
          <div className="prereq-list">
            {figure.unlocks.map((u) => (
              <Link key={u.id} href={`/figures/${u.slug}`} className="prereq-chip">
                {u.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="figure-block">
        <h2>Vidéos</h2>
        <FigureVideosPanel
          figureName={figure.name}
          videos={figure.videos.map((v) => ({
            id: v.id,
            url: v.url,
            storagePath: v.storagePath,
            title: v.title,
            mimeType: v.mimeType,
            sizeBytes: v.sizeBytes,
            figureId: figure.id,
            figureSlug: figure.slug,
            figureName: figure.name,
          }))}
        />
      </section>
    </div>
  );
}
