/** Sous-modules de la formation Débuter (ordre pédagogique) */
export const DEBUTER_SECTIONS = [
  "Les bases essentielles",
  "Le choix du matériel",
  "Régler son matériel",
  "Sur la plage",
  "À l'eau",
  "La sécurité",
  "Adapter sa pratique",
  "La pratique solo",
  "Les sauts à une main",
] as const;

export type DebuterSection = (typeof DEBUTER_SECTIONS)[number];

const SECTION_BY_INDEX: Record<number, DebuterSection> = {
  1: "Les bases essentielles",
  2: "Le choix du matériel",
  3: "Régler son matériel",
  4: "Sur la plage",
  5: "À l'eau",
  6: "La sécurité",
  7: "Adapter sa pratique",
  8: "La pratique solo",
  9: "Les sauts à une main",
};

/** Alias issus de l’export Drive (ex. « À l_eau ») */
const SECTION_ALIASES: Record<string, DebuterSection> = {
  "À l_eau": "À l'eau",
  "A l_eau": "À l'eau",
  "A l'eau": "À l'eau",
};

/** Normalise le libellé de sous-section (Drive → UI) */
export function normalizeDebuterSection(name: string): string {
  const t = name.trim();
  return SECTION_ALIASES[t] ?? t;
}

/** Extrait « Module « X » » de la description importée */
export function parseDebuterSection(description: string | null | undefined): string | null {
  if (!description) return null;
  const m = description.match(/Module\s*«\s*([^»]+)\s*»/u);
  if (!m?.[1]) return null;
  return normalizeDebuterSection(m[1]);
}

/** Fallback via order (101 → module 1, 205 → module 2, …) */
export function debuterSectionFromOrder(order: number): string | null {
  return SECTION_BY_INDEX[Math.floor(order / 100)] ?? null;
}

export function resolveDebuterSection(
  description: string | null | undefined,
  order: number
): string | null {
  return parseDebuterSection(description) ?? debuterSectionFromOrder(order);
}

/** Trie les sous-sections dans l’ordre pédagogique (inconnues à la fin) */
export function sortDebuterSections(sections: string[]): string[] {
  return [...sections].sort((a, b) => {
    const ia = DEBUTER_SECTIONS.indexOf(a as DebuterSection);
    const ib = DEBUTER_SECTIONS.indexOf(b as DebuterSection);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, "fr");
  });
}
