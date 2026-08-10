import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { riderLabel } from "@/lib/community";
import TripJoinPicker from "@/components/trip-join-picker";
import { claimTripSeat, createOwnerSeat } from "@/lib/trip-seats";

export default async function TripJoinPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { seat?: string };
}) {
  const code = params.code.trim().toLowerCase();
  const trip = await prisma.trip.findUnique({
    where: { inviteCode: code },
    include: {
      creator: { select: { name: true, email: true, image: true } },
      seats: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!trip) {
    return (
      <div className="hero">
        <h1>Lien invalide</h1>
        <p>Ce séjour n&apos;existe pas ou le code est incorrect.</p>
        <Link href="/trips" className="btn btn-primary">
          Voir les séjours
        </Link>
      </div>
    );
  }

  // Trip sans seats (avant migration) : crée au moins la place créateur
  let seats = trip.seats;
  if (seats.length === 0) {
    await createOwnerSeat(trip.id, trip.creatorId);
    seats = await prisma.tripSeat.findMany({
      where: { tripId: trip.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const session = await getServerSession(authOptions);
  const seatPref = searchParams.seat?.trim() || "";

  // Connecté + seat dans l’URL → claim direct
  if (session?.user?.id && seatPref) {
    const result = await claimTripSeat({
      tripId: trip.id,
      userId: session.user.id,
      seatId: seatPref,
    });
    if (!("error" in result)) {
      redirect(`/trips/${trip.id}`);
    }
  }

  // Déjà membre (place claimée ou trip d’avant les seats) → entre
  if (session?.user?.id) {
    const mySeat = seats.find((s) => s.claimedById === session.user!.id);
    if (mySeat) {
      redirect(`/trips/${trip.id}`);
    }
    const membership = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId: trip.id, userId: session.user.id },
      },
    });
    if (membership) {
      redirect(`/trips/${trip.id}`);
    }
  }

  const host = riderLabel(trip.creator);

  return (
    <div className="trip-join-page">
      <span className="hero-kicker">Invitation séjour</span>
      <h1>{trip.name}</h1>
      <p className="subtitle">
        {trip.location || "Spot libre"} ·{" "}
        {trip.startDate.toLocaleDateString("fr-FR")} →{" "}
        {trip.endDate.toLocaleDateString("fr-FR")}
      </p>
      <p className="community-lead">
        {host} t&apos;invite — {seats.length} place
        {seats.length > 1 ? "s" : ""} sur le crew.
      </p>

      <TripJoinPicker
        inviteCode={trip.inviteCode}
        isLoggedIn={!!session?.user?.id}
        seats={seats.map((s) => ({
          id: s.id,
          displayName: s.displayName,
          image: s.image,
          claimed: !!s.claimedById,
          isMine: !!session?.user?.id && s.claimedById === session.user.id,
        }))}
      />
    </div>
  );
}
