/** Cache Storage dédié aux vidéos téléchargées pour hors-ligne */
export const OFFLINE_VIDEO_CACHE = "kitequest-offline-videos";

export type OfflineVideoMeta = {
  id: string;
  url: string;
  storagePath: string;
  title: string | null;
  figureId: string;
  figureSlug?: string;
  figureName?: string;
  sizeBytes?: number | null;
  mimeType?: string | null;
};

const META_KEY = "kitequest-offline-video-meta";

type MetaMap = Record<string, OfflineVideoMeta>;

function readMeta(): MetaMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as MetaMap) : {};
  } catch {
    return {};
  }
}

function writeMeta(map: MetaMap) {
  localStorage.setItem(META_KEY, JSON.stringify(map));
}

export function listOfflineMeta(): OfflineVideoMeta[] {
  return Object.values(readMeta());
}

export function isOfflineCached(videoId: string): boolean {
  return Boolean(readMeta()[videoId]);
}

export async function getOfflineObjectUrl(videoId: string): Promise<string | null> {
  if (typeof caches === "undefined") return null;
  const meta = readMeta()[videoId];
  if (!meta) return null;
  const cache = await caches.open(OFFLINE_VIDEO_CACHE);
  const res = await cache.match(meta.url);
  if (!res) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function downloadVideoOffline(
  video: OfflineVideoMeta,
  onProgress?: (ratio: number) => void
): Promise<void> {
  if (typeof caches === "undefined") {
    throw new Error("Cache Storage non disponible sur ce navigateur");
  }

  const res = await fetch(video.url);
  if (!res.ok) throw new Error(`Téléchargement échoué (${res.status})`);

  const total = Number(res.headers.get("content-length") || video.sizeBytes || 0);
  const reader = res.body?.getReader();
  if (!reader) {
    const blob = await res.blob();
    const cache = await caches.open(OFFLINE_VIDEO_CACHE);
    await cache.put(video.url, new Response(blob, { headers: res.headers }));
    const map = readMeta();
    map[video.id] = { ...video, sizeBytes: blob.size };
    writeMeta(map);
    onProgress?.(1);
    return;
  }

  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      if (total > 0) onProgress?.(Math.min(1, received / total));
    }
  }

  const blob = new Blob(chunks as BlobPart[], {
    type: video.mimeType || "video/mp4",
  });
  const cache = await caches.open(OFFLINE_VIDEO_CACHE);
  await cache.put(
    video.url,
    new Response(blob, {
      headers: {
        "Content-Type": video.mimeType || "video/mp4",
        "Content-Length": String(blob.size),
      },
    })
  );

  const map = readMeta();
  map[video.id] = { ...video, sizeBytes: blob.size };
  writeMeta(map);
  onProgress?.(1);
}

export async function downloadManyOffline(
  videos: OfflineVideoMeta[],
  onItem?: (videoId: string, ratio: number) => void
): Promise<{ ok: string[]; failed: string[] }> {
  const ok: string[] = [];
  const failed: string[] = [];
  for (const v of videos) {
    try {
      if (isOfflineCached(v.id)) {
        ok.push(v.id);
        onItem?.(v.id, 1);
        continue;
      }
      await downloadVideoOffline(v, (r) => onItem?.(v.id, r));
      ok.push(v.id);
    } catch (err) {
      console.error("[offline] download", v.id, err);
      failed.push(v.id);
    }
  }
  return { ok, failed };
}

export async function removeOfflineVideo(videoId: string): Promise<void> {
  const map = readMeta();
  const meta = map[videoId];
  if (!meta) return;
  if (typeof caches !== "undefined") {
    const cache = await caches.open(OFFLINE_VIDEO_CACHE);
    await cache.delete(meta.url);
  }
  delete map[videoId];
  writeMeta(map);
}

export async function clearAllOfflineVideos(): Promise<void> {
  if (typeof caches !== "undefined") {
    await caches.delete(OFFLINE_VIDEO_CACHE);
  }
  localStorage.removeItem(META_KEY);
}

export async function estimateStorage(): Promise<{
  usage: number;
  quota: number;
} | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return { usage, quota };
}
