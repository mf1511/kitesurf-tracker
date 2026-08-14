/** Sous-modules Unhooked freestyle */

import {
  resolveFromTable,
  sortNamedSections,
  type SectionFigure,
} from "@/lib/category-sections";

export const UNHOOKED_CATEGORY = "Unhooked freestyle";

export const UNHOOKED_SECTIONS = [
  "Setup",
  "Raleys",
  "S-bends",
  "Rolls",
  "Blind",
  "Avancé",
] as const;

export const UNHOOKED_FIGURES: SectionFigure[] = [
  { slug: "chicken-loop-unhook-air", section: "Setup", order: 101 },
  { slug: "raley-front", section: "Raleys", order: 201 },
  { slug: "raley-back", section: "Raleys", order: 202 },
  { slug: "raley-to-blind", section: "Raleys", order: 203 },
  { slug: "raley-to-toeside", section: "Raleys", order: 204 },
  { slug: "wrapped-raley", section: "Raleys", order: 205 },
  { slug: "s-bend-unhooked", section: "S-bends", order: 301 },
  { slug: "double-s-bend", section: "S-bends", order: 302 },
  { slug: "s-bend-to-blind", section: "S-bends", order: 303 },
  { slug: "s-bend-to-toeside", section: "S-bends", order: 304 },
  { slug: "s-bend-to-wrapped", section: "S-bends", order: 305 },
  { slug: "s-bend-to-blind-airpass", section: "S-bends", order: 306 },
  { slug: "unhooked-backroll", section: "Rolls", order: 401 },
  { slug: "unhooked-frontroll", section: "Rolls", order: 402 },
  { slug: "unhooked-backroll-to-toeside", section: "Rolls", order: 403 },
  { slug: "unhooked-frontroll-to-toeside", section: "Rolls", order: 404 },
  { slug: "unhooked-backroll-to-wrapped", section: "Rolls", order: 405 },
  { slug: "unhooked-frontroll-to-wrapped", section: "Rolls", order: 406 },
  { slug: "backroll-to-blind-airpass", section: "Rolls", order: 407 },
  { slug: "frontroll-to-blind-airpass", section: "Rolls", order: 408 },
  { slug: "front-to-blind", section: "Blind", order: 501 },
  { slug: "back-to-blind", section: "Blind", order: 502 },
  { slug: "vulcan", section: "Avancé", order: 601 },
  { slug: "vulcan-to-sp", section: "Avancé", order: 602 },
  { slug: "nine-one-one", section: "Avancé", order: 603 },
  { slug: "tantrum-unhooked", section: "Avancé", order: 604 },
  { slug: "whirlybird", section: "Avancé", order: 605 },
  { slug: "whirlybird-540", section: "Avancé", order: 606 },
  { slug: "moby-dick", section: "Avancé", order: 607 },
  { slug: "moby-dick-540", section: "Avancé", order: 608 },
];

export function resolveUnhookedSection(
  description: string | null | undefined,
  order: number,
  slug?: string
): string | null {
  return resolveFromTable(
    UNHOOKED_SECTIONS,
    UNHOOKED_FIGURES,
    description,
    order,
    slug
  );
}

export function sortUnhookedSections(sections: string[]): string[] {
  return sortNamedSections(UNHOOKED_SECTIONS, sections);
}
