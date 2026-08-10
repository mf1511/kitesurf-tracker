import {
  degToCompass,
  parseKiteSize,
  rateWind,
  recommendWingSize,
  type SpotForecast,
} from "@/lib/weather";
import { gearDisplayName } from "@/lib/gear";

type Kite = {
  id: string;
  brand: string | null;
  model: string;
  name: string | null;
  size: string | null;
};

/** Aile du quiver la plus proche de la taille idéale (±1,5 m² max) */
function bestKite(kites: Kite[], ideal: number): Kite | null {
  let best: Kite | null = null;
  let bestDelta = 1.5;
  for (const k of kites) {
    const size = parseKiteSize(k.size);
    if (size == null) continue;
    const delta = Math.abs(size - ideal);
    if (delta <= bestDelta) {
      best = k;
      bestDelta = delta;
    }
  }
  return best;
}

/** Prévisions vent 7 jours d'un spot + conditions actuelles + aile conseillée */
export function WindForecast({
  forecast,
  weightKg,
  kites,
}: {
  forecast: SpotForecast;
  weightKg: number | null;
  kites: Kite[];
}) {
  const { now, days } = forecast;
  const nowRating = rateWind(now.windKnots);

  return (
    <div className="wind-forecast">
      {/* Conditions actuelles */}
      <div className={`wind-now wind-${nowRating.id}`}>
        <span className="wind-now-emoji" aria-hidden>
          {nowRating.emoji}
        </span>
        <div>
          <strong>
            {now.windKnots} nds{" "}
            <span className="wind-gust">(raf. {now.gustKnots})</span>
          </strong>
          <span className="wind-now-detail">
            {nowRating.label} · {degToCompass(now.directionDeg)} · {now.temp}°C
          </span>
        </div>
      </div>

      {/* 7 jours */}
      <ul className="wind-days">
        {days.map((d) => {
          const rating = rateWind(d.windKnots);
          const reco = weightKg ? recommendWingSize(weightKg, d.windKnots) : null;
          const kite = reco ? bestKite(kites, reco.ideal) : null;
          const dayLabel = new Date(`${d.date}T12:00:00`).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

          return (
            <li key={d.date} className={`wind-day wind-${rating.id}`}>
              <span className="wind-day-date">{dayLabel}</span>
              <span className="wind-day-emoji" title={rating.label} aria-label={rating.label}>
                {rating.emoji}
              </span>
              <span className="wind-day-speed">
                <strong>{d.windKnots} nds</strong>
                <span className="wind-gust">raf. {d.gustKnots}</span>
              </span>
              <span
                className="wind-day-dir"
                title={`Vent de ${degToCompass(d.directionDeg)}`}
              >
                <span
                  className="wind-arrow"
                  aria-hidden
                  style={{ transform: `rotate(${d.directionDeg + 180}deg)` }}
                >
                  ↑
                </span>
                {degToCompass(d.directionDeg)}
              </span>
              <span className="wind-day-temp">
                {d.tempMax}°{d.rainProb != null && d.rainProb >= 40 ? " 🌧️" : ""}
              </span>
              <span className="wind-day-reco">
                {reco ? (
                  <>
                    {reco.ideal} m²
                    {kite && (
                      <span className="wind-reco-kite">→ {gearDisplayName(kite)}</span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
