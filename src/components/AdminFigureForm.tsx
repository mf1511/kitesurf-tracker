"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAdminFigureVideo } from "@/lib/admin-figure-video-upload";
import { stripModule, withModule } from "@/lib/category-sections";
import {
  resolveFigureSection,
  sectionsForCategory,
} from "@/lib/figure-sections";
import { VIDEO_COMPRESS_TARGET_BYTES } from "@/lib/videos";
import { useConfirm } from "@/components/ui/confirm-dialog";

type FigureOption = { id: string; slug: string; name: string; category: string };

export default function AdminFigureForm({
  mode,
  categories,
  allFigures,
  initial,
}: {
  mode: "create" | "edit";
  categories: string[];
  allFigures: FigureOption[];
  initial?: {
    slug: string;
    name: string;
    category: string;
    description: string;
    steps: string[];
    order: number;
    prerequisiteSlugs: string[];
  };
}) {
  const router = useRouter();
  const confirmDialog = useConfirm();
  const [slug, setSlug] = useState(initial?.slug || "");
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || categories[0] || "");
  const [section, setSection] = useState(() => {
    if (initial) {
      return (
        resolveFigureSection(
          initial.category,
          initial.description,
          initial.order,
          initial.slug,
          initial.name
        ) ?? ""
      );
    }
    return sectionsForCategory(categories[0] || "")[0] ?? "";
  });
  const [description, setDescription] = useState(initial?.description || "");
  const [stepsText, setStepsText] = useState((initial?.steps || []).join("\n"));
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [prereqs, setPrereqs] = useState<Set<string>>(new Set(initial?.prerequisiteSlugs || []));
  const [pendingVideos, setPendingVideos] = useState<File[]>([]);
  const [uploadHint, setUploadHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sectionOptions = useMemo(
    () => sectionsForCategory(category),
    [category]
  );

  function onCategoryChange(next: string) {
    setCategory(next);
    const nextSections = sectionsForCategory(next);
    if (!nextSections.includes(section)) setSection(nextSections[0] ?? "");
  }

  function togglePrereq(s: string) {
    setPrereqs((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      slug,
      name,
      category,
      description: section
        ? withModule(description, section)
        : stripModule(description),
      steps: stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
      order: Number(order) || 0,
      prerequisiteSlugs: Array.from(prereqs),
    };

    const url = mode === "create" ? "/api/admin/figures" : `/api/admin/figures/${initial?.slug}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement");
      return;
    }

    const created = (await res.json()) as { slug?: string };
    const figureSlug = created.slug || slug;
    if (mode === "create" && figureSlug && pendingVideos.length > 0) {
      try {
        for (const file of pendingVideos) {
          await uploadAdminFigureVideo(figureSlug, file, (p) => {
            setUploadHint(p.label);
          });
        }
      } catch (err) {
        setLoading(false);
        setError(
          err instanceof Error
            ? `Figure créée, mais vidéo : ${err.message}`
            : "Figure créée, upload vidéo échoué"
        );
        router.push(`/admin/figures/${figureSlug}/edit`);
        router.refresh();
        return;
      }
    }

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.slug) return;
    const ok = await confirmDialog({
      title: "Supprimer cette figure",
      message: `"${initial.name}" et sa progression associée seront définitivement supprimées.`,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/figures/${initial.slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de la suppression");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-grid">
        <label>
          Nom de la figure
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Slug (URL)
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-généré si vide (à la création)"
          />
        </label>
      </div>

      <div className="admin-grid">
        <label>
          Catégorie
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {sectionOptions.length > 0 ? (
          <label>
            Sous-catégorie
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="">Autres (sans sous-module)</option>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Ordre d&apos;affichage
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </label>
        )}
      </div>
      {sectionOptions.length > 0 ? (
        <label>
          Ordre d&apos;affichage
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </label>
      ) : null}

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
      </label>

      {mode === "create" ? (
        <label className="admin-videos-upload">
          <span>Vidéos (optionnel)</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(e) => {
              const next = e.target.files ? Array.from(e.target.files) : [];
              setPendingVideos(next);
            }}
          />
          <span className="feed-meta">
            mp4 / webm / mov — au-delà de{" "}
            {VIDEO_COMPRESS_TARGET_BYTES / (1024 * 1024)} Mo, compression auto
            {pendingVideos.length > 0
              ? ` · ${pendingVideos.length} fichier${pendingVideos.length > 1 ? "s" : ""}`
              : ""}
          </span>
        </label>
      ) : null}

      <label>
        Étapes (une par ligne)
        <textarea
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          rows={6}
          placeholder={"Étape 1\nÉtape 2\nÉtape 3"}
        />
      </label>

      <div className="admin-block">
        <p className="admin-label">Prérequis (figures à maîtriser avant)</p>
        <div className="prereq-checklist">
          {allFigures
            .filter((f) => f.slug !== initial?.slug)
            .map((f) => (
              <label key={f.id} className="prereq-check-item">
                <input
                  type="checkbox"
                  checked={prereqs.has(f.slug)}
                  onChange={() => togglePrereq(f.slug)}
                />
                <span>{f.name}</span>
                <span className="prereq-cat">{f.category}</span>
              </label>
            ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? mode === "create" && pendingVideos.length > 0
              ? uploadHint || "Création et upload..."
              : "Enregistrement..."
            : mode === "create"
              ? "Créer la figure"
              : "Enregistrer"}
        </button>
        {mode === "edit" && (
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Supprimer cette figure
          </button>
        )}
      </div>
    </form>
  );
}
