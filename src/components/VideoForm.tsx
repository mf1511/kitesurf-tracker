"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoForm({ slug }: { slug: string }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url.trim()) {
      setError("Merci d'indiquer un lien vidéo (YouTube, Vimeo...)");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/figures/${slug}/video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'ajout de la vidéo");
      return;
    }
    setUrl("");
    setTitle("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="video-form">
      <input
        type="text"
        placeholder="Lien de la vidéo (YouTube, Vimeo, Drive...)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <input
        type="text"
        placeholder="Titre (optionnel)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Ajout..." : "Ajouter la vidéo"}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
