/** Sous-modules Surface tricks & drags */

import {
  resolveFromTable,
  sortNamedSections,
  type SectionFigure,
} from "@/lib/category-sections";

export const SURFACE_TRICKS_CATEGORY = "Surface tricks & drags";

export const SURFACE_TRICKS_SECTIONS = [
  "Drags",
  "Slides",
  "Darkslide",
  "Blind",
] as const;

export const SURFACE_TRICKS_FIGURES: SectionFigure[] = [
  { slug: "hand-drag-basique", section: "Drags", order: 101 },
  { slug: "foot-drag", section: "Drags", order: 102 },
  { slug: "grab-drag", section: "Drags", order: 103 },
  { slug: "hand-drag-transition", section: "Drags", order: 104 },
  { slug: "one-foot-drag-transition", section: "Drags", order: 105 },
  { slug: "hand-drag-backroll", section: "Drags", order: 106 },
  { slug: "frontroll-handdrag", section: "Drags", order: 107 },
  { slug: "one-foot-slide", section: "Slides", order: 201 },
  { slug: "toeslide", section: "Slides", order: 202 },
  { slug: "moonslide", section: "Slides", order: 203 },
  { slug: "bodyslide", section: "Slides", order: 204 },
  { slug: "lizard-slide", section: "Slides", order: 205 },
  { slug: "barefoot-slide", section: "Slides", order: 206 },
  { slug: "jesus-walk", section: "Slides", order: 207 },
  { slug: "tootsie-roll-surface", section: "Slides", order: 208 },
  { slug: "darkslide", section: "Darkslide", order: 301 },
  { slug: "darkslide-onefoot", section: "Darkslide", order: 302 },
  { slug: "darkslide-backroll-out", section: "Darkslide", order: 303 },
  { slug: "darkslide-frontroll-to-blind", section: "Darkslide", order: 304 },
  { slug: "riding-blind", section: "Blind", order: 401 },
  { slug: "ollie-to-blind", section: "Blind", order: 402 },
  { slug: "ollie-toeside-to-blind", section: "Blind", order: 403 },
  { slug: "surface-pass", section: "Blind", order: 404 },
  { slug: "surface-backroll-transition", section: "Blind", order: 405 },
  { slug: "surface-backroll-360", section: "Blind", order: 406 },
  { slug: "blind-to-toeside-transition", section: "Blind", order: 407 },
  { slug: "blind-ole", section: "Blind", order: 408 },
  { slug: "tic-tac-toe", section: "Blind", order: 409 },
];

export function resolveSurfaceTricksSection(
  description: string | null | undefined,
  order: number,
  slug?: string
): string | null {
  return resolveFromTable(
    SURFACE_TRICKS_SECTIONS,
    SURFACE_TRICKS_FIGURES,
    description,
    order,
    slug
  );
}

export function sortSurfaceTricksSections(sections: string[]): string[] {
  return sortNamedSections(SURFACE_TRICKS_SECTIONS, sections);
}
