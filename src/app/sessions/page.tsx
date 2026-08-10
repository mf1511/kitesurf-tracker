import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionStats, getUserSessions, formatDuration } from "@/lib/sessions";
import { gearDisplayName } from "@/lib/gear";
import { SessionForm } from "@/components/session-form";
import { SessionDeleteButton } from "@/components/session-delete-button";

export const metadata = { title: "Sessions — KiteQuest" };

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [sessions, stats, spots, gear] = await Promise.all([
    getUserSessions(userId),
    getSessionStats(userId),
    prisma.spot.findMany({
      where: { userId },
      select: { id: true, name: true, favorite: true },
      orderBy: [{ favorite: "desc" }, { createdAt: "asc" }],
    }),
    prisma.gear.findMany({
      where: { userId },
      select: { id: true, category: true, brand: true, model: true, name: true, size: true },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="trips-page sessions-page">
      <header className="community-header">
        <div>
          <h1>Sessions</h1>
          <p className="subtitle">
            Ton journal de nav : spot, vent, durée et matériel utilisé.
          </p>
        </div>
      </header>

      {/* Stats globales */}
      <section className="game-section session-stats">
        <div className="session-stat">
          <strong>{stats.count}</strong>
          <span>session{stats.count === 1 ? "" : "s"}</span>
        </div>
        <div className="session-stat">
          <strong>{formatDuration(stats.totalMin) ?? "0min"}</strong>
          <span>sur l’eau</span>
        </div>
        <div className="session-stat">
          <strong>{stats.avgWind != null ? `${Math.round(stats.avgWind)} nds` : "—"}</strong>
          <span>vent moyen</span>
        </div>
      </section>

      <section className="game-section">
        <h2>Logger une session</h2>
        {spots.length === 0 && (
          <p className="wind-hint">
            💡 <Link href="/spots">Crée d’abord un spot</Link> pour le lier à
            tes sessions (optionnel).
          </p>
        )}
        <SessionForm spots={spots} gear={gear} />
      </section>

      <section className="game-section">
        <h2>Journal</h2>
        {sessions.length === 0 ? (
          <p className="quest-empty">
            Aucune session loggée — ta première nav t’attend 🤙
          </p>
        ) : (
          <ul className="session-list">
            {sessions.map((s) => (
              <li key={s.id} className="session-item">
                <div className="session-item-head">
                  <strong>
                    {s.date.toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                  <SessionDeleteButton sessionId={s.id} />
                </div>
                <span className="trip-meta">
                  {[
                    s.spot?.name,
                    s.windKnots != null ? `${s.windKnots} nds` : null,
                    formatDuration(s.durationMin),
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </span>
                {s.gearUsed.length > 0 && (
                  <span className="session-gear-list">
                    {s.gearUsed.map((g) => (
                      <Link
                        key={g.gear.id}
                        href={`/materiel/${g.gear.id}`}
                        className="session-gear-chip"
                      >
                        {gearDisplayName(g.gear)}
                        {g.gear.size ? ` ${g.gear.size}` : ""}
                      </Link>
                    ))}
                  </span>
                )}
                {s.notes && <p className="session-notes">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
