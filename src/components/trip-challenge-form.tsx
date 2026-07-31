"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Fig = { id: string; name: string; category: string };

export default function TripChallengeForm({
  tripId,
  figures,
}: {
  tripId: string;
  figures: Fig[];
}) {
  const router = useRouter();
  const [figureId, setFigureId] = useState("");
  const [query, setQuery] = useState("");
  const [xpBonus, setXpBonus] = useState(25);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return figures.slice(0, 40);
    return figures.filter(
      (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [figures, query]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!figureId) {
      setError("Choisis une figure");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch(`/api/trips/${tripId}/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figureId, xpBonus }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setFigureId("");
    setQuery("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="challenge-form">
      <h3>Lancer un défi</h3>
      <p className="community-lead">
        Choisis une figure : dès qu’un membre la valide pendant le séjour, le défi
        est coché + bonus XP trip.
      </p>
      <label>
        Rechercher une figure
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ex: kiteloop, KGB, darkslide…"
        />
      </label>
      <label>
        Figure
        <select value={figureId} onChange={(e) => setFigureId(e.target.value)} required>
          <option value="">— Choisir —</option>
          {filtered.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.category})
            </option>
          ))}
        </select>
      </label>
      <label>
        Bonus XP séjour
        <input
          type="number"
          min={0}
          max={200}
          value={xpBonus}
          onChange={(e) => setXpBonus(Number(e.target.value))}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "…" : "Publier le défi"}
      </button>
    </form>
  );
}
