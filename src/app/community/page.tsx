import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildFriendsFeed,
  buildFriendsLeaderboard,
  ensureInviteForUser,
  getFriendIds,
  riderLabel,
} from "@/lib/community";
import CommunityInviteCard from "@/components/community-invite-card";
import CommunityFriendsPanel from "@/components/community-friends-panel";
import { ChallengesPanel } from "@/components/challenges-panel";
import { getChallengesForUser } from "@/lib/challenges";

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const me = session.user.id;
  const invite = await ensureInviteForUser(me);
  const friendIds = await getFriendIds(me);

  const [accepted, incoming, outgoing, leaderboard, feed, challenges, figureOptions] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: me }, { addresseeId: me }],
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        addressee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: me, status: "pending" },
      include: { requester: { select: { id: true, name: true, email: true } } },
    }),
    prisma.friendship.findMany({
      where: { requesterId: me, status: "pending" },
      include: { addressee: { select: { id: true, name: true, email: true } } },
    }),
    buildFriendsLeaderboard(me, friendIds),
    buildFriendsFeed(me, friendIds, 25),
    getChallengesForUser(me),
    prisma.figure.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const friends = accepted.map((f) => {
    const other = f.requesterId === me ? f.addressee : f.requester;
    return { friendshipId: f.id, ...other, label: riderLabel(other) };
  });

  return (
    <div className="community-page">
      <header className="community-header">
        <div>
          <h1>Communauté</h1>
          <p className="subtitle">
            Invite tes potes, comparez vos XP et célébrez les figures validées ensemble.
          </p>
        </div>
        <Link href="/dashboard" className="btn btn-ghost">
          ← Mon aventure
        </Link>
      </header>

      <CommunityInviteCard
        initialCode={invite.code}
        initialPath={`/invite/${invite.code}`}
        usedCount={invite.usedCount}
        maxUses={invite.maxUses}
      />

      <div className="community-grid">
        <section className="community-card">
          <h2>Classement potes</h2>
          {leaderboard.length <= 1 && friendIds.length === 0 ? (
            <p className="quest-empty">Invite quelqu&apos;un pour lancer la compétition amicale.</p>
          ) : (
            <ol className="leaderboard">
              {leaderboard.map((row, i) => (
                <li key={row.user.id} className={row.isMe ? "me" : ""}>
                  <span className="rank">#{i + 1}</span>
                  <div className="lb-info">
                    <strong>
                      {row.user.label}
                      {row.isMe ? " (toi)" : ""}
                    </strong>
                    <span>
                      {row.done} figures · {row.xp} XP
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="community-card">
          <h2>Fil d&apos;activité</h2>
          {feed.length === 0 ? (
            <p className="quest-empty">Aucune validation récente — à vos straps !</p>
          ) : (
            <ul className="activity-feed">
              {feed.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.rider.label}</strong> a validé{" "}
                    <Link href={`/figures/${item.figureSlug}`}>{item.figureName}</Link>
                    <span className="feed-meta">
                      {item.category} · +{item.xp} XP ·{" "}
                      {item.at.toLocaleDateString("fr-FR", {
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
      </div>

      <ChallengesPanel
        meId={me}
        challenges={challenges}
        friends={friends.map((f) => ({ id: f.id, label: f.label }))}
        figures={figureOptions}
      />

      <CommunityFriendsPanel
        friends={friends}
        incoming={incoming.map((f) => ({
          friendshipId: f.id,
          ...f.requester,
          label: riderLabel(f.requester),
        }))}
        outgoing={outgoing.map((f) => ({
          friendshipId: f.id,
          ...f.addressee,
          label: riderLabel(f.addressee),
        }))}
      />
    </div>
  );
}
