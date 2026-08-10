"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { gearCategoryLabel, gearDisplayName } from "@/lib/gear";
import { useToast } from "@/components/ui/toast";

type SpotOption = { id: string; name: string; favorite: boolean };
type GearOption = {
  id: string;
  category: string;
  brand: string | null;
  model: string;
  name: string | null;
  size: string | null;
};

/** Date locale du jour au format YYYY-MM-DD (input date) */
function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Formulaire de log de session : date, spot, vent, durée, matos, ressenti */
export function SessionForm({ spots, gear }: { spots: SpotOption[]; gear: GearOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const favorite = spots.find((s) => s.favorite);
  const [date, setDate] = useState(todayISO());
  const [spotId, setSpotId] = useState(favorite?.id ?? "");
  const [durationMin, setDurationMin] = useState("");
  const [windKnots, setWindKnots] = useState("");
  const [notes, setNotes] = useState("");
  const [gearIds, setGearIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function toggleGear(id: string) {
    setGearIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, spotId, durationMin, windKnots, notes, gearIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Erreur");
        setBusy(false);
        return;
      }
      // Reset partiel : on garde le spot, prêt pour la prochaine session
      setDurationMin("");
      setWindKnots("");
      setNotes("");
      setGearIds([]);
      toast("Session loggée 🤙", "success");
      router.refresh();
    } catch {
      setError("Erreur réseau — réessaie");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form trip-form session-form">
      <div className="session-form-row">
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayISO()}
            required
          />
        </label>
        <label>
          Spot (optionnel)
          <select value={spotId} onChange={(e) => setSpotId(e.target.value)}>
            <option value="">—</option>
            {spots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.favorite ? "⭐ " : ""}
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="session-form-row">
        <label>
          Vent (nœuds)
          <input
            value={windKnots}
            onChange={(e) => setWindKnots(e.target.value)}
            placeholder="18"
            inputMode="decimal"
            type="number"
            min={0}
            max={100}
            step="0.5"
          />
        </label>
        <label>
          Durée (minutes)
          <input
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="90"
            inputMode="numeric"
            type="number"
            min={1}
            max={1440}
          />
        </label>
      </div>

      {gear.length > 0 && (
        <fieldset className="session-gear-picker">
          <legend>Matériel utilisé</legend>
          <div className="session-gear-options">
            {gear.map((g) => (
              <label
                key={g.id}
                className={`session-gear-option${gearIds.includes(g.id) ? " selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={gearIds.includes(g.id)}
                  onChange={() => toggleGear(g.id)}
                />
                <span>
                  {gearDisplayName(g)}
                  {g.size ? ` ${g.size}` : ""}
                  <small> · {gearCategoryLabel(g.category)}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label>
        Ressenti / notes (optionnel)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Premières transitions back roll, vent irrégulier en fin de session…"
          rows={3}
          maxLength={2000}
        />
      </label>

      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Enregistrement…" : "Logger la session"}
      </button>
    </form>
  );
}
