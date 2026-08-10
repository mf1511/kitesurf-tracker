"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

export type AdminPreInvite = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  code: string;
  path: string;
  createdAt: string;
  usedAt: string | null;
  usedBy: { id: string; name: string | null; email: string } | null;
};

/** Gestion admin des pré-invitations (email, nom, photo) */
export default function AdminPreInvites({
  initialInvites,
}: {
  initialInvites: AdminPreInvite[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setEmail("");
    setName("");
    setInvites((list) => [
      {
        ...data.invite,
        createdAt: new Date().toISOString(),
        usedAt: null,
        usedBy: null,
      },
      ...list,
    ]);
    toast("Invitation créée", "success");
    router.refresh();
  }

  async function copyLink(path: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      toast("Lien copié", "success");
    } catch {
      toast("Copie impossible", "error");
    }
  }

  async function uploadPhoto(id: string, file: File | null) {
    if (!file) return;
    const body = new FormData();
    body.append("avatar", file);
    const res = await fetch(`/api/admin/invites/${id}/avatar`, {
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Upload impossible", "error");
      return;
    }
    setInvites((list) =>
      list.map((i) =>
        i.id === id ? { ...i, image: data.invite.image ?? null } : i
      )
    );
    toast("Photo ajoutée", "success");
  }

  async function removeInvite(id: string) {
    const ok = await confirm({
      title: "Supprimer l’invitation",
      message: "Supprimer cette pré-invitation ?",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Suppression impossible", "error");
      return;
    }
    setInvites((list) => list.filter((i) => i.id !== id));
    toast("Invitation supprimée", "success");
    router.refresh();
  }

  return (
    <div className="admin-preinvites">
      <form onSubmit={createInvite} className="challenge-form admin-preinvite-form">
        <h3>Pré-inviter un ami</h3>
        <p className="community-lead">
          Crée un lien personnel lié à l’email. Tu peux ajouter une photo avant
          qu’il s’inscrive.
        </p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="pote@email.com"
          />
        </label>
        <label>
          Prénom / nom (optionnel)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Alex"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "…" : "Créer l’invitation"}
        </button>
      </form>

      {invites.length === 0 ? (
        <p className="quest-empty">Aucune pré-invitation pour l’instant.</p>
      ) : (
        <ul className="admin-preinvite-list">
          {invites.map((i) => (
            <li key={i.id} className={i.usedAt ? "is-used" : ""}>
              <div className="admin-preinvite-main">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="admin-preinvite-avatar" />
                ) : (
                  <span className="admin-preinvite-avatar placeholder" aria-hidden>
                    {(i.name || i.email)[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <div>
                  <strong>{i.name || i.email.split("@")[0]}</strong>
                  <span className="feed-meta">{i.email}</span>
                  <span className="feed-meta">
                    {i.usedAt
                      ? `Inscrit · ${i.usedBy?.email ?? ""}`
                      : `En attente · code ${i.code}`}
                  </span>
                </div>
              </div>
              <div className="trip-figure-actions">
                {!i.usedAt && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => void copyLink(i.path)}
                    >
                      Copier le lien
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => fileRefs.current[i.id]?.click()}
                    >
                      {i.image ? "Photo" : "+ Photo"}
                    </button>
                    <input
                      ref={(el) => {
                        fileRefs.current[i.id] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) =>
                        void uploadPhoto(i.id, e.target.files?.[0] ?? null)
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void removeInvite(i.id)}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
