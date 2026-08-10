"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Boutons +/- pour le compteur de sorties */
export default function GearSessionControls({
  gearId,
  sessionCount,
}: {
  gearId: string;
  sessionCount: number;
}) {
  const router = useRouter();
  const [count, setCount] = useState(sessionCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function bump(delta: 1 | -1) {
    if (busy) return;
    if (delta === -1 && count <= 0) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/gear/${gearId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "session", delta }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setCount(data.gear.sessionCount);
    router.refresh();
  }

  return (
    <div className="gear-session-controls">
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => bump(-1)}
        disabled={busy || count <= 0}
        aria-label="Retirer une sortie"
      >
        −
      </button>
      <span className="gear-session-count">
        <strong>{count}</strong> sortie{count === 1 ? "" : "s"}
      </span>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => bump(1)}
        disabled={busy}
        aria-label="Ajouter une sortie"
      >
        + Sortie
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
