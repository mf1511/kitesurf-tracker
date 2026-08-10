"use client";

import { useEffect, useRef, useState } from "react";
import {
  downloadManyOffline,
  type OfflineVideoMeta,
} from "@/lib/offline-videos";
import { formatBytes } from "@/lib/videos";
import { useToast } from "@/components/ui/toast";

type PackStats = {
  videos: OfflineVideoMeta[];
  totalBytes: number;
  count: number;
};

type Scope = "trip" | "objectives";

/** Icône téléchargement header séjour → choix pack hors-ligne */
export default function TripOfflineDialog({ tripId }: { tripId: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<Scope | null>(null);
  const [tripPack, setTripPack] = useState<PackStats | null>(null);
  const [objPack, setObjPack] = useState<PackStats | null>(null);
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy]);

  // Charge les 2 catalogues à l’ouverture (compte + taille)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const [tripRes, objRes] = await Promise.all([
          fetch(`/api/videos/catalog?tripId=${encodeURIComponent(tripId)}&scope=trip`),
          fetch(
            `/api/videos/catalog?tripId=${encodeURIComponent(tripId)}&scope=objectives`
          ),
        ]);
        if (!tripRes.ok || !objRes.ok) throw new Error("Catalogue indisponible");
        const trip = (await tripRes.json()) as PackStats;
        const obj = (await objRes.json()) as PackStats;
        if (cancelled) return;
        setTripPack(trip);
        setObjPack(obj);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur");
          setTripPack(null);
          setObjPack(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, tripId]);

  async function download(scope: Scope) {
    const pack = scope === "trip" ? tripPack : objPack;
    if (!pack?.videos.length) {
      toast(
        scope === "objectives"
          ? "Aucun objectif avec vidéo pour l’instant."
          : "Aucune vidéo sur la liste du séjour.",
        "info"
      );
      return;
    }
    setBusy(scope);
    try {
      const { ok, failed } = await downloadManyOffline(pack.videos);
      if (failed.length) {
        toast(`${ok.length} OK, ${failed.length} échec(s)`, "error");
      } else {
        toast(`${ok.length} vidéo(s) hors-ligne`, "success");
        setOpen(false);
      }
    } catch {
      toast("Téléchargement impossible.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn-icon"
        onClick={() => setOpen(true)}
        aria-label="Télécharger hors-ligne"
        title="Télécharger hors-ligne"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="confirm-overlay" onClick={() => !busy && setOpen(false)}>
          <div
            className="confirm-dialog invite-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-offline-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invite-dialog-head">
              <h2 id="trip-offline-title">Télécharger hors-ligne</h2>
              <button
                ref={closeRef}
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
                disabled={!!busy}
                aria-label="Fermer"
              >
                Fermer
              </button>
            </div>

            <p className="community-lead">
              Pour le spot sans 4G — choisis ce que tu veux garder sur l’appareil.
            </p>

            {loading && <p className="offline-msg">Calcul des tailles…</p>}
            {error && <p className="form-error">{error}</p>}

            {!loading && !error && (
              <div className="trip-offline-choices">
                <button
                  type="button"
                  className="trip-offline-choice"
                  disabled={!!busy || !(tripPack?.count)}
                  onClick={() => void download("trip")}
                >
                  <strong>Toutes les figures du séjour</strong>
                  <span>
                    {tripPack?.count ?? 0} vidéo
                    {(tripPack?.count ?? 0) > 1 ? "s" : ""} ·{" "}
                    {formatBytes(tripPack?.totalBytes ?? 0)}
                  </span>
                  <em>{busy === "trip" ? "Téléchargement…" : "Télécharger"}</em>
                </button>

                <button
                  type="button"
                  className="trip-offline-choice"
                  disabled={!!busy || !(objPack?.count)}
                  onClick={() => void download("objectives")}
                >
                  <strong>Mes objectifs seulement</strong>
                  <span>
                    {objPack?.count ?? 0} vidéo
                    {(objPack?.count ?? 0) > 1 ? "s" : ""} ·{" "}
                    {formatBytes(objPack?.totalBytes ?? 0)}
                  </span>
                  <em>
                    {busy === "objectives" ? "Téléchargement…" : "Télécharger"}
                  </em>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
