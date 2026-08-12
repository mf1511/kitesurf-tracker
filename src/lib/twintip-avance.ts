/** Sous-modules formation Twintip avancé (ordre pédagogique OLK) */

export const TWINTIP_AVANCE_CATEGORY = "Twintip avancé";

/** Slugs existants qui ont reçu des vidéos via merge (import OLK) */
export const TWINTIP_AVANCE_MERGE_FIGURE_SLUGS = new Set([
  "transition-simple",
  "saut-droit",
  "grab-tail",
  "one-foot-air",
  "board-off",
  "backroll-simple",
  "frontroll-simple",
  "jump-transition",
  "backroll-transition",
  "kite-loop-simple",
  "kite-loop-pendant-saut",
  "hand-drag-backroll",
  "darkslide",
  "toe-side-riding",
  "riding-blind",
]);

/** Créations hors catégorie (overrides import) */
const TWINTIP_AVANCE_CREATE_FIGURE_SLUGS = new Set([
  "beach-start",
  "one-hand-jump",
  "low-kite-jump",
  "low-kite-jump-advanced",
  "jump-transition-grab",
  "toeslide",
  "moonslide",
  "toeside-ole",
  "blind-ole",
]);

/** Figure issue de / touchée par l’import Twintip avancé (repère UI « Bientôt ») */
export function isTwintipAvanceImportFigure(f: {
  slug: string;
  category: string;
  description?: string | null;
}): boolean {
  if (f.category === TWINTIP_AVANCE_CATEGORY) return true;
  if (f.slug.startsWith("avance-")) return true;
  if (f.description?.includes("Twintip avancé")) return true;
  if (TWINTIP_AVANCE_MERGE_FIGURE_SLUGS.has(f.slug)) return true;
  if (TWINTIP_AVANCE_CREATE_FIGURE_SLUGS.has(f.slug)) return true;
  return false;
}

export const TWINTIP_AVANCE_SECTIONS = [
  "Bienvenue",
  "Aborder la progression",
  "Comprendre la portance",
  "Le saut aile haute",
  "Les sauts à une main",
  "Les sauts aile basse",
  "Les rotations",
  "Les sauts transitions",
  "Les kiteloops",
  "Les slides",
  "Les positions de navigation",
  "Les olés",
  "La pratique solo",
] as const;

export type TwintipAvanceSection = (typeof TWINTIP_AVANCE_SECTIONS)[number];

/** Export Drive → libellé UI */
const SECTION_ALIASES: Record<string, string> = {
  "Le saut haile haute": "Le saut aile haute",
  "Les olés": "Les olés",
  "Les olés": "Les olés",
};

export function normalizeTwintipAvanceSection(name: string): string {
  const t = name.trim().normalize("NFC");
  return SECTION_ALIASES[t] ?? t;
}

export function parseTwintipAvanceSection(
  description: string | null | undefined
): string | null {
  if (!description) return null;
  const m = description.match(/Module\s*«\s*([^»]+)\s*»/u);
  if (!m?.[1]) return null;
  return normalizeTwintipAvanceSection(m[1]);
}

export function twintipAvanceSectionFromOrder(order: number): string | null {
  const idx = Math.floor(order / 100) - 1;
  return TWINTIP_AVANCE_SECTIONS[idx] ?? null;
}

export function resolveTwintipAvanceSection(
  description: string | null | undefined,
  order: number
): string | null {
  return (
    parseTwintipAvanceSection(description) ??
    twintipAvanceSectionFromOrder(order)
  );
}

export function sortTwintipAvanceSections(sections: string[]): string[] {
  return [...sections].sort((a, b) => {
    const ia = TWINTIP_AVANCE_SECTIONS.indexOf(a as TwintipAvanceSection);
    const ib = TWINTIP_AVANCE_SECTIONS.indexOf(b as TwintipAvanceSection);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, "fr");
  });
}
