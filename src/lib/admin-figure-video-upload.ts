import { compressVideoIfNeeded } from "@/lib/compress-video-if-needed";
import { MAX_VIDEO_BYTES } from "@/lib/videos";

export type VideoUploadProgress = {
  phase: "compress" | "upload";
  progress: number;
  label: string;
};

function putFile(
  url: string,
  file: File,
  onProgress?: (ratio: number) => void
): Promise<{ ok: boolean; status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () =>
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        text: xhr.responseText || "",
      });
    xhr.onerror = () => reject(new Error("Réseau : upload interrompu"));
    xhr.send(file);
  });
}

/** Upload admin : compress si > 100 Mo → signed URL → PUT Storage → complete */
export async function uploadAdminFigureVideo(
  slug: string,
  file: File,
  onProgress?: (p: VideoUploadProgress) => void
): Promise<void> {
  if (!file.type.startsWith("video/")) {
    throw new Error("Fichier non vidéo");
  }

  const ready = await compressVideoIfNeeded(file, (p) => {
    onProgress?.({
      phase: "compress",
      progress: p.progress,
      label:
        p.phase === "load"
          ? "Chargement du compresseur…"
          : "Compression…",
    });
  });

  if (ready.size > MAX_VIDEO_BYTES) {
    throw new Error(`Max ${MAX_VIDEO_BYTES / (1024 * 1024)} Mo`);
  }

  const prep = await fetch(`/api/admin/figures/${slug}/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mimeType: ready.type || "video/mp4",
      sizeBytes: ready.size,
      fileName: file.name,
    }),
  });
  const prepData = await prep.json().catch(() => ({}));
  if (!prep.ok) {
    throw new Error(prepData.error || "Préparation upload échouée");
  }

  onProgress?.({ phase: "upload", progress: 0, label: "Upload…" });
  const put = await putFile(prepData.upload.signedUrl, ready, (ratio) => {
    onProgress?.({ phase: "upload", progress: ratio, label: "Upload…" });
  });
  if (!put.ok) {
    let detail = "";
    try {
      const parsed = JSON.parse(put.text) as { message?: string; error?: string };
      detail = parsed.message || parsed.error || "";
    } catch {
      detail = put.text.slice(0, 180);
    }
    await fetch(`/api/admin/figures/${slug}/videos/${prepData.video.id}`, {
      method: "DELETE",
    }).catch(() => {});
    throw new Error(
      detail
        ? `Upload Storage échoué (${put.status}) : ${detail}`
        : `Upload Storage échoué (${put.status})`
    );
  }

  const done = await fetch(
    `/api/admin/figures/${slug}/videos/${prepData.video.id}/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sizeBytes: ready.size,
        mimeType: ready.type || "video/mp4",
      }),
    }
  );
  if (!done.ok) {
    const d = await done.json().catch(() => ({}));
    throw new Error(d.error || "Confirmation upload échouée");
  }
  onProgress?.({ phase: "upload", progress: 1, label: "Upload…" });
}
