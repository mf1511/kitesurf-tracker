"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

/** Carnet de progression perso sur une figure (note libre, enregistrée à la demande) */
export function FigureNotePanel({
  figureId,
  initialContent,
  initialUpdatedAt,
}: {
  figureId: string;
  initialContent: string;
  initialUpdatedAt: string | null;
}) {
  const toast = useToast();
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [busy, setBusy] = useState(false);

  const dirty = content.trim() !== savedContent.trim();

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/figures/${figureId}/note`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      setSavedContent(content);
      setUpdatedAt(data.note?.updatedAt ?? null);
      toast(content.trim() ? "Note enregistrée 📝" : "Note supprimée", "success");
    } catch {
      toast("Impossible d'enregistrer la note", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="figure-note-panel">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ton carnet : sensations, ce qui bloque, ce qui a marché… (« presque passé samedi, penser à garder l'aile plus haute »)"
        rows={4}
        maxLength={4000}
        aria-label="Note personnelle sur cette figure"
      />
      <div className="figure-note-footer">
        <span className="figure-note-meta">
          {updatedAt && !dirty
            ? `Enregistrée le ${new Date(updatedAt).toLocaleDateString("fr-FR")}`
            : dirty
            ? "Modifications non enregistrées"
            : "Visible uniquement par toi"}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={save}
          disabled={busy || !dirty}
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
