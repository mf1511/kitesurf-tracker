import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gearCategoryLabel, gearDisplayName } from "@/lib/gear";
import { formatDuration } from "@/lib/sessions";
import GearSessionControls from "@/components/gear-session-controls";
import GearDeleteButton from "@/components/gear-delete-button";

type Props = { params: { id: string } };

export default async function MaterielDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const gear = await prisma.gear.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: {
      id: true,
      category: true,
      brand: true,
      model: true,
      name: true,
      size: true,
      year: true,
      purchaseDate: true,
      purchasePrice: true,
      sessionCount: true,
      notes: true,
      invoiceName: true,
      createdAt: true,
    },
  });

  if (!gear) notFound();

  // Sessions loggées avec ce matériel : heures cumulées + historique récent
  const gearSessions = await prisma.kiteSession.findMany({
    where: { userId: session.user.id, gearUsed: { some: { gearId: gear.id } } },
    select: {
      id: true,
      date: true,
      durationMin: true,
      windKnots: true,
      spot: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
  const totalMin = gearSessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);

  return (
    <div className="trips-page materiel-detail">
      <Link href="/materiel" className="back-link">
        ← Matériel
      </Link>

      <header className="community-header">
        <div>
          <p className="gear-cat-eyebrow">{gearCategoryLabel(gear.category)}</p>
          <h1>{gearDisplayName(gear)}</h1>
          <p className="subtitle">
            {[gear.brand, gear.model, gear.size, gear.year ? String(gear.year) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Link href={`/materiel/${gear.id}/edit`} className="btn btn-ghost">
          Modifier
        </Link>
      </header>

      <section className="community-card">
        <h2>Sorties</h2>
        <GearSessionControls gearId={gear.id} sessionCount={gear.sessionCount} />
        {gearSessions.length > 0 && (
          <p className="gear-hours-line">
            {gearSessions.length} session{gearSessions.length === 1 ? "" : "s"} loggée
            {gearSessions.length === 1 ? "" : "s"}
            {totalMin > 0 ? ` · ${formatDuration(totalMin)} sur l’eau` : ""}
          </p>
        )}
      </section>

      {gearSessions.length > 0 && (
        <section className="community-card">
          <h2>Historique de sessions</h2>
          <ul className="gear-session-history">
            {gearSessions.slice(0, 8).map((s) => (
              <li key={s.id}>
                <strong>{s.date.toLocaleDateString("fr-FR")}</strong>
                <span>
                  {[
                    s.spot?.name,
                    s.windKnots != null ? `${s.windKnots} nds` : null,
                    formatDuration(s.durationMin),
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/sessions" className="dash-panel-link">
            Tout le journal →
          </Link>
        </section>
      )}

      <section className="community-card">
        <h2>Achat</h2>
        <dl className="gear-dl">
          <div>
            <dt>Date</dt>
            <dd>
              {gear.purchaseDate
                ? gear.purchaseDate.toLocaleDateString("fr-FR")
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Prix</dt>
            <dd>
              {gear.purchasePrice != null
                ? `${gear.purchasePrice.toLocaleString("fr-FR", {
                    maximumFractionDigits: 2,
                  })} €`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Facture</dt>
            <dd>
              {gear.invoiceName ? (
                <a
                  href={`/api/gear/${gear.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gear-invoice-link"
                >
                  {gear.invoiceName}
                </a>
              ) : (
                "Aucune"
              )}
            </dd>
          </div>
        </dl>
      </section>

      {gear.notes && (
        <section className="community-card">
          <h2>Notes</h2>
          <p className="gear-notes">{gear.notes}</p>
        </section>
      )}

      <section className="community-card gear-danger-zone">
        <h2>Zone danger</h2>
        <GearDeleteButton gearId={gear.id} />
      </section>
    </div>
  );
}
