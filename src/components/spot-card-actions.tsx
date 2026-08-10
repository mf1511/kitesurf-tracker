"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

/** Actions d'une carte spot : définir favori + supprimer */
export function SpotCardActions({
  spotId,
  spotName,
  favorite,
}: {
  spotId: string;
  spotName: string;
  favorite: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function makeFavorite() {
    setBusy(true);
    try {
      const res = await fetch(`/api/spots/${spotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "favorite" }),
      });
      if (!res.ok) throw new Error();
      toast(`« ${spotName} » est ton spot favori ⭐`, "success");
      router.refresh();
    } catch {
      toast("Impossible de changer le favori", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Supprimer ce spot ?",
      message: `« ${spotName} » sera supprimé. Tes sessions passées sont conservées.`,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/spots/${spotId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Spot supprimé", "success");
      router.refresh();
    } catch {
      toast("Impossible de supprimer le spot", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="spot-actions">
      {!favorite && (
        <button
          type="button"
          className="spot-action-btn"
          onClick={makeFavorite}
          disabled={busy}
          aria-label={`Définir ${spotName} comme spot favori`}
          title="Définir comme favori"
        >
          ★
        </button>
      )}
      <button
        type="button"
        className="spot-action-btn spot-action-danger"
        onClick={remove}
        disabled={busy}
        aria-label={`Supprimer le spot ${spotName}`}
        title="Supprimer"
      >
        ×
      </button>
    </span>
  );
}
