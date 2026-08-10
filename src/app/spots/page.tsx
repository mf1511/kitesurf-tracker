import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getKnownSpotNames,
  getPopularSpots,
  getUserSpots,
  normalizeSpotName,
  waterTypeLabel,
} from "@/lib/spots";
import { fetchSpotForecast, type SpotForecast } from "@/lib/weather";
import { SpotForm } from "@/components/spot-form";
import { SpotCardActions } from "@/components/spot-card-actions";
import { PopularSpots } from "@/components/popular-spots";
import { WindForecast } from "@/components/wind-forecast";

export const metadata = { title: "Spots — KiteQuest" };

export default async function SpotsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [spots, user, kites, popular, knownNames] = await Promise.all([
    getUserSpots(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { weightKg: true } }),
    prisma.gear.findMany({
      where: { userId, category: "aile" },
      select: { id: true, brand: true, model: true, name: true, size: true },
    }),
    getPopularSpots(3),
    getKnownSpotNames(),
  ]);

  const mineByKey = new Map(
    spots.map((s) => [normalizeSpotName(s.name), s] as const)
  );
  const popularRows = popular.map((p) => {
    const mine = mineByKey.get(normalizeSpotName(p.name));
    return {
      ...p,
      mineId: mine?.id ?? null,
      isFavorite: !!mine?.favorite,
    };
  });

  const favorite = spots.find((s) => s.favorite) ?? null;
  const hasCoords =
    favorite?.latitude != null && favorite?.longitude != null;

  // Prévisions seulement si le favori a encore des coords
  let forecast: SpotForecast | null = null;
  let forecastError = false;
  if (hasCoords) {
    try {
      forecast = await fetchSpotForecast(
        favorite!.latitude!,
        favorite!.longitude!
      );
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
            Spots populaires, tes favoris, et le vent sur ton spot favori.
          </p>
        </div>
      </header>

      <PopularSpots spots={popularRows} />

      {favorite && (
        <section className="game-section">
          <h2>
            ★ {favorite.name}
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
          ) : !hasCoords ? (
            <p className="quest-empty">
              Pas encore de météo pour ce spot (coords non renseignées).
            </p>
          ) : null}
          {!user?.weightKg && forecast && (
            <p className="wind-hint">
              Renseigne ton poids dans{" "}
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
            Aucun spot — ajoute ton spot habituel ou un populaire ci-dessus.
          </p>
        ) : (
          <div className="trip-grid spot-grid">
            {spots.map((s) => (
              <article key={s.id} className="trip-card spot-card">
                <div className="spot-card-head">
                  <strong>
                    {s.favorite ? "★ " : ""}
                    {s.name}
                  </strong>
                  <SpotCardActions
                    spotId={s.id}
                    spotName={s.name}
                    favorite={s.favorite}
                  />
                </div>
                <span className="trip-meta">
                  {[waterTypeLabel(s.waterType), s.windOrientation]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </span>
                <span className="trip-meta">
                  {s._count.sessions} session
                  {s._count.sessions > 1 ? "s" : ""}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="game-section">
        <h2>Ajouter un spot</h2>
        <SpotForm knownNames={knownNames} />
      </section>
    </div>
  );
}
