import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSpots, waterTypeLabel } from "@/lib/spots";
import { fetchSpotForecast, type SpotForecast } from "@/lib/weather";
import { SpotForm } from "@/components/spot-form";
import { SpotCardActions } from "@/components/spot-card-actions";
import { WindForecast } from "@/components/wind-forecast";

export const metadata = { title: "Spots — KiteQuest" };

export default async function SpotsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [spots, user, kites] = await Promise.all([
    getUserSpots(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { weightKg: true } }),
    prisma.gear.findMany({
      where: { userId, category: "aile" },
      select: { id: true, brand: true, model: true, name: true, size: true },
    }),
  ]);

  const favorite = spots.find((s) => s.favorite) ?? null;

  // Prévisions du spot favori — l'app reste utilisable si Open-Meteo est down
  let forecast: SpotForecast | null = null;
  let forecastError = false;
  if (favorite) {
    try {
      forecast = await fetchSpotForecast(favorite.latitude, favorite.longitude);
    } catch (err) {
      console.error("Prévisions Open-Meteo indisponibles :", err);
      forecastError = true;
    }
  }

  return (
    <div className="trips-page spots-page">
      <header className="community-header">
        <div>
          <h1>Spots</h1>
          <p className="subtitle">
            Tes spots de kite : météo vent 7 jours et taille d’aile conseillée
            sur ton spot favori.
          </p>
        </div>
      </header>

      {favorite && (
        <section className="game-section">
          <h2>
            ⭐ {favorite.name}
            <span className="spot-meta-inline">
              {[waterTypeLabel(favorite.waterType), favorite.windOrientation]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </h2>
          {forecast ? (
            <WindForecast
              forecast={forecast}
              weightKg={user?.weightKg ?? null}
              kites={kites}
            />
          ) : forecastError ? (
            <p className="quest-empty">
              Prévisions indisponibles pour le moment — réessaie plus tard.
            </p>
          ) : null}
          {!user?.weightKg && forecast && (
            <p className="wind-hint">
              💡 Renseigne ton poids dans{" "}
              <Link href="/parametres">ton profil</Link> pour voir la taille
              d’aile conseillée chaque jour.
            </p>
          )}
        </section>
      )}

      <section className="game-section">
        <h2>Mes spots</h2>
        {spots.length === 0 ? (
          <p className="quest-empty">
            Aucun spot — ajoute ton spot habituel pour suivre le vent.
          </p>
        ) : (
          <div className="trip-grid spot-grid">
            {spots.map((s) => (
              <article key={s.id} className="trip-card spot-card">
                <div className="spot-card-head">
                  <strong>
                    {s.favorite ? "⭐ " : ""}
                    {s.name}
                  </strong>
                  <SpotCardActions spotId={s.id} spotName={s.name} favorite={s.favorite} />
                </div>
                <span className="trip-meta">
                  {[waterTypeLabel(s.waterType), s.windOrientation].filter(Boolean).join(" · ") || "—"}
                </span>
                <span className="trip-meta">
                  {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="game-section">
        <h2>Ajouter un spot</h2>
        <SpotForm />
      </section>
    </div>
  );
}
