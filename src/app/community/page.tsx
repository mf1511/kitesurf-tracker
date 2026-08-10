import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildFriendsFeed,
  ensureInviteForUser,
  getFriendIds,
  riderLabel,
} from "@/lib/community";
import { getFriendsTeasers } from "@/lib/friend-profile";
import CommunityInviteDialog from "@/components/community-invite-dialog";
import CommunityFriendsPanel from "@/components/community-friends-panel";
import UserAvatar from "@/components/user-avatar";
import { figureHref } from "@/lib/nav-return";

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const me = session.user.id;
  const invite = await ensureInviteForUser(me);
  const friendIds = await getFriendIds(me);

  const [accepted, incoming, outgoing, feed, teasers] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: me }, { addresseeId: me }],
      },
      include: {
        requester: { select: userSelect },
        addressee: { select: userSelect },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: me, status: "pending" },
      include: { requester: { select: userSelect } },
    }),
    prisma.friendship.findMany({
      where: { requesterId: me, status: "pending" },
      include: { addressee: { select: userSelect } },
    }),
    buildFriendsFeed(me, friendIds, 25),
    getFriendsTeasers(friendIds),
  ]);

  const friends = accepted.map((f) => {
    const other = f.requesterId === me ? f.addressee : f.requester;
    const t = teasers.get(other.id) ?? { xp: 0, done: 0 };
    return {
      friendshipId: f.id,
      ...other,
      label: riderLabel(other),
      xp: t.xp,
      done: t.done,
    };
  });

  return (
    <div className="community-page">
      <header className="community-header">
        <div>
          <h1>Amis</h1>
          <p className="subtitle">
            Tes potes, leur progression, et le fil de vos sessions kite.
          </p>
        </div>
        <div className="community-header-actions">
          <CommunityInviteDialog
            initialCode={invite.code}
            initialPath={`/invite/${invite.code}`}
            usedCount={invite.usedCount}
            maxUses={invite.maxUses}
          />
        </div>
      </header>

      <CommunityFriendsPanel
        friends={friends}
        incoming={incoming.map((f) => ({
          friendshipId: f.id,
          ...f.requester,
          label: riderLabel(f.requester),
          xp: 0,
          done: 0,
        }))}
        outgoing={outgoing.map((f) => ({
          friendshipId: f.id,
          ...f.addressee,
          label: riderLabel(f.addressee),
          xp: 0,
          done: 0,
        }))}
      />

      <section className="community-card">
        <h2>Fil d&apos;activité</h2>
        {feed.length === 0 ? (
          <p className="quest-empty">
            Aucune validation récente — les figures de tes potes apparaîtront
            ici.
          </p>
        ) : (
          <ul className="activity-feed">
            {feed.map((item) => (
              <li key={item.id}>
                <UserAvatar
                  name={item.rider.name}
                  email={item.rider.email}
                  image={item.rider.image}
                  className="feed-avatar"
                />
                <div>
                  <strong>
                    {item.rider.id === me ? (
                      "Toi"
                    ) : (
                      <Link href={`/community/${item.rider.id}`}>
                        {item.rider.label}
                      </Link>
                    )}
                  </strong>{" "}
                  a validé{" "}
                  <Link href={figureHref(item.figureSlug, "/community")}>
                    {item.figureName}
                  </Link>
                  <span className="feed-meta">
                    {item.category} ·{" "}
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
  );
}
