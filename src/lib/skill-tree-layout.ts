/** Layout skill-tree gauche→droite (DAG layered ou chaînes Débuter) */

export type SkillTreeState = "done" | "open" | "locked";

export type SkillTreeInput = {
  id: string;
  slug: string;
  name: string;
  state: SkillTreeState;
  xp: number;
  /** false = publiée côté admin désactivée — visible, pas de lien */
  active?: boolean;
  /** Import Twintip avancé — libellé « Bientôt » en rouge */
  soonHighlight?: boolean;
  /** Prérequis dans la même catégorie (ids) */
  prereqIds: string[];
  /** Ordre pédagogique (Débuter / tri) */
  order: number;
  /** Sous-section Débuter, si applicable */
  section?: string | null;
};

export type LaidOutNode = SkillTreeInput & {
  x: number;
  y: number;
  w: number;
  h: number;
  col: number;
};

export type LaidOutEdge = {
  from: string;
  to: string;
};

export type SkillTreeLayout = {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
  /** Labels de bandeau Débuter (y = top de la section) */
  bands?: { label: string; y: number }[];
};

const NODE_W = 148;
const NODE_H = 38;
const COL_GAP = 188;
const ROW_GAP = 56;
const PAD = 28;
const SECTION_GAP = 48;
const BAND_LABEL_H = 28;

function estimateNodeWidth(name: string): number {
  // Approx. largeur pill selon le libellé (clamp)
  return Math.min(220, Math.max(NODE_W, 28 + name.length * 7.2));
}

/** Colonne = plus long chemin depuis les racines (prérequis dans le set) */
function assignColumns(items: SkillTreeInput[]): Map<string, number> {
  const byId = new Map(items.map((n) => [n.id, n]));
  const memo = new Map<string, number>();

  function colOf(id: string, stack: Set<string>): number {
    if (memo.has(id)) return memo.get(id)!;
    if (stack.has(id)) return 0;
    stack.add(id);
    const n = byId.get(id);
    if (!n) {
      stack.delete(id);
      return 0;
    }
    const inCat = n.prereqIds.filter((p) => byId.has(p));
    const col =
      inCat.length === 0
        ? 0
        : 1 + Math.max(...inCat.map((p) => colOf(p, stack)));
    stack.delete(id);
    memo.set(id, col);
    return col;
  }

  for (const n of items) colOf(n.id, new Set());
  return memo;
}

/** Une passe barycentre : aligne un nœud sur la moyenne Y de ses parents */
function barycenterPass(
  byCol: Map<number, string[]>,
  yOf: Map<string, number>,
  items: SkillTreeInput[],
  maxCol: number
) {
  const byId = new Map(items.map((n) => [n.id, n]));
  for (let c = 1; c <= maxCol; c++) {
    const ids = byCol.get(c) ?? [];
    const scored = ids.map((id) => {
      const n = byId.get(id)!;
      const parents = n.prereqIds.filter((p) => yOf.has(p));
      const mean =
        parents.length === 0
          ? yOf.get(id) ?? 0
          : parents.reduce((s, p) => s + (yOf.get(p) ?? 0), 0) / parents.length;
      return { id, mean };
    });
    scored.sort((a, b) => a.mean - b.mean || a.id.localeCompare(b.id));
    scored.forEach((s, i) => yOf.set(s.id, PAD + i * ROW_GAP));
    byCol.set(
      c,
      scored.map((s) => s.id)
    );
  }
}

/** Layout DAG layered LTR pour une catégorie classique */
export function layoutSkillTree(items: SkillTreeInput[]): SkillTreeLayout {
  if (items.length === 0) {
    return { nodes: [], edges: [], width: PAD * 2, height: PAD * 2 };
  }

  const cols = assignColumns(items);
  const byCol = new Map<number, string[]>();
  let maxCol = 0;
  for (const n of items) {
    const c = cols.get(n.id) ?? 0;
    maxCol = Math.max(maxCol, c);
    if (!byCol.has(c)) byCol.set(c, []);
    byCol.get(c)!.push(n.id);
  }

  // Tri initial par order dans chaque colonne
  const orderOf = new Map(items.map((n) => [n.id, n.order]));
  for (const [c, ids] of byCol) {
    ids.sort(
      (a, b) => (orderOf.get(a) ?? 0) - (orderOf.get(b) ?? 0) || a.localeCompare(b)
    );
    byCol.set(c, ids);
  }

  const yOf = new Map<string, number>();
  for (const [c, ids] of byCol) {
    ids.forEach((id, i) => yOf.set(id, PAD + i * ROW_GAP));
    void c;
  }

  // 2 passes pour réduire les croisements
  barycenterPass(byCol, yOf, items, maxCol);
  barycenterPass(byCol, yOf, items, maxCol);

  const widthById = new Map(items.map((n) => [n.id, estimateNodeWidth(n.name)]));
  const nodes: LaidOutNode[] = items.map((n) => {
    const col = cols.get(n.id) ?? 0;
    const w = widthById.get(n.id)!;
    return {
      ...n,
      col,
      w,
      h: NODE_H,
      x: PAD + col * COL_GAP,
      y: yOf.get(n.id) ?? PAD,
    };
  });

  const idSet = new Set(items.map((n) => n.id));
  const edges: LaidOutEdge[] = [];
  for (const n of items) {
    for (const p of n.prereqIds) {
      if (idSet.has(p)) edges.push({ from: p, to: n.id });
    }
  }

  const maxY = Math.max(...nodes.map((n) => n.y + n.h), PAD);
  const maxX = Math.max(...nodes.map((n) => n.x + n.w), PAD);
  return {
    nodes,
    edges,
    width: maxX + PAD,
    height: maxY + PAD,
  };
}

/**
 * Débuter : une chaîne LTR par sous-section, sections empilées verticalement.
 */
export function layoutDebuterChains(
  items: SkillTreeInput[],
  sectionOrder: string[]
): SkillTreeLayout {
  if (items.length === 0) {
    return { nodes: [], edges: [], width: PAD * 2, height: PAD * 2, bands: [] };
  }

  const bySection = new Map<string, SkillTreeInput[]>();
  for (const n of items) {
    const sec = n.section?.trim() || "Autres";
    if (!bySection.has(sec)) bySection.set(sec, []);
    bySection.get(sec)!.push(n);
  }

  const sections = [
    ...sectionOrder.filter((s) => bySection.has(s)),
    ...[...bySection.keys()].filter((s) => !sectionOrder.includes(s)),
  ];

  const nodes: LaidOutNode[] = [];
  const edges: LaidOutEdge[] = [];
  const bands: { label: string; y: number }[] = [];
  let cursorY = PAD;
  let maxX = PAD;

  for (const sec of sections) {
    const list = (bySection.get(sec) ?? []).sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")
    );
    bands.push({ label: sec, y: cursorY });
    cursorY += BAND_LABEL_H;

    list.forEach((n, i) => {
      const w = estimateNodeWidth(n.name);
      const x = PAD + i * COL_GAP;
      const y = cursorY;
      nodes.push({ ...n, col: i, w, h: NODE_H, x, y });
      maxX = Math.max(maxX, x + w);
      if (i > 0) edges.push({ from: list[i - 1].id, to: n.id });
    });

    cursorY += NODE_H + SECTION_GAP;
  }

  return {
    nodes,
    edges,
    width: maxX + PAD,
    height: cursorY - SECTION_GAP + PAD,
    bands,
  };
}
