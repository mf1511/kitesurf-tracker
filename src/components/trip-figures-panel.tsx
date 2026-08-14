"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CrewRiderChips from "@/components/crew-rider-chips";
import type {
  CrewRider,
  CrewRiderChip,
  MyObjectiveRow,
  TripFigureRow,
} from "@/lib/trips";
import { sortFigureSections } from "@/lib/figure-sections";
import { sortCategories } from "@/lib/gamification";
import { isTwintipAvanceImportFigure } from "@/lib/twintip-avance";
import { figureHref } from "@/lib/nav-return";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Fig = {
  id: string;
  slug: string;
  name: string;
  category: string;
  order: number;
  section: string | null;
  videoCount: number;
};

type Sectioned<T> = { section: string | null; figs: T[] };
type Grouped<T> = { category: string; blocks: Sectioned<T>[] };

/** Même découpage que le catalogue : catégorie → sous-module → ordre */
function groupByCategorySection<
  T extends { category: string; section: string | null; order: number; name: string },
>(items: T[], categoryOrder: readonly string[]): Grouped<T>[] {
  const byCat = new Map<string, T[]>();
  for (const f of items) {
    const list = byCat.get(f.category) ?? [];
    list.push(f);
    byCat.set(f.category, list);
  }
  return sortCategories([...byCat.keys()], categoryOrder).map((category) => {
    const rows = (byCat.get(category) ?? []).sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")
    );
    const names = sortFigureSections(
      category,
      [...new Set(rows.map((f) => f.section).filter(Boolean) as string[])]
    );
    const blocks: Sectioned<T>[] = names.map((section) => ({
      section,
      figs: rows.filter((f) => f.section === section),
    }));
    const orphan = rows.filter((f) => !f.section);
    if (orphan.length > 0) {
      blocks.push({ section: names.length > 0 ? "Autres" : null, figs: orphan });
    }
    return { category, blocks };
  });
}

function figureMatchesQuery(
  f: { name: string; category: string; section: string | null },
  query: string
) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q) ||
    (f.section != null && f.section.toLowerCase().includes(q))
  );
}

