/** Sous-modules Wingfoil (ordre d’apprentissage) */

export const WINGFOIL_CATEGORY = "Wingfoil";

export const WINGFOIL_SECTIONS = [
  "Premiers vols",
  "Navigation",
  "Transitions",
  "Freestyle",
  "Vague",
] as const;

export type WingfoilSection = (typeof WINGFOIL_SECTIONS)[number];

const SECTION_BY_INDEX: Record<number, WingfoilSection> = {
  1: "Premiers vols",
  2: "Navigation",
  3: "Transitions",
  4: "Freestyle",
  5: "Vague",
};

function parseModule(description: string | null | undefined): string | null {
  if (!description) return null;
  const m = description.match(/Module\s*«\s*([^»]+)\s*»/u);
  return m?.[1]?.trim() ?? null;
}

/** Module, sinon slug / nom, sinon order/100 */
export function resolveWingfoilSection(
  description: string | null | undefined,
  order: number,
  slug?: string,
  name?: string
): string | null {
  const fromDesc = parseModule(description);
  if (fromDesc && (WINGFOIL_SECTIONS as readonly string[]).includes(fromDesc)) {
    return fromDesc;
  }
  const hay = `${slug ?? ""} ${name ?? ""}`.toLowerCase();
  if (hay.includes("wave") || hay.includes("vague") || hay.includes("surf")) {
    return "Vague";
  }
  if (
    hay.includes("air-jibe") ||
    hay.includes("raley") ||
    hay.includes("360") ||
    hay.includes("jump")
  ) {
    return "Freestyle";
  }
  if (
    hay.includes("jibe") ||
    hay.includes("gybe") ||
    hay.includes("tack")
  ) {
    return "Transitions";
  }
  if (
    hay.includes("toeside") ||
    hay.includes("footswap") ||
    hay.includes("carve") ||
    hay.includes("direction") ||
    hay.includes("backwind") ||
    hay.includes("backwing")
  ) {
    return "Navigation";
  }
  if (
    hay.includes("intro") ||
    hay.includes("gear") ||
    hay.includes("matos") ||
    hay.includes("spot") ||
    hay.includes("safety") ||
    hay.includes("securite") ||
    hay.includes("handling") ||
    hay.includes("first-flight") ||
    hay.includes("stinkbug") ||
    hay.includes("pump") ||
    hay.includes("balance") ||
    hay.includes("control")
  ) {
    return "Premiers vols";
  }
  return SECTION_BY_INDEX[Math.floor(order / 100)] ?? null;
}

export function sortWingfoilSections(sections: string[]): string[] {
  return [...sections].sort((a, b) => {
    const ia = WINGFOIL_SECTIONS.indexOf(a as WingfoilSection);
    const ib = WINGFOIL_SECTIONS.indexOf(b as WingfoilSection);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, "fr");
  });
}
