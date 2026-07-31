"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TripCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("Dakhla");
  const [location, setLocation] = useState("Dakhla, Maroc");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, description, startDate, endDate }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    router.push(`/trips/${data.trip.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="auth-form trip-form">
      <h1>Nouveau séjour</h1>
      <p className="community-lead">
        Ex. 12 jours à Dakhla. L’XP des figures validées entre ces dates compte
        automatiquement pour le leaderboard du trip.
      </p>
      <label>
        Nom du séjour
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Spot / lieu
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dakhla" />
      </label>
      <label>
        Date de début
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </label>
      <label>
        Date de fin
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </label>
      <label>
        Description (optionnel)
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Crew septembre, flat + lagune…"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Création…" : "Créer le séjour"}
      </button>
    </form>
  );
}
