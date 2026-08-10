"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CrewRiderChips from "@/components/crew-rider-chips";
import type { CrewRiderChip, MyObjectiveRow, TripFigureRow } from "@/lib/trips";

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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [memberFigureId, setMemberFigureId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [showMemberAdd, setShowMemberAdd] = useState(false);

  const listedIds = useMemo(
    () => new Set(tripFigures.map((f) => f.figureId)),
    [tripFigures]
  );

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

  // Checklist créateur : groupée par catégorie
  const grouped = useMemo(() => {
    const map = new Map<string, Fig[]>();
    for (const f of available) {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    }
    return [...map.entries()];
  }, [available]);

  function toggleSelect(id: string) {
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
    if (!confirm("Retirer cette figure de la liste du séjour ?")) return;
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
                      <Link href={`/figures/${o.slug}`}>{o.name}</Link>
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
        <h2>Liste de figures du séjour</h2>
        <p className="community-lead">
          Visible par tout le crew. Chacun peut en prendre comme objectif perso.
        </p>

        {tripFigures.length === 0 ? (
          <p className="quest-empty">
            {isOwner
              ? "Liste vide — coche les figures dans la zone créateur."
              : "Liste vide — le créateur n’a pas encore choisi de figures."}
          </p>
        ) : (
          <ul className="challenge-list">
            {tripFigures.map((f) => {
              const canRemove = isOwner || f.addedById === meId;
              return (
                <li key={f.id}>
                  <div>
                    <strong>
                      {f.iCompleted ? "✓ " : ""}
                      <Link href={`/figures/${f.slug}`}>{f.name}</Link>
                    </strong>
                    <span className="feed-meta">
                      {f.category} · ajouté par {f.addedByLabel}
                    </span>
                    {f.knownBy.length > 0 && (
                      <div className="crew-known-row">
                        <span className="feed-meta">Déjà acquis :</span>
                        <CrewRiderChips riders={f.knownBy} />
                      </div>
                    )}
                    {f.objectiveHolders.length > 0 && (
                      <span className="feed-meta">
                        Objectifs :{" "}
                        {f.objectiveHolders.map((h) => h.label).join(", ")}
                      </span>
                    )}
                    {f.completers.length > 0 && (
                      <span className="feed-meta">
                        Validé pendant le trip :{" "}
                        {f.completers.map((c) => c.label).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="trip-figure-actions">
                    <button
                      type="button"
                      className={`btn ${f.isMyObjective ? "btn-ghost" : "btn-primary"}`}
                      disabled={busy === `obj-${f.figureId}`}
                      onClick={() =>
                        toggleObjective(f.figureId, f.isMyObjective)
                      }
                    >
                      {f.isMyObjective ? "Retirer objectif" : "Mon objectif"}
                    </button>
                    {canRemove && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={busy === `rm-${f.figureId}`}
                        onClick={() => removeFigure(f.figureId)}
                        title="Retirer de la liste"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
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
            Compose la liste du trip. À droite : qui du crew l’a déjà cochée
            chez soi (avatar + prénom).
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

            {grouped.length === 0 ? (
              <p className="quest-empty">
                {listedIds.size === allFigures.length
                  ? "Toutes les figures sont déjà sur la liste."
                  : "Aucune figure ne correspond au filtre."}
              </p>
            ) : (
              <div className="figure-checklist">
                {grouped.map(([category, figs]) => (
                  <div key={category} className="figure-checklist-group">
                    <h4>{category}</h4>
                    <ul>
                      {figs.map((f) => (
                        <li key={f.id} className="figure-check-row">
                          <label className="figure-check">
                            <input
                              type="checkbox"
                              checked={selected.has(f.id)}
                              onChange={() => toggleSelect(f.id)}
                            />
                            <span>{f.name}</span>
                          </label>
                          <CrewRiderChips
                            riders={crewKnownBy[f.id] ?? []}
                          />
                        </li>
                      ))}
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
