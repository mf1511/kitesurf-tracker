import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeGameStats, xpForCategory, medalForPct } from "@/lib/gamification";
import { formatDuration } from "@/lib/sessions";
import { XpChart, type XpPoint } from "@/components/xp-chart";
import { ShareRecapButton } from "@/components/share-recap-button";
import { riderLabel } from "@/lib/community";

export const metadata = { title: "Stats — KiteQuest" };

/** Lundi 00:00 de la semaine courante (semaine FR) */
function mondayOfWeek(now: Date): Date {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  const now = new Date();

  const [figures, kiteSessions, me] = await Promise.all([
    prisma.figure.findMany({
      where: { active: true },
      include: {
        prerequisites: { select: { id: true } },
        progress: { where: { userId } },
      },
    }),
    prisma.kiteSession.findMany({
      where: { userId },
      select: { date: true, durationMin: true, windKnots: true },
      orderBy: { date: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ]);
  if (!me) redirect("/login");

  const stats = computeGameStats(figures);

  // Validations datées (pour la courbe, les records et le récap semaine)
  const validations = figures
    .flatMap((f) =>
      (f.progress ?? [])
        .filter((p) => p.completed && p.completedAt)
        .map((p) => ({
          at: new Date(p.completedAt as Date | string),
          xp: xpForCategory(f.category),
          name: f.name,
        }))
    )
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  // --- Courbe XP cumulé sur 12 mois ---
  const months: { key: string; label: string; end: Date }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      end,
    });
  }
  const xpPoints: XpPoint[] = months.map((m) => ({
    label: m.label,
    xp: validations
      .filter((v) => v.at < m.end)
      .reduce((sum, v) => sum + v.xp, 0),
  }));

  // --- Répartition par catégorie ---
  const categories = Array.from(new Set(figures.map((f) => f.category))).sort();
  const byCategory = categories
    .map((cat) => {
      const list = figures.filter((f) => f.category === cat);
      const done = list.filter((f) => f.progress?.some((p) => p.completed)).length;
      const pct = list.length ? Math.round((done / list.length) * 100) : 0;
      return { cat, done, total: list.length, pct, medal: medalForPct(pct) };
    })
    .sort((a, b) => b.pct - a.pct || b.done - a.done);

  // --- Récap semaine (depuis lundi) ---
  const monday = mondayOfWeek(now);
  const weekValidations = validations.filter((v) => v.at >= monday);
  const weekXp = weekValidations.reduce((sum, v) => sum + v.xp, 0);
  const weekSessions = kiteSessions.filter((s) => s.date >= monday);
  const weekMinutes = weekSessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);

  // --- Records ---
  const perMonth = new Map<string, number>();
  for (const v of validations) {
    const key = v.at.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    perMonth.set(key, (perMonth.get(key) ?? 0) + 1);
  }
  const bestMonth = [...perMonth.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  const firstValidation = validations[0] ?? null;
  const lastValidation = validations[validations.length - 1] ?? null;
  const totalMinutes = kiteSessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const longestSession = kiteSessions.reduce(
    (max, s) => Math.max(max, s.durationMin ?? 0),
    0
  );
  const windiest = kiteSessions.reduce(
    (max, s) => Math.max(max, s.windKnots ?? 0),
    0
  );
  // Rythme : figures / mois depuis la 1ère validation
  const monthsActive = firstValidation
    ? Math.max(
        1,
        (now.getTime() - firstValidation.at.getTime()) / (30.44 * 24 * 3600 * 1000)
      )
    : 0;
  const pace = monthsActive ? (validations.length / monthsActive).toFixed(1) : null;

  const records: { icon: string; label: string; value: string }[] = [
    bestMonth && {
      icon: "🔥",
      label: "Meilleur mois",
      value: `${bestMonth[1]} figure${bestMonth[1] > 1 ? "s" : ""} en ${bestMonth[0]}`,
    },
    firstValidation && {
      icon: "🌊",
      label: "Première figure",
      value: `${firstValidation.name} · ${firstValidation.at.toLocaleDateString("fr-FR")}`,
    },
    lastValidation && {
      icon: "⚡",
      label: "Dernière validation",
      value: `${lastValidation.name} · ${lastValidation.at.toLocaleDateString("fr-FR")}`,
    },
    pace && { icon: "📈", label: "Rythme", value: `${pace} figure(s) / mois` },
    totalMinutes > 0 && {
      icon: "⏱️",
      label: "Temps sur l’eau",
      value: `${formatDuration(totalMinutes)} en ${kiteSessions.length} session${kiteSessions.length > 1 ? "s" : ""}`,
    },
    longestSession > 0 && {
      icon: "🏄",
      label: "Plus longue session",
      value: formatDuration(longestSession)!,
    },
    windiest > 0 && {
      icon: "💨",
      label: "Session la plus ventée",
      value: `${windiest} nds`,
    },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  const weekLabel = `Semaine du ${monday.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })}`;

  return (
    <div className="trips-page stats-page">
      <header className="community-header">
        <div>
          <h1>Stats</h1>
          <p className="subtitle">
            Ta progression en chiffres : XP, catégories, records et semaine en cours.
          </p>
        </div>
      </header>

      {/* Vue d'ensemble */}
      <section className="game-section session-stats stats-overview">
        <div className="session-stat">
          <strong>{stats.xp}</strong>
          <span>XP total</span>
        </div>
        <div className="session-stat">
          <strong>
            {stats.totalDone}/{stats.totalFigures}
          </strong>
          <span>figures</span>
        </div>
        <div className="session-stat">
          <strong>Niv. {stats.level}</strong>
          <span>{stats.title}</span>
        </div>
      </section>

      {/* Récap semaine + partage */}
      <section className="game-section">
        <h2>{weekLabel}</h2>
        <div className="week-recap">
          <div className="session-stats week-recap-stats">
            <div className="session-stat">
              <strong>{weekValidations.length}</strong>
              <span>figure{weekValidations.length === 1 ? "" : "s"} validée{weekValidations.length === 1 ? "" : "s"}</span>
            </div>
            <div className="session-stat">
              <strong>+{weekXp}</strong>
              <span>XP gagnés</span>
            </div>
            <div className="session-stat">
              <strong>{weekSessions.length}</strong>
              <span>session{weekSessions.length === 1 ? "" : "s"}</span>
            </div>
            <div className="session-stat">
              <strong>{formatDuration(weekMinutes) ?? "0min"}</strong>
              <span>sur l’eau</span>
            </div>
          </div>
          <ShareRecapButton
            data={{
              riderName: riderLabel(me),
              period: weekLabel,
              level: stats.level,
              title: stats.title,
              xp: stats.xp,
              figuresDone: stats.totalDone,
              weekFigures: weekValidations.length,
              weekXp,
              weekSessions: weekSessions.length,
              weekMinutes,
            }}
          />
        </div>
      </section>

      {/* Courbe XP */}
      <section className="game-section">
        <h2>XP cumulé — 12 derniers mois</h2>
        {validations.length === 0 ? (
          <p className="quest-empty">
            Valide ta première figure pour lancer la courbe.{" "}
            <Link href="/figures">Aller aux figures</Link>
          </p>
        ) : (
          <XpChart points={xpPoints} />
        )}
      </section>

      {/* Répartition par catégorie */}
      <section className="game-section">
        <h2>Par catégorie</h2>
        <ul className="stats-cat-list">
          {byCategory.map((c) => (
            <li key={c.cat}>
              <Link
                href={`/figures?category=${encodeURIComponent(c.cat)}`}
                className="stats-cat-row"
              >
                <span className="stats-cat-label">
                  {c.medal && <span aria-hidden>{c.medal}</span>}
                  <strong>{c.cat}</strong>
                </span>
                <span className="stats-cat-bar" aria-hidden>
                  <span style={{ width: `${c.pct}%` }} />
                </span>
                <span className="stats-cat-meta">
                  {c.done}/{c.total}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Records */}
      <section className="game-section">
        <h2>Records</h2>
        {records.length === 0 ? (
          <p className="quest-empty">
            Tes records apparaîtront après tes premières figures et sessions.
          </p>
        ) : (
          <ul className="stats-records">
            {records.map((r) => (
              <li key={r.label}>
                <span className="stats-record-icon" aria-hidden>
                  {r.icon}
                </span>
                <span className="stats-record-text">
                  <strong>{r.label}</strong>
                  <span>{r.value}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
