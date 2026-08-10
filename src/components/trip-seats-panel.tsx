"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

export type TripSeatRow = {
  id: string;
  displayName: string;
  image: string | null;
  claimedById: string | null;
  order: number;
};

/** Membres sans place (trips anciens) — retirables par le créateur */
export type OrphanMember = {
  userId: string;
  label: string;
  image: string | null;
};

/** Gestion des places (prénom + photo) — créateur uniquement */
export default function TripSeatsPanel({
  tripId,
  meId,
  initialSeats,
  orphanMembers = [],
}: {
  tripId: string;
  meId: string;
  initialSeats: TripSeatRow[];
  orphanMembers?: OrphanMember[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [seats, setSeats] = useState(initialSeats);
  const [orphans, setOrphans] = useState(orphanMembers);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addSeat(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/trips/${tripId}/seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setName("");
    setSeats((list) => [...list, data.seat]);
    toast("Place ajoutée", "success");
    router.refresh();
  }

  async function uploadPhoto(seatId: string, file: File | null) {
    if (!file) return;
    const body = new FormData();
    body.append("avatar", file);
    const res = await fetch(`/api/trips/${tripId}/seats/${seatId}/avatar`, {
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Upload impossible", "error");
      return;
    }
    setSeats((list) =>
      list.map((s) => (s.id === seatId ? { ...s, image: data.seat.image } : s))
    );
    toast("Photo ajoutée", "success");
  }

  async function renameSeat(seat: TripSeatRow) {
    // Place claimée par un autre : API refuse aussi
    if (seat.claimedById && seat.claimedById !== meId) return;
    const next = window.prompt("Prénom", seat.displayName)?.trim();
    if (!next || next === seat.displayName) return;
    const res = await fetch(`/api/trips/${tripId}/seats/${seat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: next }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Impossible de renommer", "error");
      return;
    }
    setSeats((list) =>
      list.map((s) => (s.id === seat.id ? { ...s, displayName: next } : s))
    );
    toast("Prénom mis à jour", "success");
  }

  async function removeSeat(seat: TripSeatRow) {
    if (seat.claimedById) return;
    const ok = await confirm({
      title: "Supprimer la place",
      message: `Retirer ${seat.displayName} de la liste d’invitation ?`,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/trips/${tripId}/seats/${seat.id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Suppression impossible", "error");
      return;
    }
    setSeats((list) => list.filter((s) => s.id !== seat.id));
    toast("Place supprimée", "success");
    router.refresh();
  }

  /** Créateur : retire un rider déjà sur le séjour */
  async function kickUser(userId: string, label: string, seatId?: string) {
    if (userId === meId) return;
    const ok = await confirm({
      title: "Retirer du séjour",
      message: `Retirer ${label} du séjour ? Il perdra ses objectifs sur ce trip.`,
      confirmLabel: "Retirer",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/trips/${tripId}/members/${userId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Impossible de retirer", "error");
      return;
    }
    if (seatId) {
      setSeats((list) =>
        list.map((s) =>
          s.id === seatId ? { ...s, claimedById: null } : s
        )
      );
    } else {
      setOrphans((list) => list.filter((m) => m.userId !== userId));
    }
    toast(`${label} retiré du séjour`, "success");
    router.refresh();
  }

  return (
    <section className="community-card">
      <h2>Participants invités</h2>
      <p className="community-lead">
        Ajoute prénom + photo. Sur le lien d’invitation, chacun choisit qui il
        est.
      </p>

      <ul className="trip-seats-manage">
        {seats.map((s) => {
          const taken = !!s.claimedById;
          const isMe = s.claimedById === meId;
          return (
            <li key={s.id} className={taken ? "is-claimed" : ""}>
              {s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt="" className="trip-seat-avatar" />
              ) : (
                <span className="trip-seat-avatar placeholder" aria-hidden>
                  {s.displayName[0]?.toUpperCase() ?? "?"}
                </span>
              )}
              <div className="trip-seat-meta">
                <strong>{s.displayName}</strong>
                <span className="feed-meta">
                  {isMe ? "Toi (créateur)" : taken ? "Déjà pris" : "En attente"}
                </span>
              </div>
              <div className="trip-figure-actions">
                {(!taken || isMe) && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void renameSeat(s)}
                    >
                      Renommer
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => fileRefs.current[s.id]?.click()}
                    >
                      {s.image ? "Photo" : "+ Photo"}
                    </button>
                  </>
                )}
                <input
                  ref={(el) => {
                    fileRefs.current[s.id] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) =>
                    void uploadPhoto(s.id, e.target.files?.[0] ?? null)
                  }
                />
                {taken && !isMe && s.claimedById && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      void kickUser(s.claimedById!, s.displayName, s.id)
                    }
                  >
                    Retirer
                  </button>
                )}
                {!taken && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => void removeSeat(s)}
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {orphans.length > 0 && (
        <ul className="trip-seats-manage">
          {orphans.map((m) => (
            <li key={m.userId} className="is-claimed">
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image} alt="" className="trip-seat-avatar" />
              ) : (
                <span className="trip-seat-avatar placeholder" aria-hidden>
                  {m.label[0]?.toUpperCase() ?? "?"}
                </span>
              )}
              <div className="trip-seat-meta">
                <strong>{m.label}</strong>
                <span className="feed-meta">Sur le séjour</span>
              </div>
              <div className="trip-figure-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void kickUser(m.userId, m.label)}
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addSeat} className="challenge-form" style={{ borderTop: "none", paddingTop: 12 }}>
        <label>
          Prénom
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            required
            maxLength={80}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>
          {busy ? "…" : "Ajouter une place"}
        </button>
      </form>
    </section>
  );
}
