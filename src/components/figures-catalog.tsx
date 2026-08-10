"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FigureCheckbox from "@/components/FigureCheckbox";

export type CatalogFigure = {
  id: string;
  slug: string;
  name: string;
  category: string;
  completed: boolean;
  locked: boolean;
  xp: number;
};

type SortId = "default" | "name" | "xp-asc" | "xp-desc";

const SORTS: { id: SortId; label: string }[] = [
  { id: "default", label: "Ordre conseillé" },
  { id: "name", label: "Nom A→Z" },
  { id: "xp-asc", label: "XP croissant" },
  { id: "xp-desc", label: "XP décroissant" },
];

/** Minuscules sans accents pour la recherche */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Catalogue figures : recherche instantanée, filtres catégorie/acquises, tri */
export function FiguresCatalog({
  figures,
  categories,
  initialCategory,
}: {
  figures: CatalogFigure[];
  categories: string[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "");
  const [hideDone, setHideDone] = useState(false);
  const [sort, setSort] = useState<SortId>("default");

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    let list = figures;
    if (category) list = list.filter((f) => f.category === category);
    if (hideDone) list = list.filter((f) => !f.completed);
    if (q) list = list.filter((f) => normalize(f.name).includes(q));

    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (sort === "xp-asc") list = [...list].sort((a, b) => a.xp - b.xp);
    if (sort === "xp-desc") list = [...list].sort((a, b) => b.xp - a.xp);
    return list;
  }, [figures, query, category, hideDone, sort]);

  // Regroupement par catégorie seulement en ordre conseillé (sinon liste plate triée)
  const grouped = sort === "default";
  const visibleCategories = grouped
    ? categories.filter((c) => visible.some((f) => f.category === c))
    : [];

  const renderCard = (f: CatalogFigure) => {
    const state = f.completed ? "done" : f.locked ? "locked" : "open";
    return (
      <div key={f.id} className={`figure-card ${state}`}>
        <span className={`status-dot ${state}`} aria-hidden />
        <FigureCheckbox
          figureId={f.id}
          initialCompleted={f.completed}
          locked={f.locked && !f.completed}
          size="sm"
          xpReward={f.xp}
        />
        <Link href={`/figures/${f.slug}`} className="figure-card-name">
          {f.name}
        </Link>
        <span className="xp-pill">+{f.xp} XP</span>
      </div>
    );
  };

  return (
    <>
      {/* Barre recherche + tri */}
      <div className="figures-toolbar">
        <input
          type="search"
          className="figures-search"
          placeholder="Rechercher une figure… (backroll, kiteloop…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher une figure"
        />
        <select
          className="figures-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortId)}
          aria-label="Trier les figures"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="category-filters">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={!category ? "active" : ""}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setCategory(cat === category ? "" : cat)}
            className={category === cat ? "active" : ""}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="figure-done-filter">
        <button
          type="button"
          onClick={() => setHideDone(false)}
          className={!hideDone ? "active" : ""}
        >
          Toutes
        </button>
        <button
          type="button"
          onClick={() => setHideDone(true)}
          className={hideDone ? "active" : ""}
        >
          Masquer les validées
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="quest-empty">
          {query
            ? `Aucune figure ne correspond à « ${query} ».`
            : hideDone
            ? "Plus rien à afficher — tu as tout validé dans ce filtre."
            : "Aucune figure dans cette catégorie."}
        </p>
      ) : grouped ? (
        visibleCategories.map((cat) => (
          <section key={cat} className="figure-section">
            <h2>{cat}</h2>
            <div className="figure-grid">
              {visible.filter((f) => f.category === cat).map(renderCard)}
            </div>
          </section>
        ))
      ) : (
        <section className="figure-section">
          <div className="figure-grid">{visible.map(renderCard)}</div>
        </section>
      )}
    </>
  );
}
