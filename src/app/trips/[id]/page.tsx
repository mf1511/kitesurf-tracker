import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTripStats } from "@/lib/trips";
import TripInviteCopy from "@/components/trip-invite-copy";
import TripFiguresPanel from "@/components/trip-figures-panel";
import OfflinePackButton from "@/components/offline-pack-button";

export default async function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId: session.user.id } },
  });
  if (!member) {
    return (
      <div className="hero">
        <h1>Séjour privé</h1>
        <p>Tu dois être invité pour voir ce trip. Demande le lien au créateur.</p>
        <Link href="/trips" className="btn btn-primary">← Mes séjours</Link>
      </div>
    );
  }

  const stats = await computeTripStats(params.id, session.user.id);
  if (!stats) notFound();

  const {
    trip,
    status,
    leaderboard,
    feed,
    tripFigures,
    myObjectives,
    crewKnownBy,
    totals,
  } = stats;

  const figures = await prisma.figure.findMany({
    where: { active: true },
    select: { id: true, name: true, category: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const statusLabel = { live: "En cours", upcoming: "À venir", past: "Terminé" };

  return (
    <div className="trip-detail">
      <Link href="/trips" className="back-link">← Séjours</Link>

      <header className="trip-detail-header">
        <span className={`trip-status-pill ${status}`}>{statusLabel[status]}</span>
        <h1>{trip.name}</h1>
        <p className="subtitle">
          {trip.location || "Spot libre"} ·{" "}
          {trip.startDate.toLocaleDateString("fr-FR")} →{" "}
          {trip.endDate.toLocaleDateString("fr-FR")}
        </p>
        {trip.description && <p className="figure-description">{trip.description}</p>}
      </header>

      <div className="trip-stat-strip">
        <div><strong>{totals.totalXp}</strong><span>XP crew</span></div>
        <div><strong>{totals.totalTricks}</strong><span>tricks</span></div>
        <div><strong>{totals.figures}</strong><span>figures liste</span></div>
        <div><strong>{totals.members}</strong><span>riders</span></div>
      </div>

      <section className="community-card">
        <h2>Inviter le crew</h2>
        <p className="community-lead">
          Partage ce lien WhatsApp — ils rejoignent le séjour automatiquement.
        </p>
        <TripInviteCopy code={trip.inviteCode} />
      </section>

      <section className="community-card">
        <h2>Hors-ligne</h2>
        <p className="community-lead">
          Télécharge les tutos des figures de ce séjour pour le spot sans 4G.
        </p>
        <OfflinePackButton
          tripId={trip.id}
          label="Télécharger les vidéos du séjour"
        />
      </section>

      <TripFiguresPanel
        tripId={trip.id}
        allFigures={figures}
        tripFigures={tripFigures}
        myObjectives={myObjectives}
        crewKnownBy={crewKnownBy}
        meId={session.user.id}
        isOwner={member.role === "owner"}
      />

      <div className="community-grid">
        <section className="community-card">
          <h2>Leaderboard séjour</h2>
          <p className="community-lead">
            XP des figures validées pendant les dates du séjour.
          </p>
          {leaderboard.every((r) => r.total === 0) ? (
            <p className="quest-empty">
              Personne n&apos;a encore validé de figure pendant ce séjour — cochez sur
              l&apos;eau (ou après la session) !
            </p>
          ) : (
            <ol className="leaderboard">
              {leaderboard.map((row, i) => (
                <li key={row.userId} className={row.isMe ? "me" : ""}>
                  <span className="rank">#{i + 1}</span>
                  <div className="lb-info">
                    <strong>
                      {row.label}
                      {row.isMe ? " (toi)" : ""}
                    </strong>
                    <span>
                      {row.total} XP · {row.tricks} tricks
                      {row.objectivesTotal > 0
                        ? ` · objectifs ${row.objectivesDone}/${row.objectivesTotal}`
                        : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="community-card">
          <h2>Activité du trip</h2>
          {feed.length === 0 ? (
            <p className="quest-empty">Le feed se remplit dès qu&apos;une figure est cochée.</p>
          ) : (
            <ul className="activity-feed">
              {feed.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.label}</strong> a validé{" "}
                    <Link href={`/figures/${item.figureSlug}`}>{item.figureName}</Link>
                    <span className="feed-meta">
                      +{item.xp} XP ·{" "}
                      {item.at.toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
