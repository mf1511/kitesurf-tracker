"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import FigureCheckbox from "@/components/FigureCheckbox";
import FigureFavoriteButton from "@/components/figure-favorite-button";
import { sortDebuterSections } from "@/lib/debuter";
import {
  isTwintipAvanceImportFigure,
  sortTwintipAvanceSections,
  TWINTIP_AVANCE_CATEGORY,
} from "@/lib/twintip-avance";
import { figureHref } from "@/lib/nav-return";

export type CatalogFigure = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string | null;
  /** Sous-module Débuter (ex. « Sur la plage »), null sinon */
  section: string | null;
  order: number;
  completed: boolean;
  locked: boolean;
  /** false = visible mais pas encore publiée (admin) */
  active: boolean;
  xp: number;
  /** Nombre de vidéos liées à la figure */
  videoCount: number;
  favorite: boolean;
};

/** Minuscules sans accents pour la recherche */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const COLLAPSED_KEY = "figures-catalog-collapsed";

function readCollapsed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(COLLAPSED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeCollapsed(set: Set<string>) {
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/** Catalogue figures : recherche instantanée, filtres catégorie/acquises */
export function FiguresCatalog({
  figures: initialFigures,
  categories,
  initialCategory,
  initialFavoritesOnly = false,
}: {
  figures: CatalogFigure[];
  categories: string[];
  initialCategory?: string;
  /** Pré-active le filtre favoris (?favorites=1) */
  initialFavoritesOnly?: boolean;
}) {
  // État local pour que le filtre Favoris réagisse au toggle étoile
  const [figures, setFigures] = useState(initialFigures);
  const [query, setQuery] = useState("");
  /** Vide = toutes les catégories ; sinon filtre multi-sélection */
  const [selectedCats, setSelectedCats] = useState<string[]>(() =>
    initialCategory && categories.includes(initialCategory)
      ? [initialCategory]
      : []
  );
  const [catOpen, setCatOpen] = useState(false);
  const catSelectRef = useRef<HTMLDivElement>(null);
  const [hideDone, setHideDone] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavoritesOnly);
  /** Catégories repliées — restaurées depuis sessionStorage */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  // Sync si le serveur renvoie un nouveau catalogue
  useEffect(() => {
    setFigures(initialFigures);
  }, [initialFigures]);

  // Restaure fold après mount (évite mismatch SSR)
  useEffect(() => {
    setCollapsed(readCollapsed());
  }, []);

  function setCollapsedPersist(next: Set<string>) {
    setCollapsed(next);
    writeCollapsed(next);
  }

  // Ferme le dropdown au clic extérieur / Escape
  useEffect(() => {
    if (!catOpen) return;
    function onPointer(e: MouseEvent) {
      if (!catSelectRef.current?.contains(e.target as Node)) setCatOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCatOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [catOpen]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    let list = figures;
    if (selectedCats.length > 0) {
      const set = new Set(selectedCats);
      list = list.filter((f) => set.has(f.category));
    }
    if (favoritesOnly) list = list.filter((f) => f.favorite);
    if (hideDone) list = list.filter((f) => !f.completed);
    if (q) {
      list = list.filter(
        (f) =>
          normalize(f.name).includes(q) ||
          (f.section != null && normalize(f.section).includes(q))
      );
    }
    // Ordre pédagogique (order) puis nom
    return [...list].sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")
    );
  }, [figures, query, selectedCats, hideDone, favoritesOnly]);

  function setFavorite(id: string, favorite: boolean) {
    setFigures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, favorite } : f))
    );
  }

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const catTriggerLabel =
    selectedCats.length === 0
      ? "Toutes les catégories"
      : selectedCats.length === 1
        ? selectedCats[0]
        : `${selectedCats.length} catégories`;

  // Regroupement par catégorie (+ sous-sections Débuter / Twintip avancé)
  const visibleCategories = categories.filter((c) =>
    visible.some((f) => f.category === c)
  );

  // Pendant une recherche, tout reste ouvert pour voir les matches
  const searching = normalize(query.trim()).length > 0;

  function toggleCategory(cat: string) {
    const next = new Set(collapsed);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setCollapsedPersist(next);
  }

  function expandAll() {
    setCollapsedPersist(new Set());
  }

  function collapseAll() {
    setCollapsedPersist(new Set(visibleCategories));
  }

  const renderCard = (f: CatalogFigure) => {
    const state = !f.active
      ? "inactive"
      : f.completed
      ? "done"
      : f.locked
      ? "locked"
      : "open";
    return (
      <div key={f.id} className={`figure-card ${state}`}>
        <span className={`status-dot ${state}`} aria-hidden />
        {f.active ? (
          <FigureFavoriteButton
            figureId={f.id}
            initialFavorite={f.favorite}
            size="sm"
            onChange={(fav) => setFavorite(f.id, fav)}
          />
        ) : null}
        {f.active ? (
          <FigureCheckbox
            figureId={f.id}
            initialCompleted={f.completed}
            size="sm"
            xpReward={f.xp}
          />
        ) : (
          <span className="checkbox sm locked" aria-hidden title="Bientôt" />
        )}
        {f.active ? (
          <Link
            href={figureHref(f.slug, "/figures")}
            className="figure-card-name"
          >
            {f.name}
          </Link>
        ) : (
          <span className="figure-card-name is-inactive">{f.name}</span>
        )}
        {/* Compteur vidéos à côté de l’XP */}
        <span className="figure-video-count" title={`${f.videoCount} vidéo${f.videoCount === 1 ? "" : "s"}`}>
          {f.videoCount} vidéo{f.videoCount === 1 ? "" : "s"}
        </span>
        <span
          className={`xp-pill${
            f.active
              ? ""
              : isTwintipAvanceImportFigure(f)
              ? " soon avance-new"
              : " soon"
          }`}
        >
          {f.active ? `+${f.xp} XP` : "Bientôt disponible"}
        </span>
      </div>
    );
  };

  /** Sous-sections formation (Débuter / Twintip avancé) */
  function renderSectionBlocks(list: CatalogFigure[], cat: string) {
    const sortFn =
      cat === TWINTIP_AVANCE_CATEGORY
        ? sortTwintipAvanceSections
        : sortDebuterSections;
    const sections = sortFn(
      Array.from(new Set(list.map((f) => f.section).filter(Boolean) as string[]))
    );
    const orphan = list.filter((f) => !f.section);

    return (
      <>
        {sections.map((sec) => (
          <div key={sec} className="figure-subsection">
            <h3>{sec}</h3>
            <div className="figure-grid">
              {list.filter((f) => f.section === sec).map(renderCard)}
            </div>
          </div>
        ))}
        {orphan.length > 0 && (
          <div className="figure-subsection">
            {sections.length > 0 && <h3>Autres</h3>}
            <div className="figure-grid">{orphan.map(renderCard)}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="figures-toolbar">
        <input
          type="search"
          className="figures-search"
          placeholder="Rechercher une figure… (backroll, kiteloop…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher une figure"
        />
        <div className="figures-cat-select" ref={catSelectRef}>
          <button
            type="button"
            className={`figures-cat-trigger${selectedCats.length ? " has-selection" : ""}${catOpen ? " open" : ""}`}
            aria-haspopup="listbox"
            aria-expanded={catOpen}
            onClick={() => setCatOpen((o) => !o)}
          >
            <span className="figures-cat-trigger-label">{catTriggerLabel}</span>
            <span className="figures-cat-chevron" aria-hidden>
              {catOpen ? "▴" : "▾"}
            </span>
          </button>
          {catOpen ? (
            <div className="figures-cat-menu" role="listbox" aria-multiselectable>
              <div className="figures-cat-menu-actions">
                <button type="button" onClick={() => setSelectedCats([])}>
                  Toutes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCats([...categories])}
                >
                  Tout cocher
                </button>
              </div>
              <ul className="figures-cat-options">
                {categories.map((cat) => {
                  const checked = selectedCats.includes(cat);
                  return (
                    <li key={cat}>
                      <label className={checked ? "checked" : ""}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCat(cat)}
                        />
                        <span>{cat}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
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
        <button
          type="button"
          onClick={() => setFavoritesOnly((v) => !v)}
          className={favoritesOnly ? "active" : ""}
          aria-pressed={favoritesOnly}
        >
          Favoris
        </button>
        {visibleCategories.length > 1 && !searching ? (
          <>
            <button type="button" onClick={expandAll}>
              Tout ouvrir
            </button>
            <button type="button" onClick={collapseAll}>
              Tout replier
            </button>
          </>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="quest-empty">
          {query
            ? `Aucune figure ne correspond à « ${query} ».`
            : favoritesOnly
            ? "Aucun favori dans ce filtre — clique l’étoile sur une figure."
            : hideDone
            ? "Plus rien à afficher — tu as tout validé dans ce filtre."
            : "Aucune figure dans cette catégorie."}
        </p>
      ) : (
        visibleCategories.map((cat) => {
          const list = visible.filter((f) => f.category === cat);
          const hasSections =
            cat === "Débuter" || cat === TWINTIP_AVANCE_CATEGORY;
          const isOpen = searching || !collapsed.has(cat);
          return (
            <section
              key={cat}
              className={`figure-section${isOpen ? "" : " is-collapsed"}`}
            >
              <h2>
                <button
                  type="button"
                  className="figure-section-toggle"
                  aria-expanded={isOpen}
                  onClick={() => toggleCategory(cat)}
                >
                  <span className="figure-section-chevron" aria-hidden>
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span>{cat}</span>
                  <span className="figure-section-count">
                    {list.length}
                  </span>
                </button>
              </h2>
              {isOpen ? (
                hasSections ? (
                  renderSectionBlocks(list, cat)
                ) : (
                  <div className="figure-grid">{list.map(renderCard)}</div>
                )
              ) : null}
            </section>
          );
        })
      )}
    </>
  );
}
