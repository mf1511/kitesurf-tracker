"use client";

import { useState } from "react";
import {
  downloadManyOffline,
  type OfflineVideoMeta,
} from "@/lib/offline-videos";
import { formatBytes } from "@/lib/videos";

type Props = {
  /** Query catalog API: tripId | (aucun = catalogue actif) */
  tripId?: string;
  label: string;
  className?: string;
};

type CatalogResponse = {
  videos: OfflineVideoMeta[];
  totalBytes: number;
};

export default function OfflinePackButton({
  tripId,
  label,
  className = "btn btn-secondary",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    setBusy(true);
    setMsg("");
    try {
      const qs = tripId ? `?tripId=${encodeURIComponent(tripId)}` : "";
      const res = await fetch(`/api/videos/catalog${qs}`);
      const data = (await res.json()) as CatalogResponse;
      if (!res.ok) throw new Error("Catalogue indisponible");
      if (!data.videos.length) {
        setMsg("Aucune vidéo à télécharger.");
        return;
      }

      const sizeLabel = formatBytes(data.totalBytes);
      const okConfirm = confirm(
        `${label}\n${data.videos.length} vidéo(s) · ~${sizeLabel}\n\nContinuer ?`
      );
      if (!okConfirm) return;

      const { ok, failed } = await downloadManyOffline(data.videos);
      setMsg(
        failed.length
          ? `${ok.length} OK, ${failed.length} échec(s)`
          : `${ok.length} vidéo(s) hors-ligne`
      );
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur téléchargement");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="offline-pack-wrap">
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => void run()}
      >
        {busy ? "Téléchargement…" : label}
      </button>
      {msg && <p className="offline-msg">{msg}</p>}
    </div>
  );
}
