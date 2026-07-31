"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [slug, setSlug] = useState(initial?.slug || "");
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || categories[0] || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [stepsText, setStepsText] = useState((initial?.steps || []).join("\n"));
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [prereqs, setPrereqs] = useState<Set<string>>(new Set(initial?.prerequisiteSlugs || []));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      description,
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

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.slug) return;
    if (!confirm(`Supprimer définitivement "${initial.name}" ?`)) return;
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
          <input
            list="categories-list"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <datalist id="categories-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Ordre d&apos;affichage
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </label>
      </div>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
      </label>

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
          {loading ? "Enregistrement..." : mode === "create" ? "Créer la figure" : "Enregistrer"}
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
