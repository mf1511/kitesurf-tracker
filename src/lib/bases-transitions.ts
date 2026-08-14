/** Sous-modules Bases et transitions */

export const BASES_TRANSITIONS_CATEGORY = "Bases et transitions";

export const BASES_TRANSITIONS_SECTIONS = ["Transitions", "Riding"] as const;

export type BasesTransitionsSection =
  (typeof BASES_TRANSITIONS_SECTIONS)[number];

function parseModule(description: string | null | undefined): string | null {
  if (!description) return null;
  const m = description.match(/Module\s*«\s*([^»]+)\s*»/u);
  return m?.[1]?.trim() ?? null;
}

/** Transitions / Riding via module, sinon slug / nom */
export function resolveBasesTransitionsSection(
  description: string | null | undefined,
  slug?: string,
  name?: string
): string | null {
  const fromDesc = parseModule(description);
  if (
    fromDesc &&
    (BASES_TRANSITIONS_SECTIONS as readonly string[]).includes(fromDesc)
  ) {
    return fromDesc;
  }
  const hay = `${slug ?? ""} ${name ?? ""}`.toLowerCase();
  if (
    hay.includes("transition") ||
    hay.includes("jibe") ||
    hay.includes("gybe") ||
    hay.includes("halfcab") ||
    hay.includes("toe-side-turn") ||
    hay.includes("toeside-turn")
  ) {
    return "Transitions";
  }
  if (
    hay.includes("riding") ||
    hay.includes("ride-") ||
    hay.includes("bidirectionnel") ||
    hay.includes("carving")
  ) {
    return "Riding";
  }
  return null;
}

export function sortBasesTransitionsSections(sections: string[]): string[] {
  return [...sections].sort((a, b) => {
    const ia = BASES_TRANSITIONS_SECTIONS.indexOf(a as BasesTransitionsSection);
    const ib = BASES_TRANSITIONS_SECTIONS.indexOf(b as BasesTransitionsSection);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, "fr");
  });
}
