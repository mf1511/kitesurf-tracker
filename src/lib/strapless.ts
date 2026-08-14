/** Sous-modules Strapless (ordre d’apprentissage) */

export const STRAPLESS_CATEGORY = "Strapless";

export const STRAPLESS_SECTIONS = [
  "Premiers vols",
  "Navigation",
  "Transitions",
  "Freestyle",
] as const;

export type StraplessSection = (typeof STRAPLESS_SECTIONS)[number];

const SECTION_BY_INDEX: Record<number, StraplessSection> = {
  1: "Premiers vols",
  2: "Navigation",
  3: "Transitions",
  4: "Freestyle",
};

function parseModule(description: string | null | undefined): string | null {
  if (!description) return null;
  const m = description.match(/Module\s*«\s*([^»]+)\s*»/u);
  return m?.[1]?.trim() ?? null;
}

/** Module, sinon slug / nom, sinon order/100 */
export function resolveStraplessSection(
  description: string | null | undefined,
  order: number,
  slug?: string,
  name?: string
): string | null {
  const fromDesc = parseModule(description);
  if (
    fromDesc &&
    (STRAPLESS_SECTIONS as readonly string[]).includes(fromDesc)
  ) {
    return fromDesc;
  }
  const hay = `${slug ?? ""} ${name ?? ""}`.toLowerCase();
  if (
    hay.includes("tack") ||
    hay.includes("board-off-transition")
  ) {
    return "Transitions";
  }
  if (
    hay.includes("gybe") ||
    hay.includes("jibe") ||
    hay.includes("switch") ||
    hay.includes("hang-ten")
  ) {
    return "Navigation";
  }
  if (
    hay.includes("waterstart") ||
    hay.includes("quick-start") ||
    hay.includes("white-water")
  ) {
    return "Premiers vols";
  }
  if (
    hay.includes("pop") ||
    hay.includes("ollie") ||
    hay.includes("roll") ||
    hay.includes("360") ||
    hay.includes("313") ||
    hay.includes("front") ||
    hay.includes("blind") ||
    hay.includes("board-off") ||
    hay.includes("jesus") ||
    hay.includes("crazy") ||
    hay.includes("serie") ||
    hay.includes("indy") ||
    hay.includes("handstand") ||
    hay.includes("flat")
  ) {
    return "Freestyle";
  }
  return SECTION_BY_INDEX[Math.floor(order / 100)] ?? null;
}

export function sortStraplessSections(sections: string[]): string[] {
  return [...sections].sort((a, b) => {
    const ia = STRAPLESS_SECTIONS.indexOf(a as StraplessSection);
    const ib = STRAPLESS_SECTIONS.indexOf(b as StraplessSection);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, "fr");
  });
}
