"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CrewRiderChips from "@/components/crew-rider-chips";
import type { CrewRiderChip, MyObjectiveRow, TripFigureRow } from "@/lib/trips";
import { sortCategories } from "@/lib/gamification";
import { figureHref } from "@/lib/nav-return";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Fig = { id: string; name: string; category: string };

export default function TripFiguresPanel({
  tripId,
  allFigures,
  tripFigures,
  myObjectives,
  crewKnownBy,
  meId,
  isOwner,
}: {
  tripId: string;
  allFigures: Fig[];
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

  const listedIds = useMemo(
    () => new Set(tripFigures.map((f) => f.figureId)),
    [tripFigures]
  );

  /** Figures encore ajoutables (pas déjà sur la liste) — select membre */
  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allFigures.filter((f) => {
      if (listedIds.has(f.id)) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [allFigures, listedIds, query]);

  // Checklist créateur : toutes les figures (déjà sur la liste = cochées / figées)
  const checklistGrouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = allFigures.filter((f) => {
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
    const map = new Map<string, Fig[]>();
    for (const f of filtered) {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    }
    return sortCategories([...map.keys()]).map(
      (cat) => [cat, map.get(cat)!] as const
    );
  }, [allFigures, query]);

  const doneHiddenCount = tripFigures.filter((f) => f.alreadyDone).length;

  // Liste séjour : catégories (ordre arbre) + order pédagogique, filtre réussies
  const listedByCategory = useMemo(() => {
    const filtered = showDone
      ? tripFigures
      : tripFigures.filter((f) => !f.alreadyDone);
    const map = new Map<string, TripFigureRow[]>();
    for (const f of filtered) {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")
      );
    }
    return sortCategories([...map.keys()]).map(
      (cat) => [cat, map.get(cat)!] as const
    );
  }, [tripFigures, showDone]);

  function toggleSelect(id: string) {
    if (listedIds.has(id)) return; // déjà sur la liste
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
      setError(data.error || "Erreur");
      return;
    }
    router.refresh();
  }

  const doneCount = myObjectives.filter((o) => o.done).length;
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
        {myObjectives.length === 0 ? (
          <p className="quest-empty">
            Aucun objectif — clique « Mon objectif » sur une figure ci-dessous.
          </p>
        ) : (
          <>
            <p className="feed-meta">
              {doneCount} / {myObjectives.length} validés pendant le séjour
            </p>
            <ul className="challenge-list">
              {myObjectives.map((o) => (
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
                          <span className="soon-label">Bientôt disponible</span>
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

        {tripFigures.length === 0 ? (
          <p className="quest-empty">
            {isOwner
              ? "Liste vide — coche les figures dans la zone créateur."
              : "Liste vide — le créateur n’a pas encore choisi de figures."}
          </p>
        ) : listedByCategory.length === 0 ? (
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
            {listedByCategory.map(([category, figs]) => (
              <div key={category} className="trip-figure-group">
                <h3>
                  <span>{category}</span>
                  <span className="trip-figure-count">{figs.length}</span>
                </h3>
                <ul className="challenge-list">
                  {figs.map((f) => {
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
                                  <span className="soon-label">
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
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.category})
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
                {checklistGrouped.map(([category, figs]) => (
                  <div key={category} className="figure-checklist-group">
                    <h4>{category}</h4>
                    <ul>
                      {figs.map((f) => {
                        const onList = listedIds.has(f.id);
                        return (
                          <li
                            key={f.id}
                            className={`figure-check-row${onList ? " is-listed" : ""}`}
                          >
                            <label className="figure-check">
                              <input
                                type="checkbox"
                                checked={onList || selected.has(f.id)}
                                disabled={onList}
                                onChange={() => toggleSelect(f.id)}
                              />
                              <span>{f.name}</span>
                              {onList && (
                                <span className="figure-on-list">sur la liste</span>
                              )}
                            </label>
                            <CrewRiderChips riders={crewKnownBy[f.id] ?? []} />
                          </li>
                        );
                      })}
                    </ul>
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
