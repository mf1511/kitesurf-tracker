"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ChallengeView } from "@/lib/challenges";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

type FriendOption = { id: string; label: string };
type FigureOption = { id: string; name: string };

const STATE_LABEL: Record<ChallengeView["state"], { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "pending" },
  live: { label: "En cours", cls: "live" },
  won: { label: "Terminé", cls: "won" },
  expired: { label: "Expiré", cls: "expired" },
  declined: { label: "Refusé", cls: "declined" },
};

/** Date min pour la deadline : demain (YYYY-MM-DD) */
function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Défis entre amis : création + liste avec états dérivés */
export function ChallengesPanel({
  meId,
  challenges,
  friends,
  figures,
}: {
  meId: string;
  challenges: ChallengeView[];
  friends: FriendOption[];
  figures: FigureOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [opponentId, setOpponentId] = useState(friends[0]?.id ?? "");
  const [figureQuery, setFigureQuery] = useState("");
  const [deadline, setDeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Le datalist renvoie le nom exact — on retrouve l'id correspondant
  const figureByName = useMemo(
    () => new Map(figures.map((f) => [f.name.toLowerCase(), f.id])),
    [figures]
  );

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const figureId = figureByName.get(figureQuery.trim().toLowerCase());
    if (!figureId) {
      setError("Choisis une figure de la liste");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentId, figureId, deadline }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      setFigureQuery("");
      setDeadline("");
      toast("Défi lancé 🏁", "success");
      router.refresh();
    } catch {
      setError("Erreur réseau — réessaie");
    } finally {
      setBusy(false);
    }
  }

  async function respond(id: string, action: "accept" | "decline") {
    setActingId(id);
    try {
      const res = await fetch(`/api/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast(action === "accept" ? "Défi accepté — que le meilleur gagne 🤙" : "Défi refusé", "success");
      router.refresh();
    } catch {
      toast("Action impossible", "error");
    } finally {
      setActingId(null);
    }
  }

  async function remove(c: ChallengeView) {
    const ok = await confirm({
      title: "Supprimer ce défi ?",
      message: `Le défi « ${c.figure.name} » avec ${
        c.creator.id === meId ? c.opponent.label : c.creator.label
      } sera supprimé.`,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setActingId(c.id);
    try {
      const res = await fetch(`/api/challenges/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Défi supprimé", "success");
      router.refresh();
    } catch {
      toast("Suppression impossible", "error");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="community-card challenges-card">
      <h2>Défis</h2>
      <p className="community-lead">
        Premier à valider la figure avant la deadline — le vainqueur est détecté
        automatiquement.
      </p>

      {friends.length === 0 ? (
        <p className="quest-empty">Ajoute des amis pour lancer ton premier défi.</p>
      ) : (
        <form onSubmit={create} className="challenge-create-form">
          <label>
            Adversaire
            <select value={opponentId} onChange={(e) => setOpponentId(e.target.value)} required>
              {friends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Figure
            <input
              list="challenge-figures"
              value={figureQuery}
              onChange={(e) => setFigureQuery(e.target.value)}
              placeholder="Backroll, Kiteloop…"
              required
            />
            <datalist id="challenge-figures">
              {figures.map((f) => (
                <option key={f.id} value={f.name} />
              ))}
            </datalist>
          </label>
          <label>
            Deadline
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={tomorrowISO()}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Envoi…" : "🏁 Lancer le défi"}
          </button>
        </form>
      )}

      {challenges.length > 0 && (
        <ul className="challenge-list">
          {challenges.map((c) => {
            const meta = STATE_LABEL[c.state];
            const other = c.creator.id === meId ? c.opponent : c.creator;
            return (
              <li key={c.id} className={`challenge-item ${meta.cls}`}>
                <div className="challenge-item-main">
                  <span className={`trip-status-pill ${meta.cls === "live" ? "live" : "upcoming"}`}>
                    {meta.label}
                  </span>
                  <strong>
                    <Link href={`/figures/${c.figure.slug}`}>{c.figure.name}</Link>
                  </strong>
                  <span className="trip-meta">
                    {c.creator.id === meId ? `Toi vs ${other.label}` : `${other.label} vs toi`}
                    {" · "}avant le {new Date(c.deadline).toLocaleDateString("fr-FR")}
                  </span>
                  {c.state === "won" && c.winner && (
                    <span className="challenge-winner">
                      🏆 {c.winner.id === meId ? "Tu as gagné" : `${c.winner.label} a gagné`} le{" "}
                      {new Date(c.winner.at).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
                <div className="challenge-item-actions">
                  {c.awaitingMe && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => respond(c.id, "accept")}
                        disabled={actingId === c.id}
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => respond(c.id, "decline")}
                        disabled={actingId === c.id}
                      >
                        Refuser
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="spot-action-btn spot-action-danger"
                    onClick={() => remove(c)}
                    disabled={actingId === c.id}
                    aria-label={`Supprimer le défi ${c.figure.name}`}
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
