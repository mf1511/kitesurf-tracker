import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getFriendProfile } from "@/lib/friend-profile";
import { formatDuration } from "@/lib/sessions";
import UserAvatar from "@/components/user-avatar";
import { figureHref } from "@/lib/nav-return";

export const metadata = { title: "Ami — KiteQuest" };

export default async function FriendProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Son propre profil → dashboard
  if (params.id === session.user.id) redirect("/dashboard");

  const profile = await getFriendProfile(session.user.id, params.id);
  if (!profile) notFound();

  const { user, stats, byCategory, recentProgress, objectives, sessions, sessionStats } =
    profile;

  return (
    <div className="community-page friend-profile-page">
      <Link href="/community" className="back-link">
        ← Amis
      </Link>

      <header className="friend-profile-hero">
        <UserAvatar
          name={user.name}
          email={user.email}
          image={user.image}
          className="friend-profile-avatar"
        />
        <div>
          <h1>{user.label}</h1>
          <p className="subtitle">
            {user.username ? `@${user.username} · ` : null}
            Niveau {stats.level} · {stats.title} · {stats.xp} XP
          </p>
        </div>
      </header>

      <div className="trip-stat-strip">
        <div>
          <strong>
            {stats.totalDone}/{stats.totalFigures}
          </strong>
          <span>figures</span>
        </div>
        <div>
          <strong>{stats.overallPct}%</strong>
          <span>progression</span>
        </div>
        <div>
          <strong>{sessionStats.count}</strong>
          <span>sessions</span>
        </div>
        <div>
          <strong>{formatDuration(sessionStats.totalMin) || "0 h"}</strong>
          <span>sur l&apos;eau</span>
        </div>
      </div>

      <section className="community-card">
        <h2>Progression</h2>
        <p className="community-lead">Par monde de figures.</p>
        <ul className="friend-cat-bars">
          {byCategory.map((c) => (
            <li key={c.category}>
              <div className="friend-cat-bar-head">
                <strong>{c.category}</strong>
                <span>
                  {c.done}/{c.total}
                </span>
              </div>
              <div
                className="friend-cat-bar-track"
                role="progressbar"
                aria-valuenow={c.pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${c.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="community-card">
        <h2>Objectifs séjour</h2>
        {objectives.length === 0 ? (
          <p className="quest-empty">Aucun objectif sur un séjour en cours.</p>
        ) : (
          <ul className="activity-feed">
            {objectives.map((o) => (
              <li key={o.id}>
                <div>
                  <strong>
                    {o.done ? "✓ " : ""}
                    <Link href={figureHref(o.figureSlug, `/community/${params.id}`)}>
                      {o.figureName}
                    </Link>
                  </strong>
                  <span className="feed-meta">
                    {o.category} · {o.tripName}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="community-card">
        <h2>Dernières figures</h2>
        {recentProgress.length === 0 ? (
          <p className="quest-empty">Pas encore de figure validée.</p>
        ) : (
          <ul className="activity-feed">
            {recentProgress.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>
                    <Link href={figureHref(p.slug, `/community/${params.id}`)}>
                      {p.name}
                    </Link>
                  </strong>
                  <span className="feed-meta">
                    {p.category} · +{p.xp} XP ·{" "}
                    {p.at.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="community-card">
        <h2>Sessions</h2>
        {sessions.length === 0 ? (
          <p className="quest-empty">Aucune session loggée.</p>
        ) : (
          <ul className="activity-feed">
            {sessions.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>
                    {s.date.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                  <span className="feed-meta">
                    {[
                      s.spot?.name,
                      s.durationMin != null
                        ? formatDuration(s.durationMin)
                        : null,
                      s.windKnots != null ? `${s.windKnots} nds` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Session"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
