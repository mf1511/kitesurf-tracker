/** Helpers communs pour les sous-modules de catégorie */

export type SectionFigure = {
  slug: string;
  section: string;
  order: number;
};

export function parseModule(description: string | null | undefined): string | null {
  if (!description) return null;
  const m = description.match(/Module\s*«\s*([^»]+)\s*»/u);
  return m?.[1]?.trim() ?? null;
}

export function withModule(desc: string, section: string): string {
  if (/Module\s*«/.test(desc)) {
    return desc.replace(/Module\s*«\s*[^»]+\s*»/u, `Module « ${section} »`);
  }
  return `Module « ${section} » — ${desc}`;
}

/** Retire le préfixe Module « … » — (figure hors sous-module) */
export function stripModule(desc: string): string {
  return desc.replace(/Module\s*«\s*[^»]+\s*»\s*—\s*/u, "").trim();
}

export function sortNamedSections(
  order: readonly string[],
  sections: string[]
): string[] {
  return [...sections].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, "fr");
  });
}

/** Résout via Module, puis table slug, puis order/100 */
export function resolveFromTable(
  sections: readonly string[],
  figures: readonly SectionFigure[],
  description: string | null | undefined,
  order: number,
  slug?: string
): string | null {
  const fromDesc = parseModule(description);
  if (fromDesc && (sections as readonly string[]).includes(fromDesc)) {
    return fromDesc;
  }
  if (slug) {
    const row = figures.find((f) => f.slug === slug);
    if (row) return row.section;
  }
  const byIndex = sections[Math.floor(order / 100) - 1];
  return byIndex ?? null;
}
