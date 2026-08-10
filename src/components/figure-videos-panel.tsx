"use client";

import { useEffect, useState } from "react";
import {
  downloadManyOffline,
  downloadVideoOffline,
  getOfflineObjectUrl,
  isOfflineCached,
  removeOfflineVideo,
  type OfflineVideoMeta,
} from "@/lib/offline-videos";
import { formatBytes } from "@/lib/videos";

type FigureVideo = {
  id: string;
  url: string;
  storagePath: string;
  title: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  figureId: string;
  figureSlug: string;
  figureName: string;
};

type Props = {
  figureName: string;
  videos: FigureVideo[];
};

export default function FigureVideosPanel({ figureName, videos }: Props) {
  const [cached, setCached] = useState<Record<string, boolean>>({});
  const [srcMap, setSrcMap] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const v of videos) next[v.id] = isOfflineCached(v.id);
    setCached(next);

    let cancelled = false;
    const objectUrls: string[] = [];

    (async () => {
      const map: Record<string, string> = {};
      for (const v of videos) {
        if (!isOfflineCached(v.id)) continue;
        const obj = await getOfflineObjectUrl(v.id);
        if (obj) {
          objectUrls.push(obj);
          map[v.id] = obj;
        }
      }
      if (!cancelled) setSrcMap(map);
    })();

    return () => {
      cancelled = true;
      for (const u of objectUrls) URL.revokeObjectURL(u);
    };
  }, [videos]);

  function toMeta(v: FigureVideo): OfflineVideoMeta {
    return {
      id: v.id,
      url: v.url,
      storagePath: v.storagePath,
      title: v.title,
      figureId: v.figureId,
      figureSlug: v.figureSlug,
      figureName: v.figureName,
      sizeBytes: v.sizeBytes,
      mimeType: v.mimeType,
    };
  }

  async function downloadOne(v: FigureVideo) {
    setBusy(true);
    setMessage("");
    try {
      await downloadVideoOffline(toMeta(v), (r) =>
        setProgress((p) => ({ ...p, [v.id]: r }))
      );
      const obj = await getOfflineObjectUrl(v.id);
      setCached((c) => ({ ...c, [v.id]: true }));
      if (obj) setSrcMap((m) => ({ ...m, [v.id]: obj }));
      setMessage("Vidéo disponible hors-ligne.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Téléchargement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll() {
    setBusy(true);
    setMessage("");
    const { ok, failed } = await downloadManyOffline(
      videos.map(toMeta),
      (id, r) => setProgress((p) => ({ ...p, [id]: r }))
    );
    const map: Record<string, string> = { ...srcMap };
    const nextCached = { ...cached };
    for (const id of ok) {
      nextCached[id] = true;
      const obj = await getOfflineObjectUrl(id);
      if (obj) map[id] = obj;
    }
    setCached(nextCached);
    setSrcMap(map);
    setBusy(false);
    setMessage(
      failed.length
        ? `${ok.length} OK, ${failed.length} échec(s)`
        : `${ok.length} vidéo(s) hors-ligne`
    );
  }

  async function removeOne(id: string) {
    await removeOfflineVideo(id);
    setCached((c) => ({ ...c, [id]: false }));
    setSrcMap((m) => {
      const next = { ...m };
      if (next[id]) {
        URL.revokeObjectURL(next[id]);
        delete next[id];
      }
      return next;
    });
    setMessage("Retirée du hors-ligne.");
  }

  if (videos.length === 0) {
    return <p className="empty-hint">Aucune vidéo pour l&apos;instant.</p>;
  }

  const totalBytes = videos.reduce((s, v) => s + (v.sizeBytes ?? 0), 0);

  return (
    <div className="figure-videos-panel">
      <div className="offline-pack-bar">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy}
          onClick={() => void downloadAll()}
        >
          Télécharger la figure ({formatBytes(totalBytes)})
        </button>
        <a href="/offline" className="btn btn-ghost">
          Gérer hors-ligne
        </a>
      </div>
      {message && <p className="offline-msg">{message}</p>}

      <div className="video-list">
        {videos.map((v) => {
          const src = srcMap[v.id] || v.url;
          const pct = progress[v.id];
          return (
            <div key={v.id} className="video-item">
              <div className="video-embed video-player-wrap">
                <video
                  key={src}
                  src={src}
                  controls
                  playsInline
                  preload="metadata"
                  title={v.title || figureName}
                />
              </div>
              {v.title && <p className="video-title">{v.title}</p>}
              <p className="video-meta">
                {formatBytes(v.sizeBytes)}
                {cached[v.id] ? " · hors-ligne" : ""}
                {pct != null && pct < 1
                  ? ` · ${Math.round(pct * 100)}%`
                  : ""}
              </p>
              <div className="offline-actions">
                {cached[v.id] ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => void removeOne(v.id)}
                  >
                    Retirer hors-ligne
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => void downloadOne(v)}
                  >
                    Télécharger
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
