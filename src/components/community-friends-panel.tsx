"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Rider = {
  friendshipId: string;
  id: string;
  name: string | null;
  email: string;
  label: string;
};

/** Demandes d'amis + ajout par email + liste */
export default function CommunityFriendsPanel({
  friends,
  incoming,
  outgoing,
}: {
  friends: Rider[];
  incoming: Rider[];
  outgoing: Rider[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  /** friendshipId en cours d'action (disabled ciblé) */
  const [actingId, setActingId] = useState<string | null>(null);

  async function refresh() {
    router.refresh();
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setOk(data.autoAccepted ? "Vous êtes maintenant amis !" : "Demande envoyée");
    setEmail("");
    refresh();
  }

  async function act(friendshipId: string, action: "accept" | "decline" | "remove") {
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
      refresh();
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
      <div className="community-card">
        <h2>Ajouter par email</h2>
        <p className="community-lead">
          S&apos;il a déjà un compte, envoie une demande. Sinon, utilise ton lien d&apos;invitation.
        </p>
        <form onSubmit={sendRequest} className="friend-email-form">
          <input
            type="email"
            placeholder="ami@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "…" : "Inviter"}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
        {ok && <p className="form-ok">{ok}</p>}
      </div>

      {incoming.length > 0 && (
        <div className="community-card">
          <h2>Demandes reçues</h2>
          <ul className="friend-list">
            {incoming.map((r) => (
              <li key={r.friendshipId}>
                <div>
                  <strong>{r.label}</strong>
                  <span>{r.email}</span>
                </div>
                <div className="friend-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={actingId === r.friendshipId}
                    onClick={() => act(r.friendshipId, "accept")}
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={actingId === r.friendshipId}
                    onClick={() => act(r.friendshipId, "decline")}
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="community-card">
          <h2>En attente</h2>
          <ul className="friend-list">
            {outgoing.map((r) => (
              <li key={r.friendshipId}>
                <div>
                  <strong>{r.label}</strong>
                  <span>Demande envoyée</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={actingId === r.friendshipId}
                  onClick={() => act(r.friendshipId, "remove")}
                >
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="community-card">
        <h2>Mes amis ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="quest-empty">Pas encore d&apos;amis — partage ton lien !</p>
        ) : (
          <ul className="friend-list">
            {friends.map((r) => (
              <li key={r.friendshipId}>
                <div>
                  <strong>{r.label}</strong>
                  <span>{r.email}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={actingId === r.friendshipId}
                  onClick={async () => {
                    const ok = await confirm({
                      title: "Retirer cet ami",
                      message: `Retirer ${r.label} de tes amis ?`,
                      confirmLabel: "Retirer",
                      danger: true,
                    });
                    if (ok) act(r.friendshipId, "remove");
                  }}
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
