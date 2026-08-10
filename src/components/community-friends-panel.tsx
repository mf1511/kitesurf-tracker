"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import UserAvatar from "@/components/user-avatar";

export type FriendCard = {
  friendshipId: string;
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  label: string;
  xp: number;
  done: number;
};

/** Demandes + grille d’amis cliquables */
export default function CommunityFriendsPanel({
  friends,
  incoming,
  outgoing,
}: {
  friends: FriendCard[];
  incoming: FriendCard[];
  outgoing: FriendCard[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [actingId, setActingId] = useState<string | null>(null);

  async function act(
    friendshipId: string,
    action: "accept" | "decline" | "remove"
  ) {
    setActingId(friendshipId);
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error);
      }
      if (action === "accept") toast("Ami ajouté !", "success");
      router.refresh();
    } catch (err) {
      toast(
        err instanceof Error && err.message
          ? err.message
          : "Action impossible, réessaie.",
        "error"
      );
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="community-stack">
      {incoming.length > 0 && (
        <section className="community-card">
          <h2>Demandes reçues</h2>
          <ul className="friend-list">
            {incoming.map((r) => (
              <li key={r.friendshipId}>
                <div className="friend-list-main">
                  <UserAvatar
                    name={r.name}
                    email={r.email}
                    image={r.image}
                    className="friend-list-avatar"
                  />
                  <div>
                    <strong>{r.label}</strong>
                    <span>{r.email}</span>
                  </div>
                </div>
                <div className="friend-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={actingId === r.friendshipId}
                    onClick={() => void act(r.friendshipId, "accept")}
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={actingId === r.friendshipId}
                    onClick={() => void act(r.friendshipId, "decline")}
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="community-card">
          <h2>En attente</h2>
          <ul className="friend-list">
            {outgoing.map((r) => (
              <li key={r.friendshipId}>
                <div className="friend-list-main">
                  <UserAvatar
                    name={r.name}
                    email={r.email}
                    image={r.image}
                    className="friend-list-avatar"
                  />
                  <div>
                    <strong>{r.label}</strong>
                    <span>Demande envoyée</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={actingId === r.friendshipId}
                  onClick={() => void act(r.friendshipId, "remove")}
                >
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="community-card">
        <h2>Mes amis ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="quest-empty">
            Pas encore d&apos;amis — invite quelqu&apos;un !
          </p>
        ) : (
          <ul className="friend-grid">
            {friends.map((r) => (
              <li key={r.friendshipId}>
                <Link href={`/community/${r.id}`} className="friend-card">
                  <UserAvatar
                    name={r.name}
                    email={r.email}
                    image={r.image}
                    className="friend-card-avatar"
                  />
                  <strong>{r.label}</strong>
                  <span>
                    {r.done} figures · {r.xp} XP
                  </span>
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost friend-card-remove"
                  disabled={actingId === r.friendshipId}
                  onClick={async () => {
                    const ok = await confirm({
                      title: "Retirer cet ami",
                      message: `Retirer ${r.label} de tes amis ?`,
                      confirmLabel: "Retirer",
                      danger: true,
                    });
                    if (ok) void act(r.friendshipId, "remove");
                  }}
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
