"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import UserAvatar from "@/components/user-avatar";

export default function ProfileSettingsForm({
  initialName,
  initialWeightKg,
  initialImage,
  email,
}: {
  initialName: string;
  initialWeightKg?: number | null;
  initialImage?: string | null;
  email: string;
}) {
  const { update } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [weightKg, setWeightKg] = useState(
    initialWeightKg != null ? String(initialWeightKg) : ""
  );
  const [image, setImage] = useState<string | null>(initialImage ?? null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOk("");

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, weightKg: weightKg.trim() === "" ? null : weightKg }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Erreur");
      return;
    }

    await update({ name: data.user.name ?? "" });
    setBusy(false);
    setOk("Profil enregistré.");
  }

  async function onPickPhoto(file: File | null) {
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    setOk("");
    const body = new FormData();
    body.append("avatar", file);
    const res = await fetch("/api/account/avatar", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setPhotoBusy(false);
    if (!res.ok) {
      setError(data.error || "Upload impossible");
      return;
    }
    setImage(data.user.image ?? null);
    await update({ image: data.user.image ?? null });
    setOk("Photo mise à jour.");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removePhoto() {
    setPhotoBusy(true);
    setError("");
    setOk("");
    const res = await fetch("/api/account/avatar", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setPhotoBusy(false);
    if (!res.ok) {
      setError(data.error || "Suppression impossible");
      return;
    }
    setImage(null);
    await update({ image: null });
    setOk("Photo retirée.");
  }

  return (
    <form onSubmit={submit} className="auth-form trip-form">
      <div className="profile-photo-row">
        <UserAvatar name={name} email={email} image={image} className="profile-avatar" />
        <div className="profile-photo-actions">
          <p className="community-lead" style={{ margin: 0 }}>
            Photo de profil (JPEG, PNG ou WebP · max 2 Mo)
          </p>
          <div className="trip-figure-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={photoBusy}
              onClick={() => fileRef.current?.click()}
            >
              {photoBusy ? "…" : image ? "Changer la photo" : "Ajouter une photo"}
            </button>
            {image && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={photoBusy}
                onClick={() => void removePhoto()}
              >
                Retirer
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => void onPickPhoto(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <label>
        Email
        <input value={email} disabled readOnly />
      </label>
      <label>
        Nom d’affichage
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marin"
          maxLength={80}
        />
      </label>
      <label>
        Poids (kg) — pour la taille d’aile conseillée
        <input
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          placeholder="75"
          inputMode="decimal"
          type="number"
          min={20}
          max={200}
          step="0.5"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      {ok && <p className="form-ok">{ok}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
