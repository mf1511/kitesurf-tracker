"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GearDeleteButton({ gearId }: { gearId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!confirm("Supprimer cette pièce de matériel ?")) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/gear/${gearId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    router.push("/materiel");
    router.refresh();
  }

  return (
    <div>
      <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
        {busy ? "Suppression…" : "Supprimer"}
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
