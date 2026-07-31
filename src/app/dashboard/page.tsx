import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeGameStats, medalForPct, xpForCategory } from "@/lib/gamification";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const figures = await prisma.figure.findMany({
    include: {
      prerequisites: { select: { id: true } },
      progress: { where: { userId: session.user.id, completed: true } },
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const stats = computeGameStats(figures);
  const categories = Array.from(new Set(figures.map((f) => f.category)));
  const circumference = 314;
  const dashOffset = circumference - (stats.overallPct / 100) * circumference;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="level-card">
          <span className="level-title">Niveau {stats.level} · {stats.title}</span>
          <h1>Salut{session.user.name ? `, ${session.user.name}` : ""} !</h1>
          <p className="subtitle">
            {stats.totalDone} / {stats.totalFigures} figures · {stats.xp} XP
          </p>
          <div className="xp-bar-wrap">
            <div className="xp-bar-meta">
              <span>XP vers niveau {stats.level + 1}</span>
              <span>
                {stats.xpIntoLevel} / {stats.xpForNextLevel}
              </span>
            </div>
            <div className="xp-bar" aria-hidden>
              <div className="xp-bar-fill" style={{ width: `${stats.xpProgressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="gauge-stack">
          <div className="gauge">
            <svg width="100" height="100" viewBox="0 0 120 120">
              <circle className="gauge-track" cx="60" cy="60" r="50" />
              <circle
                className="gauge-fill"
                cx="60"
                cy="60"
                r="50"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="gauge-label">
              <span className="pct">{stats.overallPct}%</span>
              <span className="pct-sub">global</span>
            </div>
          </div>

          <div className="streak-pill" title="Jours consécutifs avec au moins une figure validée">
            <span className="streak-fire" aria-hidden>🔥</span>
            <strong>{stats.streak}</strong>
            <span>streak</span>
          </div>
        </div>
      </div>

      <section className="game-section teaser-row">
        <Link href="/trips" className="community-teaser">
          <strong>Séjours</strong>
          <span>Dakhla, défis crew, leaderboard du trip →</span>
        </Link>
        <Link href="/community" className="community-teaser">
          <strong>Communauté</strong>
          <span>Invite tes amis, classement XP global →</span>
        </Link>
      </section>

      <section className="game-section">
        <h2>🎯 Prochaines quêtes</h2>
        {stats.quests.length === 0 ? (
          <p className="quest-empty">
            {stats.totalDone === 0
              ? "Commence par une figure de base pour lancer l’aventure !"
              : "Toutes les quêtes débloquées sont validées — explore d’autres catégories."}
          </p>
        ) : (
          <div className="quest-grid">
            {stats.quests.map((q, i) => (
              <Link key={q.id} href={`/figures/${q.slug}`} className="quest-card">
                <span className="quest-label">Quête {i + 1}</span>
                <strong>{q.name}</strong>
                <span className="quest-meta">{q.category}</span>
                <span className="quest-xp">+{q.xp} XP</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="game-section">
        <h2>🏅 Badges</h2>
        <div className="badge-shelf">
          {stats.badges.map((b) => (
            <div
              key={b.id}
              className={`badge-item ${b.earned ? "earned" : "locked"}`}
              title={b.description}
            >
              <div className="badge-icon" aria-hidden>{b.icon}</div>
              <strong>{b.name}</strong>
              <span>{b.earned ? "Débloqué !" : b.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="game-section">
        <h2>🗺️ Mondes</h2>
        <div className="category-grid">
          {categories.map((cat) => {
            const catFigures = figures.filter((f) => f.category === cat);
            const catDone = catFigures.filter((f) => f.progress.length > 0).length;
            const pct = Math.round((catDone / catFigures.length) * 100);
            const medal = medalForPct(pct);
            const xpHint = xpForCategory(cat);
            return (
              <Link
                key={cat}
                href={`/figures?category=${encodeURIComponent(cat)}`}
                className="category-card"
              >
                {medal && <span className="cat-medal" aria-label="médaille">{medal}</span>}
                <h3>{cat}</h3>
                <div className="cat-progress-bar">
                  <div className="cat-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="cat-progress-text">
                  {catDone}/{catFigures.length} · {pct}% · {xpHint} XP/figure
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
