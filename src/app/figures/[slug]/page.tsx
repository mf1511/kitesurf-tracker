import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FigureCheckbox from "@/components/FigureCheckbox";
import FigureFavoriteButton from "@/components/figure-favorite-button";
import AddFigureToTrip from "@/components/add-figure-to-trip";
import FigureVideosPanel from "@/components/figure-videos-panel";
import { FigureNotePanel } from "@/components/figure-note-panel";
import BackLink from "@/components/back-link";
import { resolveDebuterSection } from "@/lib/debuter";
import {
  isTwintipAvanceImportFigure,
  resolveTwintipAvanceSection,
  TWINTIP_AVANCE_CATEGORY,
} from "@/lib/twintip-avance";
import { xpForCategory } from "@/lib/gamification";
import { figureHref } from "@/lib/nav-return";

export default async function FigureDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { from?: string };
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
  // Inactive : visible en catalogue/arbre, fiche réservée admin
  if (!figure.active && session.user.role !== "admin") notFound();

  // Formations : layout vidéo-first, sans étapes / séjour
  const isLesson =
    figure.category === "Débuter" ||
    figure.category === TWINTIP_AVANCE_CATEGORY;
  const lessonSection = isLesson
    ? figure.category === TWINTIP_AVANCE_CATEGORY
      ? resolveTwintipAvanceSection(figure.description, figure.order)
      : resolveDebuterSection(figure.description, figure.order)
    : null;

  const [myNote, myFavorite] = await Promise.all([
    prisma.figureNote.findUnique({
      where: { userId_figureId: { userId, figureId: figure.id } },
    }),
    prisma.figureFavorite.findUnique({
      where: { userId_figureId: { userId, figureId: figure.id } },
      select: { id: true },
    }),
  ]);

  const myTrips = isLesson
    ? []
    : await prisma.trip.findMany({
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

  const steps: string[] = isLesson ? [] : JSON.parse(figure.steps);
  const completed = !!figure.progress?.[0]?.completed;
  const locked = figure.prerequisites.some(
    (p) => !p.progress?.some((prog) => prog.completed)
  );
  const xp = xpForCategory(figure.category);
  const questStatus = completed ? "done" : locked ? "locked" : "open";
  const questLabel = completed
    ? isLesson
      ? "Leçon vue"
      : "Quête acquise"
    : locked
    ? "Quête verrouillée"
    : isLesson
    ? "À regarder"
    : "Quête débloquée";

  const videoProps = {
    figureName: figure.name,
    videos: figure.videos.map((v) => ({
      id: v.id,
      url: v.url,
      storagePath: v.storagePath,
      title: v.title,
      mimeType: v.mimeType,
      sizeBytes: v.sizeBytes,
      figureId: figure.id,
      figureSlug: figure.slug,
      figureName: figure.name,
    })),
  };

  const noteBlock = (
    <section className="figure-block">
      <h2>Mon carnet</h2>
      <FigureNotePanel
        figureId={figure.id}
        initialContent={myNote?.content ?? ""}
        initialUpdatedAt={myNote?.updatedAt.toISOString() ?? null}
      />
    </section>
  );

  const from = searchParams.from;

  return (
    <div className={`figure-detail${isLesson ? " figure-detail-lesson" : ""}`}>
      <BackLink
        from={from}
        fallbackHref="/figures"
        fallbackLabel="← Toutes les figures"
      />

      <div className="figure-detail-header">
        <div className="figure-badges">
          <span className="badge">{figure.category}</span>
          {lessonSection && <span className="badge badge-soft">{lessonSection}</span>}
        </div>
        <h1>{figure.name}</h1>
        {!isLesson && <p className="figure-description">{figure.description}</p>}

        <div className="status-row">
          <span className={`quest-status ${questStatus}`}>{questLabel}</span>
          <span className="xp-pill">+{xp} XP</span>
        </div>

        <div className="status-row">
          <FigureCheckbox
            figureId={figure.id}
            initialCompleted={completed}
            xpReward={xp}
          />
          <span>
            {completed
              ? isLesson
                ? "Leçon terminée — bien joué !"
                : "Figure acquise — bien joué !"
              : isLesson
              ? "Marquer comme vue"
              : "Marquer comme acquise"}
          </span>
        </div>

        <div className="status-row">
          <FigureFavoriteButton
            figureId={figure.id}
            initialFavorite={!!myFavorite}
            showLabel
          />
        </div>
        {locked && !completed && (
          <p className="feed-meta">
            Prérequis non validés — tu peux quand même cocher si tu la maîtrises
            déjà.
          </p>
        )}

        {!isLesson && (
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
        )}
      </div>

      {/* Débuter : vidéo d’abord, notes juste en dessous */}
      {isLesson && (
        <>
          <section className="figure-block">
            <FigureVideosPanel {...videoProps} />
          </section>
          {noteBlock}
        </>
      )}

      {!isLesson && figure.prerequisites.length > 0 && (
        <section className="figure-block">
          <h2>À maîtriser avant</h2>
          <div className="prereq-list">
            {figure.prerequisites.map((p) => {
              const pDone = !!p.progress?.[0]?.completed;
              const className = `prereq-chip ${pDone ? "done" : ""}${
                !p.active ? " inactive" : ""
              }`;
              const label = (
                <>
                  {pDone ? "✓" : "○"} {p.name}
                </>
              );
              if (!p.active) {
                return (
                  <span
                    key={p.id}
                    className={`${className}${
                      isTwintipAvanceImportFigure(p) ? " avance-new" : ""
                    }`}
                  >
                    {label} · Bientôt disponible
                  </span>
                );
              }
              return (
                <Link
                  key={p.id}
                  href={figureHref(p.slug, from)}
                  className={className}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {!isLesson && (
        <section className="figure-block">
          <h2>Étapes</h2>
          <ol className="steps-list">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {!isLesson && figure.unlocks.length > 0 && (
        <section className="figure-block">
          <h2>Cette figure débloque ensuite</h2>
          <div className="prereq-list">
            {figure.unlocks.map((u) =>
              u.active ? (
                <Link
                  key={u.id}
                  href={figureHref(u.slug, from)}
                  className="prereq-chip"
                >
                  {u.name}
                </Link>
              ) : (
                <span
                  key={u.id}
                  className={`prereq-chip inactive${
                    isTwintipAvanceImportFigure(u) ? " avance-new" : ""
                  }`}
                >
                  {u.name} · Bientôt disponible
                </span>
              )
            )}
          </div>
        </section>
      )}

      {!isLesson && (
        <>
          {noteBlock}
          <section className="figure-block">
            <FigureVideosPanel {...videoProps} />
          </section>
        </>
      )}
    </div>
  );
}
