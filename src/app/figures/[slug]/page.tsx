import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FigureCheckbox from "@/components/FigureCheckbox";
import VideoForm from "@/components/VideoForm";
import { getEmbedUrl } from "@/lib/videoEmbed";
import { xpForCategory } from "@/lib/gamification";

export default async function FigureDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const figure = await prisma.figure.findUnique({
    where: { slug: params.slug },
    include: {
      prerequisites: {
        include: { progress: userId ? { where: { userId } } : false },
      },
      unlocks: true,
      videos: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      progress: userId ? { where: { userId } } : false,
    },
  });

  if (!figure) notFound();

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

        {userId ? (
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
        ) : (
          <p className="login-hint">
            <Link href="/login">Connecte-toi</Link> pour suivre ta progression et gagner de l’XP.
          </p>
        )}
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
        {figure.videos.length === 0 && (
          <p className="empty-hint">Aucune vidéo pour l&apos;instant.</p>
        )}
        <div className="video-list">
          {figure.videos.map((v) => {
            const embed = getEmbedUrl(v.url);
            return (
              <div key={v.id} className="video-item">
                {embed ? (
                  <div className="video-embed">
                    <iframe
                      src={embed}
                      title={v.title || figure.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a href={v.url} target="_blank" rel="noreferrer" className="video-link">
                    {v.title || v.url}
                  </a>
                )}
                {v.title && embed && <p className="video-title">{v.title}</p>}
                <p className="video-meta">Ajoutée par {v.user.name || v.user.email}</p>
              </div>
            );
          })}
        </div>

        {userId && (
          <div className="video-add">
            <h3>Ajouter une vidéo</h3>
            <VideoForm slug={figure.slug} />
          </div>
        )}
      </section>
    </div>
  );
}
