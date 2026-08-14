/** Sous-modules Old school / grabs / board-offs */

import {
  resolveFromTable,
  sortNamedSections,
  type SectionFigure,
} from "@/lib/category-sections";

export const OLD_SCHOOL_CATEGORY = "Old school / grabs / board-offs";

export const OLD_SCHOOL_SECTIONS = ["Grabs", "Board-offs", "Old school"] as const;

export const OLD_SCHOOL_FIGURES: SectionFigure[] = [
  { slug: "pop-to-grab", section: "Grabs", order: 101 },
  { slug: "grab-indy", section: "Grabs", order: 102 },
  { slug: "grab-mute", section: "Grabs", order: 103 },
  { slug: "grab-tail", section: "Grabs", order: 104 },
  { slug: "grab-nose", section: "Grabs", order: 105 },
  { slug: "grab-method", section: "Grabs", order: 106 },
  { slug: "grab-roast-beef", section: "Grabs", order: 107 },
  { slug: "grab-seatbelt", section: "Grabs", order: 108 },
  { slug: "grab-slob", section: "Grabs", order: 109 },
  { slug: "backroll-grab", section: "Grabs", order: 110 },
  { slug: "frontroll-grab", section: "Grabs", order: 111 },
  { slug: "frontroll-stalefish", section: "Grabs", order: 112 },
  { slug: "frontroll-tailgrab", section: "Grabs", order: 113 },
  { slug: "crail-glide", section: "Grabs", order: 114 },
  { slug: "mute-glide-toeside", section: "Grabs", order: 115 },
  { slug: "board-off", section: "Board-offs", order: 201 },
  { slug: "board-off-fin", section: "Board-offs", order: 202 },
  { slug: "board-off-tail", section: "Board-offs", order: 203 },
  { slug: "board-off-spin", section: "Board-offs", order: 204 },
  { slug: "flip-board-off", section: "Board-offs", order: 205 },
  { slug: "tic-tac-board-off", section: "Board-offs", order: 207 },
  { slug: "double-frontroll-board-off", section: "Board-offs", order: 208 },
  { slug: "upside-down-fin-board-off", section: "Board-offs", order: 209 },
  { slug: "upside-down-boardoff-double-frontroll", section: "Board-offs", order: 210 },
  { slug: "one-foot-air", section: "Old school", order: 301 },
  { slug: "one-foot-transition", section: "Old school", order: 302 },
  { slug: "heart-attack", section: "Old school", order: 303 },
  { slug: "varial", section: "Old school", order: 304 },
  { slug: "wizard", section: "Old school", order: 305 },
  { slug: "board-pass", section: "Old school", order: 306 },
  { slug: "shifty", section: "Old school", order: 307 },
  { slug: "rocket-air", section: "Old school", order: 308 },
  { slug: "air-raley-old-school", section: "Old school", order: 309 },
  { slug: "superman", section: "Old school", order: 310 },
  { slug: "stiffy", section: "Old school", order: 311 },
  { slug: "handstand", section: "Old school", order: 312 },
  { slug: "deadman", section: "Old school", order: 313 },
];

export function resolveOldSchoolSection(
  description: string | null | undefined,
  order: number,
  slug?: string
): string | null {
  return resolveFromTable(
    OLD_SCHOOL_SECTIONS,
    OLD_SCHOOL_FIGURES,
    description,
    order,
    slug
  );
}

export function sortOldSchoolSections(sections: string[]): string[] {
  return sortNamedSections(OLD_SCHOOL_SECTIONS, sections);
}
