/** Résout / trie les sous-modules selon la catégorie */

import {
  BASES_TRANSITIONS_CATEGORY,
  BASES_TRANSITIONS_SECTIONS,
  resolveBasesTransitionsSection,
  sortBasesTransitionsSections,
} from "@/lib/bases-transitions";
import {
  DEBUTER_SECTIONS,
  resolveDebuterSection,
  sortDebuterSections,
} from "@/lib/debuter";
import {
  HANDLE_PASSES_CATEGORY,
  HANDLE_PASSES_SECTIONS,
  resolveHandlePassesSection,
  sortHandlePassesSections,
} from "@/lib/handle-passes";
import {
  KITEFOIL_CATEGORY,
  KITEFOIL_SECTIONS,
  resolveKitefoilSection,
  sortKitefoilSections,
} from "@/lib/kitefoil";
import {
  KITELOOPS_CATEGORY,
  KITELOOPS_SECTIONS,
  resolveKiteloopsSection,
  sortKiteloopsSections,
} from "@/lib/kiteloops";
import {
  OLD_SCHOOL_CATEGORY,
  OLD_SCHOOL_SECTIONS,
  resolveOldSchoolSection,
  sortOldSchoolSections,
} from "@/lib/old-school";
import {
  resolveSautsBigAirSection,
  SAUTS_BIG_AIR_CATEGORY,
  SAUTS_BIG_AIR_SECTIONS,
  sortSautsBigAirSections,
} from "@/lib/sauts-big-air";
import {
  resolveStraplessSection,
  sortStraplessSections,
  STRAPLESS_CATEGORY,
  STRAPLESS_SECTIONS,
} from "@/lib/strapless";
import {
  resolveSurfaceTricksSection,
  sortSurfaceTricksSections,
  SURFACE_TRICKS_CATEGORY,
  SURFACE_TRICKS_SECTIONS,
} from "@/lib/surface-tricks";
import {
  resolveUnhookedSection,
  sortUnhookedSections,
  UNHOOKED_CATEGORY,
  UNHOOKED_SECTIONS,
} from "@/lib/unhooked";
import {
  resolveWaveRidingSection,
  sortWaveRidingSections,
  WAVE_RIDING_CATEGORY,
  WAVE_RIDING_SECTIONS,
} from "@/lib/wave-riding";
import {
  resolveWingfoilSection,
  sortWingfoilSections,
  WINGFOIL_CATEGORY,
  WINGFOIL_SECTIONS,
} from "@/lib/wingfoil";

type Resolver = (
  description: string | null | undefined,
  order: number,
  slug?: string,
  name?: string
) => string | null;

const SECTIONED: {
  category: string;
  resolve: Resolver;
  sort: (sections: string[]) => string[];
}[] = [
  {
    category: "Débuter",
    resolve: (d, o) => resolveDebuterSection(d, o),
    sort: sortDebuterSections,
  },
  {
    category: SAUTS_BIG_AIR_CATEGORY,
    resolve: (d, o, s, n) => resolveSautsBigAirSection(d, o, s, n),
    sort: sortSautsBigAirSections,
  },
  {
    category: BASES_TRANSITIONS_CATEGORY,
    resolve: (d, _o, s, n) => resolveBasesTransitionsSection(d, s, n),
    sort: sortBasesTransitionsSections,
  },
  {
    category: KITEFOIL_CATEGORY,
    resolve: (d, o, s, n) => resolveKitefoilSection(d, o, s, n),
    sort: sortKitefoilSections,
  },
  {
    category: WINGFOIL_CATEGORY,
    resolve: (d, o, s, n) => resolveWingfoilSection(d, o, s, n),
    sort: sortWingfoilSections,
  },
  {
    category: STRAPLESS_CATEGORY,
    resolve: (d, o, s, n) => resolveStraplessSection(d, o, s, n),
    sort: sortStraplessSections,
  },
  {
    category: WAVE_RIDING_CATEGORY,
    resolve: (d, o, s) => resolveWaveRidingSection(d, o, s),
    sort: sortWaveRidingSections,
  },
  {
    category: SURFACE_TRICKS_CATEGORY,
    resolve: (d, o, s) => resolveSurfaceTricksSection(d, o, s),
    sort: sortSurfaceTricksSections,
  },
  {
    category: OLD_SCHOOL_CATEGORY,
    resolve: (d, o, s) => resolveOldSchoolSection(d, o, s),
    sort: sortOldSchoolSections,
  },
  {
    category: KITELOOPS_CATEGORY,
    resolve: (d, o, s) => resolveKiteloopsSection(d, o, s),
    sort: sortKiteloopsSections,
  },
  {
    category: UNHOOKED_CATEGORY,
    resolve: (d, o, s) => resolveUnhookedSection(d, o, s),
    sort: sortUnhookedSections,
  },
  {
    category: HANDLE_PASSES_CATEGORY,
    resolve: (d, o, s) => resolveHandlePassesSection(d, o, s),
    sort: sortHandlePassesSections,
  },
];

function findSectioned(category: string) {
  return SECTIONED.find((s) => s.category === category);
}

export function categoryHasSections(category: string): boolean {
  return !!findSectioned(category);
}

export function resolveFigureSection(
  category: string,
  description: string | null | undefined,
  order: number,
  slug?: string,
  name?: string
): string | null {
  return findSectioned(category)?.resolve(description, order, slug, name) ?? null;
}

export function sortFigureSections(
  category: string,
  sections: string[]
): string[] {
  return findSectioned(category)?.sort(sections) ?? sortDebuterSections(sections);
}

/** Liste des sous-modules connus pour une catégorie (admin / selects) */
export function sectionsForCategory(category: string): string[] {
  const lists: Record<string, readonly string[]> = {
    Débuter: DEBUTER_SECTIONS,
    [SAUTS_BIG_AIR_CATEGORY]: SAUTS_BIG_AIR_SECTIONS,
    [BASES_TRANSITIONS_CATEGORY]: BASES_TRANSITIONS_SECTIONS,
    [KITEFOIL_CATEGORY]: KITEFOIL_SECTIONS,
    [WINGFOIL_CATEGORY]: WINGFOIL_SECTIONS,
    [STRAPLESS_CATEGORY]: STRAPLESS_SECTIONS,
    [WAVE_RIDING_CATEGORY]: WAVE_RIDING_SECTIONS,
    [SURFACE_TRICKS_CATEGORY]: SURFACE_TRICKS_SECTIONS,
    [OLD_SCHOOL_CATEGORY]: OLD_SCHOOL_SECTIONS,
    [KITELOOPS_CATEGORY]: KITELOOPS_SECTIONS,
    [UNHOOKED_CATEGORY]: UNHOOKED_SECTIONS,
    [HANDLE_PASSES_CATEGORY]: HANDLE_PASSES_SECTIONS,
  };
  return [...(lists[category] ?? [])];
}
