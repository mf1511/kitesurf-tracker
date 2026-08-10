import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripStatus } from "@/lib/trips";

export default async function TripsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const myTrips = await prisma.trip.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { members: true, figures: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const statusLabel = {
    live: "En cours",
    upcoming: "À venir",
    past: "Terminé",
  };

  return (
    <div className="trips-page">
      <header className="community-header">
        <div>
          <h1>Séjours</h1>
          <p className="subtitle">
            Crée un trip, invite le crew, partage une liste de figures et vos
            objectifs — chacun progresse à son rythme.
          </p>
        </div>
        <Link href="/trips/new" className="btn btn-primary">
          + Nouveau séjour
        </Link>
      </header>

      <section className="game-section">
        <h2>Mes séjours</h2>
        {myTrips.length === 0 ? (
          <p className="quest-empty">
            Aucun séjour — crée Dakhla septembre et envoie le lien WhatsApp.
          </p>
        ) : (
          <div className="trip-grid">
            {myTrips.map((t) => {
              const st = tripStatus(t.startDate, t.endDate);
              return (
                <Link key={t.id} href={`/trips/${t.id}`} className={`trip-card status-${st}`}>
                  <span className={`trip-status-pill ${st}`}>{statusLabel[st]}</span>
                  <strong>{t.name}</strong>
                  <span className="trip-meta">
                    {t.location || "Spot non précisé"} ·{" "}
                    {t.startDate.toLocaleDateString("fr-FR")} →{" "}
                    {t.endDate.toLocaleDateString("fr-FR")}
                  </span>
                  <span className="trip-meta">
                    {t._count.members} riders · {t._count.figures} figures
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
