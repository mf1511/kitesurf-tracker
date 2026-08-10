"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function GearDeleteButton({ gearId }: { gearId: string }) {
  const router = useRouter();
  const confirmDialog = useConfirm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    const ok = await confirmDialog({
      title: "Supprimer ce matériel",
      message: "Cette pièce et sa facture seront définitivement supprimées.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
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