export default function TripFiguresPanel({
  tripId,
  allFigures,
  categoryOrder,
  tripFigures,
  myObjectives,
  crewKnownBy,
  meId,
  isOwner,
}: {
  tripId: string;
  allFigures: Fig[];
  /** Ordre des mondes (AppSetting), comme le catalogue */
  categoryOrder: readonly string[];
  tripFigures: TripFigureRow[];
  myObjectives: MyObjectiveRow[];
  /** Qui a déjà chaque figure en acquis perso */
  crewKnownBy: Record<string, CrewRiderChip[]>;
  meId: string;
  /** Créateur du séjour : checklist multi-sélection */
  isOwner: boolean;
}) {
  const router = useRouter();
  const confirmDialog = useConfirm();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [memberFigureId, setMemberFigureId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [showMemberAdd, setShowMemberAdd] = useState(false);
  /** Déjà réussies (acquis perso) masquées par défaut */
  const [showDone, setShowDone] = useState(false);
  // État local : objectifs sans attendre un refresh serveur complet
  const [figures, setFigures] = useState(tripFigures);
  const [objectives, setObjectives] = useState(myObjectives);

  useEffect(() => {
    setFigures(tripFigures);
    setObjectives(myObjectives);
  }, [tripFigures, myObjectives]);

  const listedIds = useMemo(
    () => new Set(figures.map((f) => f.figureId)),
    [figures]
  );

  /** Figures encore ajoutables (pas déjà sur la liste) — select membre */
  const available = useMemo(() => {
    return allFigures
      .filter((f) => !listedIds.has(f.id) && figureMatchesQuery(f, query))
      .sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")
      );
  }, [allFigures, listedIds, query]);

  // Checklist créateur : catégories + sous-modules (déjà sur la liste = cochées)
  const checklistGrouped = useMemo(
    () =>
      groupByCategorySection(
        allFigures.filter((f) => figureMatchesQuery(f, query)),
        categoryOrder
      ),
    [allFigures, query, categoryOrder]
  );

  const doneHiddenCount = figures.filter((f) => f.alreadyDone).length;

  // Liste séjour : même découpage catalogue, réussies masquées par défaut
  const listedGrouped = useMemo(() => {
    const filtered = showDone
      ? figures
      : figures.filter((f) => !f.alreadyDone);
    return groupByCategorySection(filtered, categoryOrder);
  }, [figures, showDone, categoryOrder]);

  /** Avatar « moi » pour maj optimiste des holders */
  function meAsHolder(): CrewRider {
    for (const f of figures) {
      const h = f.objectiveHolders.find((x) => x.userId === meId);
      if (h) return h;
      const k = f.knownBy.find((x) => x.userId === meId);
      if (k) {
        return {
          userId: meId,
          label: k.firstName,
          isMe: true,
          image: k.image,
          initials: k.initials,
          hue: k.hue,
        };
      }
    }
    for (const chips of Object.values(crewKnownBy)) {
      const k = chips.find((x) => x.userId === meId);
      if (k) {
        return {
          userId: meId,
          label: k.firstName,
          isMe: true,
          image: k.image,
          initials: k.initials,
          hue: k.hue,
        };
      }
    }
    return {
      userId: meId,
      label: "Moi",
      isMe: true,
      image: null,
      initials: "•",
      hue: 200,
    };
  }

  function toggleSelect(id: string) {
    if (listedIds.has(id)) return; // déjà sur la liste
    const fig = allFigures.find((f) => f.id === id);
    if (!fig || fig.videoCount < 1) return; // sans vidéo = non sélectionnable
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function addFigureIds(ids: string[]) {
    if (ids.length === 0) {
      setError("Choisis au moins une figure");
      return;
    }
    setBusy("add");
    setError("");
    const res = await fetch(`/api/trips/${tripId}/figures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figureIds: ids }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setSelected(new Set());
    setMemberFigureId("");
    setQuery("");
    setShowMemberAdd(false);
    router.refresh();
  }

  async function addSelected(e: React.FormEvent) {
    e.preventDefault();
    await addFigureIds([...selected]);
  }

  async function addOne(e: React.FormEvent) {
    e.preventDefault();
    if (!memberFigureId) {
      setError("Choisis une figure");
      return;
    }
    await addFigureIds([memberFigureId]);
  }

  async function removeFigure(fid: string) {
    const ok = await confirmDialog({
      title: "Retirer la figure",
      message: "Retirer cette figure de la liste du séjour ?",
      confirmLabel: "Retirer",
      danger: true,
    });
    if (!ok) return;
    setBusy(`rm-${fid}`);
    const res = await fetch(`/api/trips/${tripId}/figures`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figureId: fid }),
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur");
      return;
    }
    router.refresh();
  }

  async function toggleObjective(fid: string, isMine: boolean) {
    if (busy === `obj-${fid}`) return;
    const fig = figures.find((f) => f.figureId === fid);
    if (!fig) return;

    const prevFigures = figures;
    const prevObjectives = objectives;
    const me = meAsHolder();

    // Optimistic UI — pas de router.refresh (trop lent sur la fiche séjour)
    setFigures((list) =>
      list.map((f) => {
        if (f.figureId !== fid) return f;
        if (isMine) {
          return {
            ...f,
            isMyObjective: false,
            objectiveHolders: f.objectiveHolders.filter(
              (h) => h.userId !== meId
            ),
          };
        }
        const holders = f.objectiveHolders.some((h) => h.userId === meId)
          ? f.objectiveHolders
          : [...f.objectiveHolders, me];
        return { ...f, isMyObjective: true, objectiveHolders: holders };
      })
    );
    setObjectives((list) => {
      if (isMine) return list.filter((o) => o.figureId !== fid);
      if (list.some((o) => o.figureId === fid)) return list;
      return [
        ...list,
        {
          figureId: fid,
          name: fig.name,
          slug: fig.slug,
          category: fig.category,
          active: fig.active,
          done: fig.iCompleted,
        },
      ];
    });

    setBusy(`obj-${fid}`);
    setError("");
    const res = await fetch(`/api/trips/${tripId}/objectives`, {
      method: isMine ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figureId: fid }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setFigures(prevFigures);
      setObjectives(prevObjectives);
      setError(data.error || "Erreur");
    }
  }

  const doneCount = objectives.filter((o) => o.done).length;
  // Select membre : top résultats filtrés
  const memberOptions = available.slice(0, 50);

  return (
    <div className="trip-objectives">
      <section className="community-card">
        <h2>Mes objectifs</h2>
        <p className="community-lead">
          Choisis des figures dans la liste du séjour. Validées pendant les
          dates = objectif coché.
        </p>
        {objectives.length === 0 ? (
          <p className="quest-empty">
            Aucun objectif — clique « Mon objectif » sur une figure ci-dessous.
          </p>
        ) : (
          <>
            <p className="feed-meta">
              {doneCount} / {objectives.length} validés pendant le séjour
            </p>
            <ul className="challenge-list">
              {objectives.map((o) => (
                <li key={o.figureId}>
                  <div>
                    <strong>
                      {o.done ? "✓ " : ""}
                      {o.active ? (
                        <Link href={figureHref(o.slug, `/trips/${tripId}`)}>
                          {o.name}
                        </Link>
                      ) : (
                        <>
                          {o.name}{" "}
                          <span
                            className={`soon-label${
                              isTwintipAvanceImportFigure(o) ? " avance-new" : ""
                            }`}
                          >
                            Bientôt disponible
                          </span>
                        </>
                      )}
                    </strong>
                    <span className="feed-meta">
                      {o.category}
                      {o.done ? " · validé pendant le trip" : " · en cours"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy === `obj-${o.figureId}`}
                    onClick={() => toggleObjective(o.figureId, true)}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="community-card">
        <div className="trip-list-head">
          <div>
            <h2>Liste de figures du séjour</h2>
            <p className="community-lead">
              Par monde, dans l’ordre de l’arbre. Étoile = ton objectif perso.
            </p>
          </div>
          {doneHiddenCount > 0 && (
            <button
              type="button"
              className={`btn btn-ghost ${showDone ? "active" : ""}`}
              onClick={() => setShowDone((v) => !v)}
            >
              {showDone
                ? "Masquer les réussies"
                : `Afficher les réussies (${doneHiddenCount})`}
            </button>
          )}
        </div>

        {figures.length === 0 ? (
          <p className="quest-empty">
            {isOwner
              ? "Liste vide — coche les figures dans la zone créateur."
              : "Liste vide — le créateur n’a pas encore choisi de figures."}
          </p>
        ) : listedGrouped.length === 0 ? (
          <p className="quest-empty">
            Toutes tes figures de la liste sont déjà réussies —{" "}
            <button
              type="button"
              className="linkish"
              onClick={() => setShowDone(true)}
            >
              les afficher
            </button>
            .
          </p>
        ) : (
          <div className="trip-figure-groups">
            {listedGrouped.map(({ category, blocks }) => (
              <div key={category} className="trip-figure-group">
                <h3>
                  <span>{category}</span>
                  <span className="trip-figure-count">
                    {blocks.reduce((n, b) => n + b.figs.length, 0)}
                  </span>
                </h3>
                {blocks.map((block) => (
                  <div
                    key={block.section ?? "all"}
                    className={block.section ? "trip-figure-section" : undefined}
                  >
                    {block.section ? <h4>{block.section}</h4> : null}
                    <ul className="challenge-list">
                  {block.figs.map((f) => {
                    const canRemove = isOwner || f.addedById === meId;
                    return (
                      <li
                        key={f.id}
                        className={
                          f.alreadyDone
                            ? "trip-fig-done"
                            : f.iCompleted
                            ? "trip-fig-tripdone"
                            : ""
                        }
                      >
                        <div className="trip-fig-main">
                          <div className="trip-fig-title-row">
                            <strong>
                              {f.alreadyDone || f.iCompleted ? "✓ " : ""}
                              {f.active ? (
                                <Link
                                  href={figureHref(f.slug, `/trips/${tripId}`)}
                                >
                                  {f.name}
                                </Link>
                              ) : (
                                <>
                                  {f.name}{" "}
                                  <span
                                    className={`soon-label${
                                      isTwintipAvanceImportFigure(f)
                                        ? " avance-new"
                                        : ""
                                    }`}
                                  >
                                    Bientôt disponible
                                  </span>
                                </>
                              )}
                            </strong>
                            <div className="trip-figure-actions">
                              <button
                                type="button"
                                className={`obj-toggle${f.isMyObjective ? " on" : ""}`}
                                disabled={
                                  !f.active || busy === `obj-${f.figureId}`
                                }
                                aria-pressed={f.isMyObjective}
                                title={
                                  !f.active
                                    ? "Bientôt disponible"
                                    : f.isMyObjective
                                    ? "Retirer de mes objectifs"
                                    : "Ajouter à mes objectifs"
                                }
                                aria-label={
                                  f.isMyObjective
                                    ? "Retirer de mes objectifs"
                                    : "Ajouter à mes objectifs"
                                }
                                onClick={() =>
                                  toggleObjective(f.figureId, f.isMyObjective)
                                }
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill={f.isMyObjective ? "currentColor" : "none"}
                                  aria-hidden
                                >
                                  <path
                                    d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                              {canRemove && (
                                <button
                                  type="button"
                                  className="btn-icon btn-icon-sm"
                                  disabled={busy === `rm-${f.figureId}`}
                                  onClick={() => removeFigure(f.figureId)}
                                  title="Retirer de la liste"
                                  aria-label="Retirer de la liste"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                          {(f.alreadyDone || f.iCompleted) && (
                            <span className="feed-meta">
                              {f.alreadyDone
                                ? "déjà réussi"
                                : "validé pendant le trip"}
                            </span>
                          )}
                          {f.objectiveHolders.length > 0 && (
                            <div className="trip-obj-holders">
                              <span>Objectif de</span>
                              <ul
                                className="crew-chips crew-chips--avatars"
                                aria-label={`Objectif de ${f.objectiveHolders
                                  .map((h) => h.label)
                                  .join(", ")}`}
                              >
                                {f.objectiveHolders.map((h) => (
                                  <li
                                    key={h.userId}
                                    className={h.isMe ? "me" : undefined}
                                    title={h.label}
                                  >
                                    {h.image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={h.image}
                                        alt={h.label}
                                        className="crew-avatar has-photo"
                                      />
                                    ) : (
                                      <span
                                        className="crew-avatar"
                                        style={{
                                          background: `hsl(${h.hue} 42% 42%)`,
                                        }}
                                        aria-hidden
                                      >
                                        {h.initials}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {f.completers.length > 0 && (
                            <span className="feed-meta">
                              Validé pendant le trip :{" "}
                              {f.completers.map((c) => c.label).join(", ")}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Membres : ajout simple d’une figure */}
        {!isOwner && (
          <div className="challenge-form">
            {!showMemberAdd ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowMemberAdd(true)}
              >
                + Ajouter une figure
              </button>
            ) : (
              <form onSubmit={addOne}>
                <h3>Ajouter une figure</h3>
                <label>
                  Filtrer
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ex: kiteloop…"
                    autoFocus
                  />
                </label>
                <label>
                  Figure
                  <select
                    value={memberFigureId}
                    onChange={(e) => setMemberFigureId(e.target.value)}
                    required
                  >
                    <option value="">— Choisir —</option>
                    {memberOptions.map((f) => (
                      <option
                        key={f.id}
                        value={f.id}
                        disabled={f.videoCount < 1}
                      >
                        {f.name} (
                        {f.section
                          ? `${f.category} · ${f.section}`
                          : f.category}
                        )
                        {f.videoCount < 1 ? " — sans vidéo" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {error && <p className="form-error">{error}</p>}
                <div className="trip-figure-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={busy === "add" || !memberFigureId}
                  >
                    {busy === "add" ? "…" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowMemberAdd(false);
                      setError("");
                      setQuery("");
                      setMemberFigureId("");
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {/* Créateur : checklist multi-sélection */}
      {isOwner && (
        <section className="community-card trip-creator-zone">
          <h2>Créateur du séjour</h2>
          <p className="community-lead">
            Compose la liste du trip. À droite de chaque figure : qui du crew
            l’a déjà en acquis.
          </p>
          <form onSubmit={addSelected} className="challenge-form" style={{ borderTop: "none", paddingTop: 0 }}>
            <label>
              Filtrer
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ex: kiteloop, KGB, big air…"
              />
            </label>

            {checklistGrouped.length === 0 ? (
              <p className="quest-empty">Aucune figure ne correspond au filtre.</p>
            ) : (
              <div className="figure-checklist">
                {checklistGrouped.map(({ category, blocks }) => (
                  <div key={category} className="figure-checklist-group">
                    <h4>{category}</h4>
                    {blocks.map((block) => (
                      <div key={block.section ?? "all"}>
                        {block.section ? (
                          <h5 className="figure-checklist-section">
                            {block.section}
                          </h5>
                        ) : null}
                    <ul>
                      {block.figs.map((f) => {
                        const onList = listedIds.has(f.id);
                        const noVideo = f.videoCount < 1;
                        return (
                          <li
                            key={f.id}
                            className={`figure-check-row${onList ? " is-listed" : ""}${
                              noVideo && !onList ? " is-no-video" : ""
                            }`}
                          >
                            <label className="figure-check">
                              <input
                                type="checkbox"
                                checked={onList || selected.has(f.id)}
                                disabled={onList || noVideo}
                                onChange={() => toggleSelect(f.id)}
                              />
                              <span>{f.name}</span>
                              {onList ? (
                                <span className="figure-on-list">sur la liste</span>
                              ) : noVideo ? (
                                <span className="figure-no-video">sans vidéo</span>
                              ) : null}
                            </label>
                            <CrewRiderChips riders={crewKnownBy[f.id] ?? []} />
                          </li>
                        );
                      })}
                    </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {error && <p className="form-error">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy === "add" || selected.size === 0}
            >
              {busy === "add"
                ? "…"
                : selected.size === 0
                  ? "Ajouter à la liste"
                  : `Ajouter ${selected.size} à la liste`}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
