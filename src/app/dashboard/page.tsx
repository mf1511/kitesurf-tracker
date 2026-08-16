import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeGameStats,
  medalForPct,
  sortCategories,
  xpForCategory,
} from "@/lib/gamification";
import { tripStatus } from "@/lib/trips";
import { getFavoriteSpot } from "@/lib/spots";
import { getUserSessions, formatDuration } from "@/lib/sessions";
import { getCategoryOrder } from "@/lib/category-order";
import { degToCompass, fetchSpotForecast, rateWind, type SpotForecast } from "@/lib/weather";
import BadgeSlider from "@/components/badge-slider";
import { figureHref } from "@/lib/nav-return";

const STATUS_LABEL = {
  live: "En cours",
  upcoming: "À venir",
  past: "Terminé",
} as const;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const [figures, myTrips, myObjectives, favoriteSpot, lastSessions, categoryOrder] =
    await Promise.all([
    prisma.figure.findMany({
      where: { active: true },
      include: {
        prerequisites: { select: { id: true } },
        progress: { where: { userId, completed: true } },
      },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    }),
    prisma.trip.findMany({
      where: {
        members: { some: { userId } },
        endDate: { gte: now },
      },
      include: {
        _count: { select: { members: true, figures: true } },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.tripMemberObjective.findMany({
      where: {
        userId,
        trip: { endDate: { gte: now } },
      },
      include: {
        figure: { select: { id: true, slug: true, name: true, category: true } },
        trip: { select: { id: true, name: true, startDate: true, endDate: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    getFavoriteSpot(userId),
    getUserSessions(userId, 3),
    getCategoryOrder(),
  ]);

  // Météo du spot favori — best effort (coords optionnelles)
  let forecast: SpotForecast | null = null;
  if (
    favoriteSpot?.latitude != null &&
    favoriteSpot?.longitude != null
  ) {
    try {
      forecast = await fetchSpotForecast(
        favoriteSpot.latitude,
        favoriteSpot.longitude
      );
    } catch (err) {
      console.error("Météo dashboard indisponible :", err);
    }
  }

  const stats = computeGameStats(figures);
  const categories = sortCategories(
    Array.from(new Set(figures.map((f) => f.category))),
    categoryOrder
  );
  const doneIds = new Set(
    figures.filter((f) => f.progress.length > 0).map((f) => f.id)
  );

  // Prochain séjour : live d’abord, sinon le plus proche
  const rankedTrips = [...myTrips].sort((a, b) => {
    const sa = tripStatus(a.startDate, a.endDate, now);
    const sb = tripStatus(b.startDate, b.endDate, now);
    if (sa === "live" && sb !== "live") return -1;
    if (sb === "live" && sa !== "live") return 1;
    return a.startDate.getTime() - b.startDate.getTime();
  });
  const nextTrip = rankedTrips[0] ?? null;
  const nextTripStatus = nextTrip
    ? tripStatus(nextTrip.startDate, nextTrip.endDate, now)
    : null;

  const openObjectives = myObjectives
    .filter((o) => !doneIds.has(o.figureId))
    .slice(0, 5);

  const badges = [...stats.badges].sort(
    (a, b) => Number(b.earned) - Number(a.earned)
  );
  const badgesEarned = badges.filter((b) => b.earned).length;

  const firstName = session.user.name?.trim().split(/\s+/)[0];

  // Mondes triés : en cours d’abord, puis % décroissant
  const worlds = categories
    .map((cat) => {
      const catFigures = figures.filter((f) => f.category === cat);
      const catDone = catFigures.filter((f) => f.progress.length > 0).length;
      const pct = catFigures.length
        ? Math.round((catDone / catFigures.length) * 100)
        : 0;
      return {
        cat,
        catDone,
        total: catFigures.length,
        pct,
        medal: medalForPct(pct),
        xpHint: xpForCategory(cat),
      };
    })
    .sort((a, b) => {
      // Formations en tête
      if (a.cat === "Débuter") return -1;
      if (b.cat === "Débuter") return 1;
      if (a.pct === 100 && b.pct !== 100) return 1;
      if (b.pct === 100 && a.pct !== 100) return -1;
      if (a.pct === 0 && b.pct > 0) return 1;
      if (b.pct === 0 && a.pct > 0) return -1;
      return b.pct - a.pct;
    });

  return (
    <div className="dashboard">
      {/* Header : identité + progression — une seule composition */}
      <header className="dash-hero">
        <div className="dash-hero-text">
          <p className="dash-level-tag">
            Niv. {stats.level} · {stats.title}
          </p>
          <h1>Salut{firstName ? `, ${firstName}` : ""}</h1>
          <p className="dash-hero-lead">
            {stats.totalDone} figures validées · {stats.xp} XP · {stats.overallPct}
            % du lexique
          </p>
        </div>

        <div className="dash-hero-progress">
          <div className="xp-bar-meta">
            <span>Vers niveau {stats.level + 1}</span>
            <span>
              {stats.xpIntoLevel} / {stats.xpForNextLevel} XP
            </span>
          </div>
          <div
            className="xp-bar"
            role="progressbar"
            aria-valuenow={stats.xpProgressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progression vers le prochain niveau"
          >
            <div
              className="xp-bar-fill"
              style={{ width: `${stats.xpProgressPct}%` }}
            />
          </div>
        </div>

        <nav className="dash-quick" aria-label="Raccourcis">
          <Link href="/figures" className="dash-quick-link">
            Figures
          </Link>
          <Link href="/spots" className="dash-quick-link">
            Spots
          </Link>
          <Link href="/sessions" className="dash-quick-link">
            Sessions
          </Link>
          <Link href="/trips" className="dash-quick-link">
            Séjours
          </Link>
          <Link href="/stats" className="dash-quick-link">
            Stats
          </Link>
          <Link href="/community" className="dash-quick-link">
            Amis
          </Link>
        </nav>
      </header>

      {/* Action principale : quoi faire maintenant */}
      <section className="dash-block">
        <div className="dash-block-head">
          <h2>À faire maintenant</h2>
          <Link href="/figures" className="dash-panel-link">
            Toutes les figures
          </Link>
        </div>
        {stats.quests.length === 0 ? (
          <p className="dash-empty-line">
            {stats.totalDone === 0
              ? "Commence par une figure de base pour lancer l’aventure."
              : "Rien d’ouvert pour l’instant — explore une autre catégorie."}
          </p>
        ) : (
          <ol className="dash-quest-list">
            {stats.quests.map((q) => (
              <li key={q.id}>
                <Link
                  href={figureHref(q.slug, "/dashboard")}
                  className="dash-quest-row"
                >
                  <span className="dash-quest-main">
                    <strong>{q.name}</strong>
                    <span>{q.category}</span>
                  </span>
                  <span className="xp-pill">+{q.xp} XP</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Météo spot favori + dernières sessions */}
      <section className="dash-hub">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Météo spot</h2>
            <Link href="/spots" className="dash-panel-link">
              Spots
            </Link>
          </div>
          {!favoriteSpot ? (
            <div className="dash-empty">
              <p>Ajoute ton spot favori pour voir le vent ici.</p>
              <Link href="/spots" className="btn btn-primary">
                Créer un spot
              </Link>
            </div>
          ) : !forecast ? (
            <p className="dash-empty-line">
              Météo indisponible pour {favoriteSpot.name} — réessaie plus tard.
            </p>
          ) : (
            <Link href="/spots" className="dash-weather">
              <span className="dash-weather-emoji" aria-hidden>
                {rateWind(forecast.now.windKnots).emoji}
              </span>
              <span className="dash-weather-main">
                <strong>
                  {favoriteSpot.name} · {forecast.now.windKnots} nds
                </strong>
                <span>
                  {rateWind(forecast.now.windKnots).label} ·{" "}
                  {degToCompass(forecast.now.directionDeg)} · {forecast.now.temp}
                  °C
                </span>
              </span>
              <span className="dash-weather-days">
                {forecast.days.slice(1, 4).map((d) => (
                  <span key={d.date} className="dash-weather-day">
                    <span>
                      {new Date(`${d.date}T12:00:00`).toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                    </span>
                    <strong>{d.windKnots}</strong>
                  </span>
                ))}
              </span>
            </Link>
          )}
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Dernières sessions</h2>
            <Link href="/sessions" className="dash-panel-link">
              Journal
            </Link>
          </div>
          {lastSessions.length === 0 ? (
            <div className="dash-empty">
              <p>Logge ta première session de kite.</p>
              <Link href="/sessions" className="btn btn-ghost">
                Sessions
              </Link>
            </div>
          ) : (
            <ul className="dash-session-list">
              {lastSessions.map((s) => (
                <li key={s.id}>
                  <Link href="/sessions">
                    <strong>
                      {s.date.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                      {s.spot ? ` · ${s.spot.name}` : ""}
                    </strong>
                    <span>
                      {[
                        s.windKnots != null ? `${s.windKnots} nds` : null,
                        formatDuration(s.durationMin),
                        s.gearUsed.length
                          ? `${s.gearUsed.length} matos`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {/* Séjour + objectifs */}
      <section className="dash-hub">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Séjour</h2>
            <Link href="/trips" className="dash-panel-link">
              Tous
            </Link>
          </div>
          {nextTrip && nextTripStatus ? (
            <Link href={`/trips/${nextTrip.id}`} className="dash-trip-card">
              <span className={`trip-status-pill ${nextTripStatus}`}>
                {STATUS_LABEL[nextTripStatus]}
              </span>
              <strong>{nextTrip.name}</strong>
              <span className="trip-meta">
                {nextTrip.location || "Spot libre"} ·{" "}
                {nextTrip.startDate.toLocaleDateString("fr-FR")} →{" "}
                {nextTrip.endDate.toLocaleDateString("fr-FR")}
              </span>
              <span className="trip-meta">
                {nextTrip._count.members} riders · {nextTrip._count.figures}{" "}
                figures
              </span>
            </Link>
          ) : (
            <div className="dash-empty">
              <p>Aucun séjour à venir.</p>
              <Link href="/trips/new" className="btn btn-primary">
                Créer un séjour
              </Link>
            </div>
          )}
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Objectifs trip</h2>
            {nextTrip ? (
              <Link href={`/trips/${nextTrip.id}`} className="dash-panel-link">
                Ouvrir
              </Link>
            ) : null}
          </div>
          {openObjectives.length === 0 ? (
            <div className="dash-empty">
              <p>
                {myObjectives.length === 0
                  ? "Ajoute des figures en objectif sur un séjour."
                  : "Tous tes objectifs actifs sont déjà validés."}
              </p>
              <Link href="/trips" className="btn btn-ghost">
                Séjours
              </Link>
            </div>
          ) : (
            <ul className="dash-objective-list">
              {openObjectives.map((o) => (
                <li key={o.id}>
                  <Link href={figureHref(o.figure.slug, "/dashboard")}>
                    <strong>{o.figure.name}</strong>
                    <span>
                      {o.trip.name} · {o.figure.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {/* Badges : slider horizontal */}
      <section className="dash-block">
        <div className="dash-block-head">
          <h2>Badges</h2>
          <span className="dash-panel-meta">
            {badgesEarned}/{badges.length}
          </span>
        </div>
        <BadgeSlider badges={badges} />
      </section>

      {/* Mondes : liste compacte, pas une grille de cartes lourdes */}
      <section className="dash-block">
        <div className="dash-block-head">
          <h2>Mondes</h2>
          <Link href="/figures" className="dash-panel-link">
            Explorer
          </Link>
        </div>
        <ul className="dash-world-list">
          {worlds.map((w) => (
            <li key={w.cat}>
              <Link
                href="/figures/arbre"
                className="dash-world-row"
              >
                <span className="dash-world-label">
                  {w.medal ? <span aria-hidden>{w.medal}</span> : null}
                  <strong>{w.cat}</strong>
                </span>
                <span className="dash-world-bar" aria-hidden>
                  <span style={{ width: `${w.pct}%` }} />
                </span>
                <span className="dash-world-meta">
                  {w.catDone}/{w.total}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
