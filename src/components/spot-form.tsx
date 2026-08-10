"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WATER_TYPES, suggestSpotNames } from "@/lib/spot-names";
import { useToast } from "@/components/ui/toast";

/** Formulaire spot — nom + suggestions similaires (pas de lat/lng) */
export function SpotForm({ knownNames }: { knownNames: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [windOrientation, setWindOrientation] = useState("");
  const [waterType, setWaterType] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [similar, setSimilar] = useState<string[]>([]);

  const suggestions = useMemo(
    () => suggestSpotNames(name, knownNames, 5),
    [name, knownNames]
  );

  async function createSpot(force = false) {
    setError("");
    setSimilar([]);
    setBusy(true);

    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          windOrientation,
          waterType,
          force,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (Array.isArray(data.similar) && data.similar.length) {
          setSimilar(data.similar);
          setError(data.error || "Spot similaire trouvé");
        } else {
          setError(data.error || "Erreur");
        }
        setBusy(false);
        return;
      }
      setName("");
      setWindOrientation("");
      setWaterType("");
      toast(`Spot « ${data.spot.name} » ajouté`, "success");
      router.refresh();
    } catch {
      setError("Erreur réseau — réessaie");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createSpot(false);
  }

  return (
    <form onSubmit={submit} className="auth-form trip-form spot-form">
      <label>
        Nom du spot
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSimilar([]);
            setError("");
          }}
          placeholder="Almanarre, Leucate, Dakhla…"
          required
          maxLength={80}
          autoComplete="off"
        />
      </label>

      {suggestions.length > 0 && (
        <div className="spot-suggest" role="listbox" aria-label="Spots similaires">
          <p className="feed-meta">Spots existants proches :</p>
          <ul>
            {suggestions.map((s) => (
              <li key={s.name}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setName(s.name);
                    setSimilar([]);
                    setError("");
                  }}
                >
                  {s.exact ? "Déjà connu — " : "Tu voulais dire "}
                  <strong>{s.name}</strong>
                  {" ?"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label>
        Orientations de vent qui marchent (optionnel)
        <input
          value={windOrientation}
          onChange={(e) => setWindOrientation(e.target.value)}
          placeholder="Ex : O–NO, thermique d'est…"
          maxLength={120}
        />
      </label>

      <label>
        Plan d’eau (optionnel)
        <select value={waterType} onChange={(e) => setWaterType(e.target.value)}>
          <option value="">—</option>
          {WATER_TYPES.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="form-error">{error}</p>}
      {similar.length > 0 && (
        <div className="spot-suggest">
          <ul>
            {similar.map((n) => (
              <li key={n}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setName(n)}
                >
                  Utiliser « {n} »
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => void createSpot(true)}
          >
            Créer quand même « {name.trim()} »
          </button>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Ajout…" : "Ajouter le spot"}
      </button>
    </form>
  );
}
