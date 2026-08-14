/** Sous-modules Wave riding / strapless */

import {
  resolveFromTable,
  sortNamedSections,
  type SectionFigure,
} from "@/lib/category-sections";

export const WAVE_RIDING_CATEGORY = "Wave riding / strapless";

export const WAVE_RIDING_SECTIONS = [
  "Bases",
  "Virages",
  "Manœuvres",
  "Freestyle",
] as const;

export const WAVE_RIDING_FIGURES: SectionFigure[] = [
  { slug: "wave-reading", section: "Bases", order: 101 },
  { slug: "wave-kite-steering", section: "Bases", order: 102 },
  { slug: "wave-beach-start", section: "Bases", order: 103 },
  { slug: "wave-ride-out", section: "Bases", order: 104 },
  { slug: "wave-escape-crash", section: "Bases", order: 105 },
  { slug: "strapless-riding", section: "Bases", order: 106 },
  { slug: "bottom-turn", section: "Virages", order: 201 },
  { slug: "top-turn", section: "Virages", order: 202 },
  { slug: "cutback", section: "Virages", order: 203 },
  { slug: "down-the-line", section: "Virages", order: 204 },
  { slug: "wave-foot-transition", section: "Virages", order: 205 },
  { slug: "off-the-lip", section: "Manœuvres", order: 301 },
  { slug: "foam-climb-backside", section: "Manœuvres", order: 302 },
  { slug: "floater-backside", section: "Manœuvres", order: 303 },
  { slug: "fins-out-backside", section: "Manœuvres", order: 304 },
  { slug: "layback-frontside", section: "Manœuvres", order: 305 },
  { slug: "wave-hang-five", section: "Manœuvres", order: 306 },
  { slug: "aerial", section: "Freestyle", order: 401 },
  { slug: "air-reverse", section: "Freestyle", order: 402 },
  { slug: "strapless-shove-it", section: "Freestyle", order: 403 },
  { slug: "strapless-backroll", section: "Freestyle", order: 404 },
  { slug: "strapless-air", section: "Freestyle", order: 405 },
  { slug: "strapless-freestyle", section: "Freestyle", order: 406 },
];

export function resolveWaveRidingSection(
  description: string | null | undefined,
  order: number,
  slug?: string
): string | null {
  return resolveFromTable(
    WAVE_RIDING_SECTIONS,
    WAVE_RIDING_FIGURES,
    description,
    order,
    slug
  );
}

export function sortWaveRidingSections(sections: string[]): string[] {
  return sortNamedSections(WAVE_RIDING_SECTIONS, sections);
}
