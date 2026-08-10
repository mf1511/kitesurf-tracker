"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TripOpt = { id: string; name: string; already: boolean };

/** Depuis une page figure : ajouter à un de mes séjours */
export default function AddFigureToTrip({
  figureId,
  trips,
}: {
  figureId: string;
  trips: TripOpt[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tripId, setTripId] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  if (trips.length === 0) {
    return (
      <p className="feed-meta">
        Aucun séjour — <a href="/trips/new">crée-en un</a> pour y ajouter cette figure.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId) {
      setError("Choisis un séjour");
      return;
    }
    setBusy(true);
    setError("");
    setOk("");
    const res = await fetch(`/api/trips/${tripId}/figures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figureId }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setOk("Ajoutée au séjour");
    setOpen(false);
    setTripId("");
    router.refresh();
  }

  if (!open) {
    return (
      <div className="add-to-trip">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setOpen(true);
            setOk("");
            setError("");
          }}
        >
          Ajouter à un séjour
        </button>
        {ok && <span className="feed-meta">{ok}</span>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="add-to-trip-form">
      <label>
        Séjour
        <select
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          required
          autoFocus
        >
          <option value="">— Choisir —</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id} disabled={t.already}>
              {t.name}
              {t.already ? " (déjà ajoutée)" : ""}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="trip-figure-actions">
        <button type="submit" className="btn btn-primary" disabled={busy || !tripId}>
          {busy ? "…" : "Ajouter"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
