/** Sous-modules Figures avancées (ex. handle passes + extrême) */

import {
  resolveFromTable,
  sortNamedSections,
  type SectionFigure,
} from "@/lib/category-sections";

export const HANDLE_PASSES_CATEGORY = "Figures avancées";

export const HANDLE_PASSES_SECTIONS = [
  "Passes de base",
  "3xx",
  "Mobes",
  "KGB & Slim",
  "Avancé",
] as const;

export const HANDLE_PASSES_FIGURES: SectionFigure[] = [
  { slug: "flat-180-pass", section: "Passes de base", order: 101 },
  { slug: "flat-360-pass", section: "Passes de base", order: 102 },
  { slug: "dangle-pass", section: "Passes de base", order: 103 },
  { slug: "handle-pass-ftb", section: "Passes de base", order: 104 },
  { slug: "handle-pass-btf", section: "Passes de base", order: 105 },
  { slug: "three-one-three", section: "3xx", order: 201 },
  { slug: "three-one-five", section: "3xx", order: 203 },
  { slug: "three-one-seven", section: "3xx", order: 204 },
  { slug: "three-one-nine", section: "3xx", order: 205 },
  { slug: "blind-judge", section: "3xx", order: 206 },
  { slug: "blind-313", section: "3xx", order: 207 },
  { slug: "blind-315", section: "3xx", order: 208 },
  { slug: "blind-317", section: "3xx", order: 209 },
  { slug: "blind-319", section: "3xx", order: 210 },
  { slug: "back-mobe", section: "Mobes", order: 301 },
  { slug: "back-mobe-5", section: "Mobes", order: 302 },
  { slug: "back-mobe-7", section: "Mobes", order: 303 },
  { slug: "back-mobe-9", section: "Mobes", order: 304 },
  { slug: "front-mobe", section: "Mobes", order: 305 },
  { slug: "front-blind-mobe", section: "Mobes", order: 306 },
  { slug: "front-mobe-5", section: "Mobes", order: 307 },
  { slug: "front-mobe-7", section: "Mobes", order: 308 },
  { slug: "front-mobe-9", section: "Mobes", order: 309 },
  { slug: "double-front-mobe", section: "Mobes", order: 310 },
  { slug: "s-mobe", section: "Mobes", order: 311 },
  { slug: "s-mobe-5", section: "Mobes", order: 312 },
  { slug: "s-mobe-7", section: "Mobes", order: 313 },
  { slug: "hinterberger-mobe", section: "Mobes", order: 314 },
  { slug: "hinterberger-mobe-5", section: "Mobes", order: 315 },
  { slug: "double-hinterberger", section: "Mobes", order: 316 },
  { slug: "loop-mobe", section: "Mobes", order: 317 },
  { slug: "downloop-mobe", section: "Mobes", order: 318 },
  { slug: "late-mobe", section: "Mobes", order: 319 },
  { slug: "low-mobe", section: "Mobes", order: 320 },
  { slug: "kgb", section: "KGB & Slim", order: 401 },
  { slug: "kgb-5", section: "KGB & Slim", order: 402 },
  { slug: "kgb-7", section: "KGB & Slim", order: 403 },
  { slug: "kgb-9", section: "KGB & Slim", order: 404 },
  { slug: "kgb-to-blind", section: "KGB & Slim", order: 405 },
  { slug: "kgb-to-blind-judge", section: "KGB & Slim", order: 406 },
  { slug: "slim-chance", section: "KGB & Slim", order: 406 },
  { slug: "slim-5", section: "KGB & Slim", order: 407 },
  { slug: "slim-7", section: "KGB & Slim", order: 408 },
  { slug: "slim-9", section: "KGB & Slim", order: 409 },
  { slug: "krypto", section: "Avancé", order: 501 },
  { slug: "krypto-to-sp", section: "Avancé", order: 502 },
  { slug: "wrapped-krypto", section: "Avancé", order: 503 },
  { slug: "jesus", section: "Avancé", order: 504 },
  { slug: "route-66", section: "Avancé", order: 505 },
  { slug: "munchies", section: "Avancé", order: 506 },
  { slug: "nis", section: "Avancé", order: 507 },
  { slug: "s-bend-pass", section: "Avancé", order: 508 },
  { slug: "bel-air", section: "Avancé", order: 509 },
  { slug: "triple-handle-pass", section: "Avancé", order: 510 },
];

export function resolveHandlePassesSection(
  description: string | null | undefined,
  order: number,
  slug?: string
): string | null {
  return resolveFromTable(
    HANDLE_PASSES_SECTIONS,
    HANDLE_PASSES_FIGURES,
    description,
    order,
    slug
  );
}

export function sortHandlePassesSections(sections: string[]): string[] {
  return sortNamedSections(HANDLE_PASSES_SECTIONS, sections);
}
