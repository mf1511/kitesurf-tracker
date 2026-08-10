"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WATER_TYPES } from "@/lib/spots";
import { useToast } from "@/components/ui/toast";

/** Formulaire de création de spot — coordonnées manuelles ou géolocalisation */
export function SpotForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [windOrientation, setWindOrientation] = useState("");
  const [waterType, setWaterType] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  /** Remplit lat/lng depuis la position du device */
  function useMyPosition() {
    if (!navigator.geolocation) {
      toast("Géolocalisation non disponible sur cet appareil", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(5));
        setLongitude(pos.coords.longitude.toFixed(5));
        setLocating(false);
      },
      () => {
        toast("Impossible de récupérer ta position", "error");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, latitude, longitude, windOrientation, waterType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Erreur");
        setBusy(false);
        return;
      }
      // Reset + refresh de la liste serveur
      setName("");
      setLatitude("");
      setLongitude("");
      setWindOrientation("");
      setWaterType("");
      toast(`Spot « ${data.spot.name} » ajouté 🤙`, "success");
      router.refresh();
    } catch {
      setError("Erreur réseau — réessaie");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form trip-form spot-form">
      <label>
        Nom du spot
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Almanarre, Leucate, Dakhla…"
          required
          maxLength={80}
        />
      </label>

      <div className="spot-coords-row">
        <label>
          Latitude
          <input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="43.0937"
            inputMode="decimal"
            required
          />
        </label>
        <label>
          Longitude
          <input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="6.1489"
            inputMode="decimal"
            required
          />
        </label>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={useMyPosition}
          disabled={locating}
        >
          {locating ? "Localisation…" : "📍 Ma position"}
        </button>
      </div>

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
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Ajout…" : "Ajouter le spot"}
      </button>
    </form>
  );
}
