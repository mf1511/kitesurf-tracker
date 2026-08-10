import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GEAR_CATEGORIES, gearCategoryLabel, gearDisplayName } from "@/lib/gear";

export default async function MaterielPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const items = await prisma.gear.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      category: true,
      brand: true,
      model: true,
      name: true,
      size: true,
      purchaseDate: true,
      sessionCount: true,
      invoiceName: true,
    },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });

  // Groupement par catégorie pour la liste
  const byCat = GEAR_CATEGORIES.map((c) => ({
    ...c,
    items: items.filter((g) => g.category === c.id),
  })).filter((g) => g.items.length > 0);

  const orphan = items.filter((g) => !GEAR_CATEGORIES.some((c) => c.id === g.category));

  return (
    <div className="trips-page materiel-page">
      <header className="community-header">
        <div>
          <h1>Matériel</h1>
          <p className="subtitle">
            Ton quiver : ailes, barres, planches… date d’achat, facture et
            nombre de sorties.
          </p>
        </div>
        <Link href="/materiel/new" className="btn btn-primary">
          + Ajouter
        </Link>
      </header>

      {items.length === 0 ? (
        <section className="game-section">
          <p className="quest-empty">
            Rien encore — ajoute ta première aile ou ta planche.
          </p>
        </section>
      ) : (
        byCat.map((group) => (
          <section key={group.id} className="game-section">
            <h2>
              {group.label}{" "}
              <span className="gear-count-badge">{group.items.length}</span>
            </h2>
            <div className="trip-grid gear-grid">
              {group.items.map((g) => (
                <Link key={g.id} href={`/materiel/${g.id}`} className="trip-card gear-card">
                  <span className="trip-status-pill upcoming">{gearCategoryLabel(g.category)}</span>
                  <strong>{gearDisplayName(g)}</strong>
                  <span className="trip-meta">
                    {[g.size, g.brand].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="trip-meta">
                    {g.sessionCount} sortie{g.sessionCount === 1 ? "" : "s"}
                    {g.purchaseDate
                      ? ` · acheté le ${g.purchaseDate.toLocaleDateString("fr-FR")}`
                      : ""}
                    {g.invoiceName ? " · facture" : ""}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      {orphan.length > 0 && (
        <section className="game-section">
          <h2>Autre</h2>
          <div className="trip-grid gear-grid">
            {orphan.map((g) => (
              <Link key={g.id} href={`/materiel/${g.id}`} className="trip-card gear-card">
                <strong>{gearDisplayName(g)}</strong>
                <span className="trip-meta">{g.sessionCount} sorties</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
