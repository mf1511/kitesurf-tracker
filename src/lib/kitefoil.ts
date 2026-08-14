/** Sous-modules Kitefoil (ordre d’apprentissage) */

export const KITEFOIL_CATEGORY = "Kitefoil";

export const KITEFOIL_SECTIONS = [
  "Premiers vols",
  "Navigation",
  "Transitions",
  "Freestyle",
  "Vague",
] as const;

export type KitefoilSection = (typeof KITEFOIL_SECTIONS)[number];

const SECTION_BY_INDEX: Record<number, KitefoilSection> = {
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
export function resolveKitefoilSection(
  description: string | null | undefined,
  order: number,
  slug?: string,
  name?: string
): string | null {
  const fromDesc = parseModule(description);
  if (fromDesc && (KITEFOIL_SECTIONS as readonly string[]).includes(fromDesc)) {
    return fromDesc;
  }
  const hay = `${slug ?? ""} ${name ?? ""}`.toLowerCase();
  if (
    hay.includes("wave") ||
    hay.includes("vague") ||
    hay.includes("swell")
  ) {
    return "Vague";
  }
  if (
    hay.includes("jump") ||
    hay.includes("backroll") ||
    hay.includes("frontroll") ||
    hay.includes("360") ||
    hay.includes("tantrum") ||
    hay.includes("freestyle") ||
    hay.includes("wash")
  ) {
    return "Freestyle";
  }
  if (
    hay.includes("jibe") ||
    hay.includes("gybe") ||
    hay.includes("tack") ||
    hay.includes("transition")
  ) {
    return "Transitions";
  }
  if (
    hay.includes("upwind") ||
    hay.includes("downwind") ||
    hay.includes("footswap") ||
    hay.includes("yaw")
  ) {
    return "Navigation";
  }
  if (
    hay.includes("intro") ||
    hay.includes("water-start") ||
    hay.includes("waterstart") ||
    hay.includes("sit") ||
    hay.includes("balance") ||
    hay.includes("pump")
  ) {
    return "Premiers vols";
  }
  return SECTION_BY_INDEX[Math.floor(order / 100)] ?? null;
}

export function sortKitefoilSections(sections: string[]): string[] {
  return [...sections].sort((a, b) => {
    const ia = KITEFOIL_SECTIONS.indexOf(a as KitefoilSection);
    const ib = KITEFOIL_SECTIONS.indexOf(b as KitefoilSection);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, "fr");
  });
}
