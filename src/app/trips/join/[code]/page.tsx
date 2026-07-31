import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { riderLabel } from "@/lib/community";

export default async function TripJoinPage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code.trim().toLowerCase();
  const trip = await prisma.trip.findUnique({
    where: { inviteCode: code },
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { members: true } },
    },
  });

  if (!trip) {
    return (
      <div className="hero">
        <h1>Lien invalide</h1>
        <p>Ce séjour n&apos;existe pas ou le code est incorrect.</p>
        <Link href="/trips" className="btn btn-primary">Voir les séjours</Link>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    await prisma.tripMember.upsert({
      where: { tripId_userId: { tripId: trip.id, userId: session.user.id } },
      update: {},
      create: { tripId: trip.id, userId: session.user.id, role: "member" },
    });
    redirect(`/trips/${trip.id}`);
  }

  const host = riderLabel(trip.creator);

  return (
    <div className="hero">
      <span className="hero-kicker">Invitation séjour</span>
      <h1>
        {trip.name} <span>{trip.location ? `· ${trip.location}` : ""}</span>
      </h1>
      <p>
        {host} t&apos;invite sur ce trip ({trip._count.members} riders).{" "}
        {trip.startDate.toLocaleDateString("fr-FR")} →{" "}
        {trip.endDate.toLocaleDateString("fr-FR")}.
      </p>
      <div className="hero-actions">
        <Link href={`/register?trip=${trip.inviteCode}`} className="btn btn-primary">
          Créer un compte &amp; rejoindre
        </Link>
        <Link href={`/login?trip=${trip.inviteCode}`} className="btn btn-ghost">
          J&apos;ai déjà un compte
        </Link>
      </div>
    </div>
  );
}
