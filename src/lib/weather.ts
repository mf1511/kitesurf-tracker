/**
 * Météo vent via Open-Meteo (gratuit, sans clé API).
 * Vitesses demandées directement en nœuds (wind_speed_unit=kn).
 */

export type WindDay = {
  /** Date ISO (YYYY-MM-DD) */
  date: string;
  windKnots: number;
  gustKnots: number;
  /** Direction dominante en degrés (d'où vient le vent) */
  directionDeg: number;
  tempMax: number;
  /** Probabilité de précipitations max (%) — peut être null la nuit */
  rainProb: number | null;
};

export type WindNow = {
  windKnots: number;
  gustKnots: number;
  directionDeg: number;
  temp: number;
};

export type SpotForecast = {
  now: WindNow;
  days: WindDay[];
};

/** Prévisions 7 jours + conditions actuelles pour un point GPS. Throw si API down. */
export async function fetchSpotForecast(latitude: number, longitude: number): Promise<SpotForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m",
    daily:
      "wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,temperature_2m_max,precipitation_probability_max",
    wind_speed_unit: "kn",
    timezone: "auto",
    forecast_days: "7",
  });

  // Cache serveur 30 min : suffisant pour de la prévision, évite de spammer l'API
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();

  const now: WindNow = {
    windKnots: Math.round(json.current.wind_speed_10m),
    gustKnots: Math.round(json.current.wind_gusts_10m),
    directionDeg: json.current.wind_direction_10m,
    temp: Math.round(json.current.temperature_2m),
  };

  const days: WindDay[] = (json.daily.time as string[]).map((date, i) => ({
    date,
    windKnots: Math.round(json.daily.wind_speed_10m_max[i]),
    gustKnots: Math.round(json.daily.wind_gusts_10m_max[i]),
    directionDeg: json.daily.wind_direction_10m_dominant[i],
    tempMax: Math.round(json.daily.temperature_2m_max[i]),
    rainProb: json.daily.precipitation_probability_max?.[i] ?? null,
  }));

  return { now, days };
}

/** Degrés → point cardinal (16 secteurs, style FR : "NO", "SSE"…) */
export function degToCompass(deg: number): string {
  const dirs = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

export type KiteRating = {
  id: "no-wind" | "light" | "good" | "strong" | "extreme";
  label: string;
  emoji: string;
};

/** Qualité kite d'un vent donné (nœuds) */
export function rateWind(knots: number): KiteRating {
  if (knots < 8) return { id: "no-wind", label: "Pas de vent", emoji: "😴" };
  if (knots < 12) return { id: "light", label: "Vent léger", emoji: "🪁" };
  if (knots <= 25) return { id: "good", label: "Conditions idéales", emoji: "🤙" };
  if (knots <= 35) return { id: "strong", label: "Vent fort", emoji: "💪" };
  return { id: "extreme", label: "Extrême — prudence", emoji: "⚠️" };
}

/**
 * Assistant taille d'aile — heuristique freeride twintip :
 * taille (m²) ≈ poids (kg) × 2.7 / vent (nœuds), bornée à [3, 19].
 * Retourne la taille idéale + une fourchette ±1 m².
 */
export function recommendWingSize(weightKg: number, windKnots: number) {
  if (windKnots < 6 || weightKg <= 0) return null;
  const ideal = Math.min(19, Math.max(3, (weightKg * 2.7) / windKnots));
  return {
    ideal: Math.round(ideal * 10) / 10,
    min: Math.round(Math.max(3, ideal - 1)),
    max: Math.round(Math.min(19, ideal + 1)),
  };
}

/** Parse la taille d'une aile du quiver ("9", "9m", "9.0 m²"…) → m² ou null */
export function parseKiteSize(size: string | null | undefined): number | null {
  if (!size) return null;
  const m = size.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 2 && n <= 25 ? n : null;
}
