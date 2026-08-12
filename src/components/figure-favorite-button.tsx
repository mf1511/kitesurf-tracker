"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

type Size = "sm" | "md";

/** Étoile favori — toggle API, optimistic UI */
export default function FigureFavoriteButton({
  figureId,
  initialFavorite,
  size = "md",
  showLabel = false,
}: {
  figureId: string;
  initialFavorite: boolean;
  size?: Size;
  showLabel?: boolean;
}) {
  const toast = useToast();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const prev = favorite;
    setFavorite(!prev);
    setBusy(true);
    try {
      const res = await fetch(`/api/figures/${figureId}/favorite`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      setFavorite(!!data.favorite);
      toast(
        data.favorite ? "Ajoutée aux favoris" : "Retirée des favoris",
        "success"
      );
    } catch {
      setFavorite(prev);
      toast("Impossible de mettre à jour le favori", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`figure-fav-btn ${size}${favorite ? " is-on" : ""}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg
        viewBox="0 0 24 24"
        width={size === "sm" ? 16 : 20}
        height={size === "sm" ? 16 : 20}
        aria-hidden
      >
        <path
          d="M12 3.6l2.4 5.4 5.8.6-4.4 3.9 1.3 5.7L12 16.2l-5.1 3 1.3-5.7-4.4-3.9 5.8-.6L12 3.6z"
          fill={favorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && (
        <span>{favorite ? "Favori" : "Favoris"}</span>
      )}
    </button>
  );
}
