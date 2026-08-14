/** Sous-modules Sauts & Big Air — rolls, raleys, passes, avancé */

import {
  resolveFromTable,
  sortNamedSections,
  type SectionFigure,
} from "@/lib/category-sections";

export const SAUTS_BIG_AIR_CATEGORY = "Sauts & Big Air";

export const SAUTS_BIG_AIR_SECTIONS = [
  "Backroll",
  "Frontroll",
  "Raleys",
  "Passes",
  "Avancé",
] as const;

export const SAUTS_BIG_AIR_FIGURES: SectionFigure[] = [
  { slug: "backroll-simple", section: "Backroll", order: 201 },
  { slug: "backroll-transition", section: "Backroll", order: 202 },
  { slug: "half-backroll-transition", section: "Backroll", order: 203 },
  { slug: "backroll-to-toeside", section: "Backroll", order: 204 },
  { slug: "double-backroll", section: "Backroll", order: 205 },
  { slug: "triple-backroll", section: "Backroll", order: 206 },
  { slug: "backroll-540", section: "Backroll", order: 207 },
  { slug: "backroll-720", section: "Backroll", order: 208 },
  { slug: "backroll-barspin", section: "Backroll", order: 209 },
  { slug: "inverted-backroll-transition", section: "Backroll", order: 210 },
  { slug: "inverted-backroll-onefoot-transition", section: "Backroll", order: 211 },
  { slug: "spin-backside-360", section: "Backroll", order: 212 },
  { slug: "spin-backside-540", section: "Backroll", order: 213 },
  { slug: "tantrum", section: "Backroll", order: 214 },
  { slug: "toeside-backroll", section: "Backroll", order: 215 },
  { slug: "toeside-backroll-5", section: "Backroll", order: 216 },
  // Frontroll
  { slug: "frontroll-simple", section: "Frontroll", order: 301 },
  { slug: "frontroll-transition", section: "Frontroll", order: 302 },
  { slug: "frontroll-to-toeside", section: "Frontroll", order: 303 },
  { slug: "frontroll-to-blind", section: "Frontroll", order: 304 },
  { slug: "inverted-frontroll", section: "Frontroll", order: 305 },
  { slug: "inverted-frontroll-onefoot", section: "Frontroll", order: 306 },
  { slug: "double-frontroll", section: "Frontroll", order: 307 },
  { slug: "triple-frontroll", section: "Frontroll", order: 308 },
  { slug: "frontroll-540", section: "Frontroll", order: 309 },
  { slug: "frontroll-720", section: "Frontroll", order: 310 },
  { slug: "frantrum", section: "Frontroll", order: 311 },
  { slug: "frontroll-onefoot-transition", section: "Frontroll", order: 312 },
  { slug: "no-hand-frontroll", section: "Frontroll", order: 313 },
  { slug: "spin-frontside-360", section: "Frontroll", order: 314 },
  { slug: "spin-frontside-540", section: "Frontroll", order: 315 },
  { slug: "toeside-frontroll", section: "Frontroll", order: 316 },
  { slug: "toeside-frontroll-5", section: "Frontroll", order: 317 },
  // Toeside raleys / passes / avancé (ex-catégorie Toeside)
  { slug: "toeside-raley", section: "Raleys", order: 401 },
  { slug: "toeside-r2b", section: "Raleys", order: 402 },
  { slug: "toeside-raley-to-toeside", section: "Raleys", order: 403 },
  { slug: "toeside-raley-to-wrapped", section: "Raleys", order: 404 },
  { slug: "pete-rose", section: "Passes", order: 501 },
  { slug: "pete-rose-5", section: "Passes", order: 502 },
  { slug: "pete-rose-7", section: "Passes", order: 503 },
  { slug: "scarecrow", section: "Passes", order: 504 },
  { slug: "crow-mobe", section: "Passes", order: 505 },
  { slug: "crow-mobe-5", section: "Passes", order: 506 },
  { slug: "crow-mobe-7", section: "Passes", order: 507 },
  { slug: "crow-mobe-9", section: "Passes", order: 508 },
  { slug: "toeside-backside-313", section: "Passes", order: 509 },
  { slug: "toeside-backside-315", section: "Passes", order: 510 },
  { slug: "tootsie-roll-pass", section: "Passes", order: 511 },
  { slug: "g-spot", section: "Passes", order: 512 },
  { slug: "c7", section: "Passes", order: 513 },
  { slug: "c7-5", section: "Passes", order: 514 },
  { slug: "c10", section: "Passes", order: 515 },
  { slug: "fruit-loop", section: "Avancé", order: 601 },
  { slug: "flavor-flip", section: "Avancé", order: 602 },
  { slug: "nine-o-two-one-o", section: "Avancé", order: 603 },
  { slug: "oh-really", section: "Avancé", order: 604 },
  { slug: "blind-pete", section: "Avancé", order: 605 },
  { slug: "dum-dum", section: "Avancé", order: 606 },
  { slug: "dum-dum-5", section: "Avancé", order: 607 },
];

/** Figures Sauts hors roll (saut droit, tabletop…) → pas de sous-module */
export const SAUTS_UNSECTIONED_SLUGS = [
  "saut-droit",
  "sent-jump",
  "glide",
  "inverted-jump",
  "tabletop",
  "low-kite-jump",
  "low-kite-jump-advanced",
  "jump-transition-grab",
  "toeside-ole",
] as const;

export function resolveSautsBigAirSection(
  description: string | null | undefined,
  order: number,
  slug?: string,
  name?: string
): string | null {
  if (slug && (SAUTS_UNSECTIONED_SLUGS as readonly string[]).includes(slug)) {
    return null;
  }
  const fromTable = resolveFromTable(
    SAUTS_BIG_AIR_SECTIONS,
    SAUTS_BIG_AIR_FIGURES,
    description,
    order,
    slug
  );
  if (fromTable) return fromTable;
  const hay = `${slug ?? ""} ${name ?? ""}`.toLowerCase();
  if (hay.includes("raley") || hay.includes("r2b")) return "Raleys";
  if (
    hay.includes("frontroll") ||
    hay.includes("frantrum") ||
    hay.includes("frontside-spin")
  ) {
    return "Frontroll";
  }
  if (
    hay.includes("backroll") ||
    hay.includes("backside-spin") ||
    hay.includes("tantrum")
  ) {
    return "Backroll";
  }
  return null;
}

export function sortSautsBigAirSections(sections: string[]): string[] {
  return sortNamedSections(SAUTS_BIG_AIR_SECTIONS, sections);
}
