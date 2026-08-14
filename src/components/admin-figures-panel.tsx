"use client";

import Link from "next/link";
import { useMemo, useRef, useEffect, useState, type ReactNode } from "react";
import {
  categoryHasSections,
  sortFigureSections,
} from "@/lib/figure-sections";
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
  /** Sous-module Débuter / Twintip, sinon null */
  section: string | null;
};

type ActiveFilter = "all" | "active" | "inactive";
type VideoFilter = "all" | "with" | "without";
type DoneFilter = "all" | "done" | "todo";

/** Minuscules sans accents pour la recherche */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function sectionCollapseKey(category: string, section: string) {
  return `${category}::${section}`;
}

function hasSections(category: string) {
  return categoryHasSections(category);
}

function sortSectionsFor(category: string, sections: string[]) {
  return sortFigureSections(category, sections);
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

/** Liste admin : filtres + groupes + sous-sections + ↑↓ */
export default function AdminFiguresPanel({
  initialFigures,
  initialCategoryOrder,
}: {
  initialFigures: AdminFigureRow[];
  initialCategoryOrder: string[];
}) {
  const [figures, setFigures] = useState(initialFigures);
  const [categoryOrder, setCategoryOrder] = useState(initialCategoryOrder);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [videoFilter, setVideoFilter] = useState<VideoFilter>("all");
  const [doneFilter, setDoneFilter] = useState<DoneFilter>("all");
  /** Catégories repliées */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  /** Sous-sections repliées (clé `cat::section`) */
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set()
  );
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [busyCategory, setBusyCategory] = useState<string | null>(null);
  const [busyReorder, setBusyReorder] = useState(false);

  useEffect(() => {
    setFigures(initialFigures);
  }, [initialFigures]);

  useEffect(() => {
    setCategoryOrder(initialCategoryOrder);
  }, [initialCategoryOrder]);

  const filtersActive =
    normalize(query.trim()).length > 0 ||
    activeFilter !== "all" ||
    videoFilter !== "all" ||
    doneFilter !== "all";

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
        !normalize(f.category).includes(q) &&
        !(f.section != null && normalize(f.section).includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [figures, query, activeFilter, videoFilter, doneFilter]);

  const allCategories = useMemo(
    () =>
      sortCategories(
        Array.from(new Set(figures.map((f) => f.category))),
        categoryOrder
      ),
    [figures, categoryOrder]
  );

  const categories = useMemo(() => {
    const present = new Set(filtered.map((f) => f.category));
    return allCategories.filter((c) => present.has(c));
  }, [allCategories, filtered]);

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

  async function moveCategory(category: string, dir: -1 | 1) {
    const idx = allCategories.indexOf(category);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= allCategories.length) return;

    const nextOrder = [...allCategories];
    [nextOrder[idx], nextOrder[swap]] = [nextOrder[swap], nextOrder[idx]];
    const prev = categoryOrder;
    setCategoryOrder(nextOrder);
    setBusyReorder(true);
    const res = await fetch("/api/admin/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedCategories: nextOrder }),
    });
    setBusyReorder(false);
    if (!res.ok) setCategoryOrder(prev);
  }

  async function moveFigure(category: string, id: string, dir: -1 | 1) {
    if (filtersActive) return;
    const list = figures
      .filter((f) => f.category === category)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr"));
    const idx = list.findIndex((f) => f.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= list.length) return;

    const ordered = list.map((f) => f.id);
    [ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]];

    const prev = figures;
    setFigures((rows) =>
      rows.map((f) => {
        if (f.category !== category) return f;
        const order = ordered.indexOf(f.id);
        return order >= 0 ? { ...f, order } : f;
      })
    );

    setBusyReorder(true);
    const res = await fetch("/api/admin/figures/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, orderedIds: ordered }),
    });
    setBusyReorder(false);
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

  function toggleSection(category: string, section: string) {
    const key = sectionCollapseKey(category, section);
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function expandAll() {
    setCollapsed(new Set());
    setCollapsedSections(new Set());
  }

  function collapseAll() {
    setCollapsed(new Set(categories));
    const keys = new Set<string>();
    for (const f of filtered) {
      if (f.section && hasSections(f.category)) {
        keys.add(sectionCollapseKey(f.category, f.section));
      }
    }
    setCollapsedSections(keys);
  }

  function renderFigureTable(
    category: string,
    rows: AdminFigureRow[],
    allInCat: AdminFigureRow[]
  ): ReactNode {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Actif</th>
              <th>Done</th>
              <th>Nom</th>
              <th>Prérequis</th>
              <th>Vidéos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => {
              const fullIdx = allInCat.findIndex((x) => x.id === f.id);
              return (
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
                    <div className="admin-reorder-btns">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={filtersActive || busyReorder || fullIdx <= 0}
                        onClick={() => void moveFigure(category, f.id, -1)}
                        aria-label="Monter la figure"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={
                          filtersActive ||
                          busyReorder ||
                          fullIdx < 0 ||
                          fullIdx >= allInCat.length - 1
                        }
                        onClick={() => void moveFigure(category, f.id, 1)}
                        aria-label="Descendre la figure"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
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
                          patchFigure(f.slug, { active: e.target.checked })
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
                          patchFigure(f.slug, { adminDone: e.target.checked })
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
                    <Link href={`/admin/figures/${f.slug}/edit`}>Modifier</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderCategoryBody(
    category: string,
    rows: AdminFigureRow[],
    allInCat: AdminFigureRow[]
  ): ReactNode {
    if (!hasSections(category)) {
      return renderFigureTable(category, rows, allInCat);
    }

    const sectionNames = sortSectionsFor(
      category,
      Array.from(
        new Set(rows.map((f) => f.section).filter(Boolean) as string[])
      )
    );
    const orphan = rows.filter((f) => !f.section);
    if (sectionNames.length === 0) {
      return renderFigureTable(category, rows, allInCat);
    }

    return (
      <div className="admin-subsections">
        {sectionNames.map((sec) => {
          const secRows = rows.filter((f) => f.section === sec);
          const key = sectionCollapseKey(category, sec);
          const secOpen = !collapsedSections.has(key);
          return (
            <div
              key={key}
              className={`admin-subsection${secOpen ? "" : " is-collapsed"}`}
            >
              <button
                type="button"
                className="admin-subsection-toggle"
                aria-expanded={secOpen}
                onClick={() => toggleSection(category, sec)}
              >
                <span className="admin-cat-chevron" aria-hidden>
                  {secOpen ? "▾" : "▸"}
                </span>
                <span className="admin-subsection-title">{sec}</span>
                <span className="admin-cat-meta">{secRows.length}</span>
              </button>
              {secOpen
                ? renderFigureTable(category, secRows, allInCat)
                : null}
            </div>
          );
        })}
        {orphan.length > 0 ? (
          <div className="admin-subsection">
            {sectionNames.length > 0 ? (
              <div className="admin-subsection-label">Autres</div>
            ) : null}
            {renderFigureTable(category, orphan, allInCat)}
          </div>
        ) : null}
      </div>
    );
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
            placeholder="Nom, slug, catégorie ou sous-module…"
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

      {filtersActive ? (
        <p className="admin-reorder-hint">
          Réordonnancement des figures désactivé tant qu’un filtre / recherche
          est actif.
        </p>
      ) : null}

      {grouped.length === 0 ? (
        <p className="quest-empty">Aucune figure pour ces filtres.</p>
      ) : (
        grouped.map(({ category, figures: rows }) => {
          const allInCat = figures
            .filter((f) => f.category === category)
            .sort(
              (a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")
            );
          const activeInCat = allInCat.filter((f) => f.active).length;
          const allOn = allInCat.length > 0 && activeInCat === allInCat.length;
          const someOn = activeInCat > 0 && !allOn;
          const isOpen = !collapsed.has(category);
          const catIdx = allCategories.indexOf(category);

          return (
            <section
              key={category}
              className={`admin-cat-block${isOpen ? "" : " is-collapsed"}`}
            >
              <header className="admin-cat-head">
                <div className="admin-reorder-btns">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busyReorder || catIdx <= 0}
                    onClick={() => void moveCategory(category, -1)}
                    title="Monter la catégorie"
                    aria-label="Monter la catégorie"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={
                      busyReorder ||
                      catIdx < 0 ||
                      catIdx >= allCategories.length - 1
                    }
                    onClick={() => void moveCategory(category, 1)}
                    title="Descendre la catégorie"
                    aria-label="Descendre la catégorie"
                  >
                    ↓
                  </button>
                </div>
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

              {isOpen ? renderCategoryBody(category, rows, allInCat) : null}
            </section>
          );
        })
      )}
    </div>
  );
}
