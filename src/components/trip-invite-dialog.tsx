"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import UserAvatar from "@/components/user-avatar";

export type TripInviteFriend = {
  id: string;
  label: string;
  name: string | null;
  email: string;
  image: string | null;
  /** Déjà membre du séjour */
  onTrip: boolean;
};

/** Bouton header + dialog : amis, invite prénom/email/photo, lien */
export default function TripInviteDialog({
  tripId,
  code,
  friends,
}: {
  tripId: string;
  code: string;
  friends: TripInviteFriend[];
}) {
  const toast = useToast();
  const router = useRouter();
  const path = `/trips/join/${code}`;
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Formulaire place (prénom + email + photo)
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const available = friends.filter((f) => !f.onTrip && !addedIds.includes(f.id));
  const alreadyOnTrip = friends.filter((f) => f.onTrip);
  const hasFriends = friends.length > 0;

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Copie impossible — sélectionne le lien manuellement.", "error");
    }
  }

  async function addFriend(friend: TripInviteFriend) {
    setBusyId(friend.id);
    const res = await fetch(`/api/trips/${tripId}/invite-friends`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: friend.id }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      toast(data.error || "Impossible d’ajouter", "error");
      return;
    }
    setAddedIds((ids) => [...ids, friend.id]);
    toast(`${data.label || friend.label} ajouté au séjour`, "success");
    router.refresh();
  }

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormBusy(true);

    const res = await fetch(`/api/trips/${tripId}/seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        email: email.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(data.error || "Impossible d’ajouter");
      setFormBusy(false);
      return;
    }

    const seatId = data.seat?.id as string | undefined;
    if (seatId && photo) {
      const body = new FormData();
      body.append("avatar", photo);
      const up = await fetch(`/api/trips/${tripId}/seats/${seatId}/avatar`, {
        method: "POST",
        body,
      });
      if (!up.ok) {
        const err = await up.json().catch(() => ({}));
        toast(err.error || "Place créée, photo non uploadée", "error");
      }
    }

    setDisplayName("");
    setEmail("");
    setPhoto(null);
    if (photoRef.current) photoRef.current.value = "";
    setFormBusy(false);
    toast(`Place « ${data.seat.displayName} » ajoutée`, "success");
    router.refresh();
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        Inviter le crew
      </button>

      {open && (
        <div className="confirm-overlay" onClick={() => setOpen(false)}>
          <div
            className="confirm-dialog invite-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-invite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invite-dialog-head">
              <h2 id="trip-invite-title">Inviter le crew</h2>
              <button
                ref={closeRef}
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                Fermer
              </button>
            </div>

            <section className="invite-dialog-block">
              <h3>Amis sur KiteQuest</h3>
              <p className="community-lead">
                Ajoute un pote déjà inscrit — il rejoint le séjour tout de suite.
              </p>
              {!hasFriends ? (
                <p className="quest-empty">
                  Pas encore d’amis — invite-les depuis Amis, ou crée une place
                  ci-dessous.
                </p>
              ) : available.length === 0 ? (
                <p className="quest-empty">
                  Tous tes amis sont déjà sur ce séjour.
                </p>
              ) : (
                <ul className="friend-list trip-invite-friends">
                  {available.map((f) => (
                    <li key={f.id}>
                      <UserAvatar
                        name={f.name}
                        email={f.email}
                        image={f.image}
                        className="trip-seat-avatar"
                      />
                      <div className="trip-seat-meta">
                        <strong>{f.label}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busyId === f.id}
                        onClick={() => void addFriend(f)}
                      >
                        {busyId === f.id ? "…" : "Ajouter"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {alreadyOnTrip.length > 0 && (
                <p className="feed-meta" style={{ marginTop: 10 }}>
                  Déjà sur le séjour :{" "}
                  {alreadyOnTrip.map((f) => f.label).join(", ")}
                </p>
              )}
            </section>

            <section className="invite-dialog-block">
              <h3>Ajouter une place</h3>
              <p className="community-lead">
                Prénom, email et photo — la personne choisit sa place via le lien.
              </p>
              <form onSubmit={addGuest} className="trip-invite-guest-form">
                <label>
                  <span>Prénom</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex"
                    required
                    maxLength={80}
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>
                    Email <em className="field-optional">optionnel</em>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@email.com"
                    autoComplete="off"
                  />
                </label>
                <div className="trip-invite-photo">
                  <span className="trip-invite-photo-label">
                    Photo <em className="field-optional">optionnel</em>
                  </span>
                  <div className="trip-invite-photo-row">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => photoRef.current?.click()}
                    >
                      {photo ? "Changer" : "Choisir une photo"}
                    </button>
                    <span className="feed-meta">
                      {photo ? photo.name : "JPEG, PNG ou WebP"}
                    </span>
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formBusy || !displayName.trim()}
                >
                  {formBusy ? "…" : "Ajouter la place"}
                </button>
              </form>
            </section>

            <section className="invite-dialog-block">
              <h3>Lien d&apos;invitation</h3>
              <p className="community-lead">
                Partage ce lien — ils voient le séjour et choisissent qui ils sont.
              </p>
              <div className="invite-link-row">
                <code className="invite-code">{url}</code>
                <button type="button" className="btn btn-primary" onClick={copy}>
                  {copied ? "Copié !" : "Copier"}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
