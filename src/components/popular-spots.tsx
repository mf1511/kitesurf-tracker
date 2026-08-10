"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { waterTypeLabel } from "@/lib/spot-names";

export type PopularSpotRow = {
  name: string;
  favoriteCount: number;
  sessionCount: number;
  waterType: string | null;
  windOrientation: string | null;
  mineId: string | null;
  isFavorite: boolean;
};

/** Top spots les plus mis en favori — ajout / favori en un clic */
export function PopularSpots({ spots }: { spots: PopularSpotRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function favorite(name: string) {
    setBusy(name);
    try {
      const res = await fetch("/api/spots/favorite-by-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      toast(`« ${data.spot.name} » est ton spot favori`, "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Impossible d’ajouter", "error");
    } finally {
      setBusy(null);
    }
  }

  if (spots.length === 0) return null;

  return (
    <section className="game-section">
      <h2>Spots populaires</h2>
      <p className="community-lead">
        Les spots les plus mis en favori — ajoute le tien en un clic.
      </p>
      <div className="trip-grid spot-grid">
        {spots.map((s) => (
          <article key={s.name} className="trip-card spot-card">
            <div className="spot-card-head">
              <strong>{s.name}</strong>
              {s.isFavorite ? (
                <span
                  className="spot-action-btn is-favorite"
                  aria-label="Spot favori"
                  title="Ton favori"
                >
                  ★
                </span>
              ) : (
                <button
                  type="button"
                  className="spot-action-btn"
                  disabled={busy === s.name}
                  onClick={() => void favorite(s.name)}
                  aria-label={`Ajouter ${s.name} en favori`}
                  title="Ajouter en favori"
                >
                  {busy === s.name ? "…" : "☆"}
                </button>
              )}
            </div>
            <span className="trip-meta">
              {[waterTypeLabel(s.waterType), s.windOrientation]
                .filter(Boolean)
                .join(" · ") || "—"}
            </span>
            <span className="trip-meta">
              {s.favoriteCount} favori{s.favoriteCount > 1 ? "s" : ""}
              {s.sessionCount > 0
                ? ` · ${s.sessionCount} session${s.sessionCount > 1 ? "s" : ""}`
                : ""}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
