"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBytes, MAX_VIDEO_BYTES } from "@/lib/videos";
import { useConfirm } from "@/components/ui/confirm-dialog";

type AdminVideo = {
  id: string;
  url: string;
  storagePath: string;
  title: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  order: number;
};

type Props = {
  slug: string;
  initialVideos: AdminVideo[];
};

type UploadJob = {
  key: string;
  name: string;
  progress: number;
  error?: string;
};

export default function AdminFigureVideos({ slug, initialVideos }: Props) {
  const router = useRouter();
  const confirmDialog = useConfirm();
  const [videos, setVideos] = useState(initialVideos);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refreshFromServer() {
    const res = await fetch(`/api/admin/figures/${slug}/videos`);
    if (res.ok) {
      const data = (await res.json()) as AdminVideo[];
      setVideos(data);
    }
    router.refresh();
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");

    for (const file of Array.from(files)) {
      const key = `${file.name}-${file.size}-${Date.now()}`;
      setJobs((j) => [...j, { key, name: file.name, progress: 0 }]);

      try {
        if (!file.type.startsWith("video/")) {
          throw new Error("Fichier non vidéo");
        }
        if (file.size > MAX_VIDEO_BYTES) {
          throw new Error(`Max ${MAX_VIDEO_BYTES / (1024 * 1024)} Mo`);
        }

        const prep = await fetch(`/api/admin/figures/${slug}/videos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mimeType: file.type,
            sizeBytes: file.size,
            fileName: file.name,
          }),
        });
        const prepData = await prep.json().catch(() => ({}));
        if (!prep.ok) {
          throw new Error(prepData.error || "Préparation upload échouée");
        }

        setJobs((j) =>
          j.map((job) => (job.key === key ? { ...job, progress: 0.15 } : job))
        );

        // Upload direct vers Supabase signed URL (évite la limite body Vercel)
        const put = await fetch(prepData.upload.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!put.ok) {
          // Nettoyage best-effort de la row orpheline
          await fetch(`/api/admin/figures/${slug}/videos/${prepData.video.id}`, {
            method: "DELETE",
          }).catch(() => {});
          throw new Error(`Upload Storage échoué (${put.status})`);
        }

        setJobs((j) =>
          j.map((job) => (job.key === key ? { ...job, progress: 0.85 } : job))
        );

        const done = await fetch(
          `/api/admin/figures/${slug}/videos/${prepData.video.id}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sizeBytes: file.size,
              mimeType: file.type,
            }),
          }
        );
        if (!done.ok) {
          const d = await done.json().catch(() => ({}));
          throw new Error(d.error || "Confirmation upload échouée");
        }

        setJobs((j) =>
          j.map((job) => (job.key === key ? { ...job, progress: 1 } : job))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur upload";
        setJobs((j) =>
          j.map((job) => (job.key === key ? { ...job, error: message } : job))
        );
        setError(message);
      }
    }

    await refreshFromServer();
    setTimeout(() => {
      setJobs((j) => j.filter((job) => job.progress < 1 || job.error));
    }, 1200);
  }

  async function saveTitle(id: string, title: string) {
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/admin/figures/${slug}/videos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Impossible de renommer");
      return;
    }
    const updated = (await res.json()) as AdminVideo;
    setVideos((list) => list.map((v) => (v.id === id ? updated : v)));
  }

  async function remove(id: string) {
    const ok = await confirmDialog({
      title: "Supprimer cette vidéo",
      message: "Le fichier sera supprimé du Storage définitivement.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/admin/figures/${slug}/videos/${id}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Suppression impossible");
      return;
    }
    setVideos((list) => list.filter((v) => v.id !== id));
    router.refresh();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = videos.findIndex((v) => v.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= videos.length) return;

    const orderedIds = videos.map((v) => v.id);
    [orderedIds[idx], orderedIds[swap]] = [orderedIds[swap], orderedIds[idx]];
    setVideos((list) => {
      const next = [...list];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

    const res = await fetch(`/api/admin/figures/${slug}/videos/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Réordonnancement impossible");
      await refreshFromServer();
    }
  }

  return (
    <section className="admin-videos">
      <h2>Vidéos (Supabase Storage)</h2>
      <p className="community-lead">
        Plusieurs fichiers mp4 / webm / mov par figure — max{" "}
        {MAX_VIDEO_BYTES / (1024 * 1024)} Mo chacun. Upload admin uniquement.
      </p>

      <label className="admin-videos-upload">
        <span>Ajouter des vidéos</span>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          onChange={(e) => {
            void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {jobs.length > 0 && (
        <ul className="admin-videos-jobs">
          {jobs.map((job) => (
            <li key={job.key}>
              <span>{job.name}</span>
              {job.error ? (
                <span className="form-error">{job.error}</span>
              ) : (
                <span>{Math.round(job.progress * 100)}%</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="form-error">{error}</p>}

      {videos.length === 0 ? (
        <p className="empty-hint">Aucune vidéo pour l&apos;instant.</p>
      ) : (
        <ul className="admin-videos-list">
          {videos.map((v, i) => (
            <li key={v.id} className="admin-videos-item">
              <video
                className="admin-videos-thumb"
                src={v.url}
                controls
                playsInline
                preload="metadata"
              />
              <div className="admin-videos-fields">
                <input
                  type="text"
                  defaultValue={v.title || ""}
                  placeholder="Titre"
                  disabled={busyId === v.id}
                  onBlur={(e) => {
                    if ((v.title || "") !== e.target.value.trim()) {
                      void saveTitle(v.id, e.target.value);
                    }
                  }}
                />
                <p className="video-meta">
                  {formatBytes(v.sizeBytes)} · {v.mimeType || "video"}
                </p>
                <div className="admin-videos-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={i === 0}
                    onClick={() => void move(v.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={i === videos.length - 1}
                    onClick={() => void move(v.id, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busyId === v.id}
                    onClick={() => void remove(v.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
