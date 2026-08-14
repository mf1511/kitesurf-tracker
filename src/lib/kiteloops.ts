/** Sous-modules Kiteloops & loops */

import {
  resolveFromTable,
  sortNamedSections,
  type SectionFigure,
} from "@/lib/category-sections";

export const KITELOOPS_CATEGORY = "Kiteloops & loops";

export const KITELOOPS_SECTIONS = [
  "Bases",
  "En saut",
  "Big air",
  "Combos",
] as const;

export const KITELOOPS_FIGURES: SectionFigure[] = [
  { slug: "down-loop", section: "Bases", order: 101 },
  { slug: "down-loop-transition", section: "Bases", order: 102 },
  { slug: "kite-loop-simple", section: "Bases", order: 103 },
  { slug: "heli-loop", section: "Bases", order: 104 },
  { slug: "kite-loop-pendant-saut", section: "En saut", order: 201 },
  { slug: "backroll-kite-loop", section: "En saut", order: 202 },
  { slug: "frontroll-kite-loop", section: "En saut", order: 203 },
  { slug: "megaloop", section: "Big air", order: 301 },
  { slug: "double-kite-loop", section: "Big air", order: 302 },
  { slug: "triple-kite-loop", section: "Big air", order: 303 },
  { slug: "s-loop", section: "Big air", order: 304 },
  { slug: "contra-loop", section: "Big air", order: 305 },
  { slug: "boogie-loop", section: "Big air", order: 306 },
  { slug: "doobie-loop", section: "Big air", order: 307 },
  { slug: "slider-loop", section: "Big air", order: 308 },
  { slug: "f16", section: "Big air", order: 309 },
  { slug: "snake-loop", section: "Big air", order: 310 },
  { slug: "kite-loop-board-off", section: "Combos", order: 401 },
  { slug: "unhooked-kite-loop", section: "Combos", order: 402 },
  { slug: "raley-kite-loop", section: "Combos", order: 403 },
  { slug: "loop-transition-unhooked", section: "Combos", order: 404 },
  { slug: "kiteloop-3", section: "Combos", order: 405 },
];

export function resolveKiteloopsSection(
  description: string | null | undefined,
  order: number,
  slug?: string
): string | null {
  return resolveFromTable(
    KITELOOPS_SECTIONS,
    KITELOOPS_FIGURES,
    description,
    order,
    slug
  );
}

export function sortKiteloopsSections(sections: string[]): string[] {
  return sortNamedSections(KITELOOPS_SECTIONS, sections);
}
