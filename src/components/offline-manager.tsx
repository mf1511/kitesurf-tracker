"use client";

import { useEffect, useState } from "react";
import {
  clearAllOfflineVideos,
  estimateStorage,
  getOfflineObjectUrl,
  listOfflineMeta,
  removeOfflineVideo,
  type OfflineVideoMeta,
} from "@/lib/offline-videos";
import { formatBytes } from "@/lib/videos";
import { useConfirm } from "@/components/ui/confirm-dialog";
import VideoPlayer from "@/components/video-player";

export default function OfflineManager() {
  const confirmDialog = useConfirm();
  const [items, setItems] = useState<OfflineVideoMeta[]>([]);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(
    null
  );
  const [msg, setMsg] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playSrc, setPlaySrc] = useState<string | null>(null);

  function reload() {
    setItems(listOfflineMeta());
    void estimateStorage().then(setStorage);
  }

  useEffect(() => {
    reload();
  }, []);

  // Libère l’object URL à la fermeture / changement
  useEffect(() => {
    return () => {
      if (playSrc) URL.revokeObjectURL(playSrc);
    };
  }, [playSrc]);

  async function play(v: OfflineVideoMeta) {
    if (playingId === v.id) {
      if (playSrc) URL.revokeObjectURL(playSrc);
      setPlayingId(null);
      setPlaySrc(null);
      return;
    }
    const src = await getOfflineObjectUrl(v.id);
    if (!src) {
      setMsg("Vidéo introuvable dans le cache.");
      return;
    }
    if (playSrc) URL.revokeObjectURL(playSrc);
    setPlayingId(v.id);
    setPlaySrc(src);
  }

  async function removeOne(id: string) {
    if (playingId === id) {
      if (playSrc) URL.revokeObjectURL(playSrc);
      setPlayingId(null);
      setPlaySrc(null);
    }
    await removeOfflineVideo(id);
    setMsg("Vidéo retirée.");
    reload();
  }

  async function clearAll() {
    const ok = await confirmDialog({
      title: "Vider le cache vidéos",
      message: "Toutes les vidéos hors-ligne de cet appareil seront supprimées.",
      confirmLabel: "Tout supprimer",
      danger: true,
    });
    if (!ok) return;
    if (playSrc) URL.revokeObjectURL(playSrc);
    setPlayingId(null);
    setPlaySrc(null);
    await clearAllOfflineVideos();
    setMsg("Cache vidéos vidé.");
    reload();
  }

  const total = items.reduce((s, v) => s + (v.sizeBytes ?? 0), 0);

  return (
    <div className="offline-manager">
      {storage && (
        <p className="figures-lead">
          Stockage navigateur : {formatBytes(storage.usage)} utilisés
          {storage.quota > 0 ? ` / ${formatBytes(storage.quota)}` : ""}
        </p>
      )}
      <p className="figures-lead">
        {items.length} vidéo(s) locales · {formatBytes(total)}
      </p>

      <div className="offline-pack-bar">
        <button type="button" className="btn btn-ghost" onClick={() => void clearAll()}>
          Tout supprimer
        </button>
      </div>
      {msg && <p className="offline-msg">{msg}</p>}

      {items.length === 0 ? (
        <p className="empty-hint">
          Rien en cache. Télécharge depuis une figure, un séjour, ou le catalogue.
        </p>
      ) : (
        <ul className="offline-manager-list">
          {items.map((v) => (
            <li key={v.id}>
              <div>
                <strong>{v.title || "Vidéo"}</strong>
                <p className="video-meta">
                  {v.figureName || v.figureSlug || v.figureId} ·{" "}
                  {formatBytes(v.sizeBytes)}
                </p>
                {/* Lecture inline : pas de navigation (évite le crash SW Safari) */}
                {playingId === v.id && playSrc && (
                  <div className="offline-inline-player">
                    <VideoPlayer
                      src={playSrc}
                      title={v.title || v.figureName || "Vidéo"}
                    />
                  </div>
                )}
              </div>
              <div className="offline-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void play(v)}
                >
                  {playingId === v.id ? "Fermer" : "Lire"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void removeOne(v.id)}
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
