/** Types de plan d'eau proposés à la création d'un spot */
export const WATER_TYPES = [
  { id: "flat", label: "Flat" },
  { id: "chop", label: "Clapot" },
  { id: "vagues", label: "Vagues" },
  { id: "mixte", label: "Mixte" },
] as const;

export type WaterTypeId = (typeof WATER_TYPES)[number]["id"];

export function isWaterType(value: string): value is WaterTypeId {
  return WATER_TYPES.some((w) => w.id === value);
}

export function waterTypeLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return WATER_TYPES.find((w) => w.id === id)?.label ?? id;
}

/** Normalise un nom de spot pour comparaison (accents, casse, ponctuation) */
export function normalizeSpotName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/** Distance de Levenshtein (caractères) */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cur =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : 1 + Math.min(row[j - 1], prev, row[j]);
      row[j - 1] = prev;
      prev = cur;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/**
 * Score 0–1 de similarité entre deux noms (1 = identique).
 * Inclut sous-chaîne + proximité caractères.
 */
export function spotNameSimilarity(a: string, b: string): number {
  const na = normalizeSpotName(a);
  const nb = normalizeSpotName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) {
    return (
      0.85 *
      (Math.min(na.length, nb.length) / Math.max(na.length, nb.length))
    );
  }
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return Math.max(0, 1 - dist / maxLen);
}

export type SpotSuggestion = {
  name: string;
  score: number;
  exact: boolean;
};

/** Suggestions triées par similarité (seuil ~0.55) */
export function suggestSpotNames(
  query: string,
  candidates: string[],
  limit = 5
): SpotSuggestion[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const scored: SpotSuggestion[] = [];
  for (const name of candidates) {
    const key = normalizeSpotName(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const score = spotNameSimilarity(q, name);
    if (score < 0.55) continue;
    scored.push({ name, score, exact: score >= 0.99 });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
