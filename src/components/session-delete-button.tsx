"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

/** Supprime une session du journal (avec confirmation) */
export function SessionDeleteButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const ok = await confirm({
      title: "Supprimer cette session ?",
      message: "Les compteurs de sorties du matériel lié seront mis à jour.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Session supprimée", "success");
      router.refresh();
    } catch {
      toast("Impossible de supprimer la session", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="spot-action-btn spot-action-danger"
      onClick={remove}
      disabled={busy}
      aria-label="Supprimer cette session"
      title="Supprimer"
    >
      ✕
    </button>
  );
}
