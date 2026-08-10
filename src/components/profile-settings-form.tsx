"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfileSettingsForm({
  initialName,
  initialWeightKg,
  email,
}: {
  initialName: string;
  initialWeightKg?: number | null;
  email: string;
}) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [weightKg, setWeightKg] = useState(
    initialWeightKg != null ? String(initialWeightKg) : ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOk("");

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, weightKg: weightKg.trim() === "" ? null : weightKg }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Erreur");
      return;
    }

    // Rafraîchit le JWT / session côté client
    await update({ name: data.user.name ?? "" });
    setBusy(false);
    setOk("Profil enregistré.");
  }

  return (
    <form onSubmit={submit} className="auth-form trip-form">
      <label>
        Email
        <input value={email} disabled readOnly />
      </label>
      <label>
        Nom d’affichage
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marin"
          maxLength={80}
        />
      </label>
      <label>
        Poids (kg) — pour la taille d’aile conseillée
        <input
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          placeholder="75"
          inputMode="decimal"
          type="number"
          min={20}
          max={200}
          step="0.5"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      {ok && <p className="form-ok">{ok}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
