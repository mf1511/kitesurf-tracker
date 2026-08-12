"use client";

import Link from "next/link";
import { useMemo, useRef, useEffect, useState } from "react";
import { sortCategories } from "@/lib/gamification";

export type AdminFigureRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  order: number;
  active: boolean;
  /** Suivi curation admin (interne) */
  adminDone: boolean;
  prerequisites: number;
  videos: number;
};

type ActiveFilter = "all" | "active" | "inactive";
type VideoFilter = "all" | "with" | "without";
type DoneFilter = "all" | "done" | "todo";

/** Minuscules sans accents pour la recherche */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Checkbox catégorie : tout / rien / partiel (indeterminate) */
function CategoryActiveToggle({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className="admin-active-toggle"
      title={
        checked
          ? "Toute la catégorie active — décocher pour désactiver"
          : "Activer toute la catégorie"
      }
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="sr-only">Activer la catégorie</span>
    </label>
  );
}

/** Liste admin : filtres actif/vidéo + groupes par catégorie */
export default function AdminFiguresPanel({
  initialFigures,
}: {
  initialFigures: AdminFigureRow[];
}) {
  const [figures, setFigures] = useState(initialFigures);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [videoFilter, setVideoFilter] = useState<VideoFilter>("all");
  const [doneFilter, setDoneFilter] = useState<DoneFilter>("all");
  /** Catégories repliées (défaut = toutes ouvertes) */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [busyCategory, setBusyCategory] = useState<string | null>(null);

  useEffect(() => {
    setFigures(initialFigures);
  }, [initialFigures]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return figures.filter((f) => {
      if (activeFilter === "active" && !f.active) return false;
      if (activeFilter === "inactive" && f.active) return false;
      if (videoFilter === "with" && f.videos < 1) return false;
      if (videoFilter === "without" && f.videos > 0) return false;
      if (doneFilter === "done" && !f.adminDone) return false;
      if (doneFilter === "todo" && f.adminDone) return false;
      if (
        q &&
        !normalize(f.name).includes(q) &&
        !normalize(f.slug).includes(q) &&
        !normalize(f.category).includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [figures, query, activeFilter, videoFilter, doneFilter]);

  const categories = useMemo(
    () => sortCategories(Array.from(new Set(filtered.map((f) => f.category)))),
    [filtered]
  );

  const grouped = useMemo(() => {
    return categories.map((cat) => ({
      category: cat,
      figures: filtered
        .filter((f) => f.category === cat)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")),
    }));
  }, [categories, filtered]);

  const activeCount = figures.filter((f) => f.active).length;
  const withVideo = figures.filter((f) => f.videos > 0).length;
  const doneCount = figures.filter((f) => f.adminDone).length;

  async function patchFigure(
    slug: string,
    patch: { active?: boolean; adminDone?: boolean }
  ) {
    setBusySlug(slug);
    const prev = figures;
    setFigures((list) =>
      list.map((f) => (f.slug === slug ? { ...f, ...patch } : f))
    );
    const res = await fetch(`/api/admin/figures/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusySlug(null);
    if (!res.ok) setFigures(prev);
  }

  async function setCategoryActive(category: string, next: boolean) {
    setBusyCategory(category);
    const prev = figures;
    setFigures((list) =>
      list.map((f) => (f.category === category ? { ...f, active: next } : f))
    );
    const res = await fetch("/api/admin/figures/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, active: next }),
    });
    setBusyCategory(null);
    if (!res.ok) setFigures(prev);
  }

  function toggleCategory(category: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  function collapseAll() {
    setCollapsed(new Set(categories));
  }

  return (
    <div className="admin-figures-panel">
      <p className="subtitle">
        {figures.length} figures · {activeCount} actives · {doneCount} done ·{" "}
        {withVideo} avec vidéo · {filtered.length} affichées
      </p>

      <div className="admin-filters" role="group" aria-label="Filtres">
        <label className="admin-search">
          Recherche
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, slug ou catégorie…"
            autoComplete="off"
          />
        </label>
        <label>
          Statut
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
          >
            <option value="all">Toutes</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </label>
        <label>
          Vidéo
          <select
            value={videoFilter}
            onChange={(e) => setVideoFilter(e.target.value as VideoFilter)}
          >
            <option value="all">Toutes</option>
            <option value="with">Avec vidéo</option>
            <option value="without">Sans vidéo</option>
          </select>
        </label>
        <label>
          Done
          <select
            value={doneFilter}
            onChange={(e) => setDoneFilter(e.target.value as DoneFilter)}
          >
            <option value="all">Toutes</option>
            <option value="todo">À faire</option>
            <option value="done">Done</option>
          </select>
        </label>
        {grouped.length > 0 && (
          <div className="admin-expand-actions">
            <button type="button" className="btn btn-ghost" onClick={expandAll}>
              Tout ouvrir
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={collapseAll}
            >
              Tout replier
            </button>
          </div>
        )}
      </div>

      {grouped.length === 0 ? (
        <p className="quest-empty">Aucune figure pour ces filtres.</p>
      ) : (
        grouped.map(({ category, figures: rows }) => {
          // État checkbox = toutes les figures de la catégorie (pas seulement filtrées)
          const allInCat = figures.filter((f) => f.category === category);
          const activeInCat = allInCat.filter((f) => f.active).length;
          const allOn = allInCat.length > 0 && activeInCat === allInCat.length;
          const someOn = activeInCat > 0 && !allOn;
          const isOpen = !collapsed.has(category);

          return (
            <section
              key={category}
              className={`admin-cat-block${isOpen ? "" : " is-collapsed"}`}
            >
              <header className="admin-cat-head">
                <CategoryActiveToggle
                  checked={allOn}
                  indeterminate={someOn}
                  disabled={busyCategory === category}
                  onChange={(next) => setCategoryActive(category, next)}
                />
                <button
                  type="button"
                  className="admin-cat-toggle"
                  aria-expanded={isOpen}
                  onClick={() => toggleCategory(category)}
                >
                  <span className="admin-cat-chevron" aria-hidden>
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="admin-cat-title">
                    {category}
                    <span className="admin-cat-meta">
                      {rows.length} affichée{rows.length > 1 ? "s" : ""}
                      {allInCat.length !== rows.length
                        ? ` / ${allInCat.length}`
                        : ""}
                      {" · "}
                      {activeInCat}/{allInCat.length} actives
                    </span>
                  </span>
                </button>
              </header>

              {isOpen && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Actif</th>
                        <th>Done</th>
                        <th>Nom</th>
                        <th>Prérequis</th>
                        <th>Vidéos</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((f) => (
                        <tr
                          key={f.id}
                          className={
                            f.adminDone
                              ? "admin-row-done"
                              : f.active
                              ? undefined
                              : "admin-row-inactive"
                          }
                        >
                          <td>
                            <label
                              className="admin-active-toggle"
                              title={f.active ? "Visible" : "Masquée"}
                            >
                              <input
                                type="checkbox"
                                checked={f.active}
                                disabled={busySlug === f.slug}
                                onChange={(e) =>
                                  patchFigure(f.slug, {
                                    active: e.target.checked,
                                  })
                                }
                              />
                              <span className="sr-only">Actif</span>
                            </label>
                          </td>
                          <td>
                            <label
                              className="admin-active-toggle"
                              title={
                                f.adminDone
                                  ? "Curation terminée"
                                  : "Marquer comme done"
                              }
                            >
                              <input
                                type="checkbox"
                                checked={f.adminDone}
                                disabled={busySlug === f.slug}
                                onChange={(e) =>
                                  patchFigure(f.slug, {
                                    adminDone: e.target.checked,
                                  })
                                }
                              />
                              <span className="sr-only">Done</span>
                            </label>
                          </td>
                          <td>{f.name}</td>
                          <td>{f.prerequisites}</td>
                          <td>
                            {f.videos > 0 ? (
                              f.videos
                            ) : (
                              <span className="admin-no-video">—</span>
                            )}
                          </td>
                          <td className="admin-table-actions">
                            <Link href={`/figures/${f.slug}`}>Voir</Link>
                            <Link href={`/admin/figures/${f.slug}/edit`}>
                              Modifier
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
