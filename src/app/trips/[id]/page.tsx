import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTripStats } from "@/lib/trips";
import TripInviteDialog from "@/components/trip-invite-dialog";
import TripOfflineDialog from "@/components/trip-offline-dialog";
import TripFiguresPanel from "@/components/trip-figures-panel";
import TripSeatsPanel from "@/components/trip-seats-panel";
import { createOwnerSeat } from "@/lib/trip-seats";
import { getFriendIds, riderLabel } from "@/lib/community";
import { figureHref } from "@/lib/nav-return";
import UserAvatar from "@/components/user-avatar";

export default async function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId } },
  });
  if (!member) {
    return (
      <div className="hero">
        <h1>Séjour privé</h1>
        <p>
          Tu dois être invité pour voir ce trip. Demande le lien au créateur.
        </p>
        <Link href="/trips" className="btn btn-primary">
          ← Mes séjours
        </Link>
      </div>
    );
  }

  const stats = await computeTripStats(params.id, userId);
  if (!stats) notFound();

  const { trip, status, feed, tripFigures, myObjectives, crewKnownBy, totals } =
    stats;

  const figuresRaw = await prisma.figure.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      category: true,
      _count: { select: { videos: true } },
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
  // videoCount : checklist créateur désactive les figures sans vidéo
  const figures = figuresRaw.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    videoCount: f._count.videos,
  }));

  // Places invitation — assure la place créateur si trip antérieur au SQL 012
  const seatInclude = {
    claimedBy: {
      select: { id: true, name: true, email: true, image: true },
    },
  } as const;
  let seats = await prisma.tripSeat.findMany({
    where: { tripId: trip.id },
    include: seatInclude,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  if (member.role === "owner" && !seats.some((s) => s.claimedById === userId)) {
    await createOwnerSeat(trip.id, userId);
    seats = await prisma.tripSeat.findMany({
      where: { tripId: trip.id },
      include: seatInclude,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  // Avatars crew en tête : place (photo) ou profil si claimée
  const seatedUserIds = new Set(
    seats.map((s) => s.claimedById).filter(Boolean) as string[],
  );
  const crewAvatars = [
    ...seats.map((s) => ({
      key: s.id,
      label: s.displayName,
      image: s.image || s.claimedBy?.image || null,
      claimed: !!s.claimedById,
      isMe: s.claimedById === userId,
    })),
    // Membres sans place (trips antérieurs)
    ...trip.members
      .filter((m) => !seatedUserIds.has(m.userId))
      .map((m) => ({
        key: m.userId,
        label: riderLabel(m.user),
        image: m.user.image,
        claimed: true,
        isMe: m.userId === userId,
      })),
  ];

  const statusLabel = {
    live: "En cours",
    upcoming: "À venir",
    past: "Terminé",
  };

  // Tous les amis (flag déjà membre) — pour « Inviter le crew »
  const friendIds = await getFriendIds(userId);
  const memberRows = await prisma.tripMember.findMany({
    where: { tripId: trip.id },
    select: { userId: true },
  });
  const memberSet = new Set(memberRows.map((m) => m.userId));
  const inviteFriends =
    friendIds.length === 0
      ? []
      : (
          await prisma.user.findMany({
            where: { id: { in: friendIds } },
            select: { id: true, name: true, email: true, image: true },
            orderBy: { name: "asc" },
          })
        ).map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image,
          label: riderLabel(u),
          onTrip: memberSet.has(u.id),
        }));

  return (
    <div className="trip-detail">
      <Link href="/trips" className="back-link">
        ← Séjours
      </Link>

      <header className="trip-detail-header">
        <div className="trip-detail-title-row">
          <div>
            <span className={`trip-status-pill ${status}`}>
              {statusLabel[status]}
            </span>
            <h1>{trip.name}</h1>
          </div>
          <div className="trip-detail-actions">
            <TripOfflineDialog tripId={trip.id} />
            <TripInviteDialog
              tripId={trip.id}
              code={trip.inviteCode}
              friends={inviteFriends}
            />
          </div>
        </div>
        <p className="subtitle">
          {trip.location || "Spot libre"} ·{" "}
          {trip.startDate.toLocaleDateString("fr-FR")} →{" "}
          {trip.endDate.toLocaleDateString("fr-FR")}
        </p>
        {crewAvatars.length > 0 && (
          <ul className="trip-crew-avatars" aria-label="Crew du séjour">
            {crewAvatars.map((c) => (
              <li
                key={c.key}
                className={c.claimed ? (c.isMe ? "me" : undefined) : "pending"}
                title={c.claimed ? c.label : `${c.label} (en attente)`}
              >
                <UserAvatar
                  name={c.label}
                  image={c.image}
                  className="trip-crew-avatar"
                />
                <span className="trip-crew-name">
                  {c.label.split(/\s+/)[0] || c.label}
                </span>
              </li>
            ))}
          </ul>
        )}
        {trip.description && (
          <p className="figure-description">{trip.description}</p>
        )}
      </header>

      <div className="trip-stat-strip">
        <div>
          <strong>{totals.totalTricks}</strong>
          <span>figures validées</span>
        </div>
        <div>
          <strong>{totals.figures}</strong>
          <span>sur la liste</span>
        </div>
        <div>
          <strong>{totals.members}</strong>
          <span>riders</span>
        </div>
      </div>

      {member.role === "owner" && (
        <TripSeatsPanel
          tripId={trip.id}
          meId={userId}
          initialSeats={seats.map((s) => ({
            id: s.id,
            displayName: s.displayName,
            image: s.image,
            claimedById: s.claimedById,
            order: s.order,
          }))}
          orphanMembers={trip.members
            .filter(
              (m) =>
                m.userId !== userId &&
                m.role !== "owner" &&
                !seatedUserIds.has(m.userId),
            )
            .map((m) => ({
              userId: m.userId,
              label: riderLabel(m.user),
              image: m.user.image,
            }))}
        />
      )}

      <TripFiguresPanel
        tripId={trip.id}
        allFigures={figures}
        tripFigures={tripFigures}
        myObjectives={myObjectives}
        crewKnownBy={crewKnownBy}
        meId={userId}
        isOwner={member.role === "owner"}
      />

      <section className="community-card">
        <h2>Activité du trip</h2>
        <p className="community-lead">
          Les figures validées pendant le séjour.
        </p>
        {feed.length === 0 ? (
          <p className="quest-empty">
            Le fil se remplit dès qu&apos;une figure est cochée.
          </p>
        ) : (
          <ul className="activity-feed">
            {feed.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.label}</strong> a validé{" "}
                  <Link href={figureHref(item.figureSlug, `/trips/${trip.id}`)}>
                    {item.figureName}
                  </Link>
                  <span className="feed-meta">
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
  );
}
