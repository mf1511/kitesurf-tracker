/** Layout mindmap gauche → droite : hub → catégorie → sous-module → figures */

export type MindmapFigureInput = {
  id: string;
  slug: string;
  name: string;
  state: "done" | "open" | "locked";
  active: boolean;
  soonHighlight?: boolean;
  xp: number;
  order: number;
  /** Prérequis (ids) — branchage dans le groupe */
  prereqIds?: string[];
};

export type MindmapSectionInput = {
  name: string;
  figures: MindmapFigureInput[];
};

export type MindmapCategoryInput = {
  name: string;
  figures: MindmapFigureInput[];
  /** Sous-modules (Débuter, Twintip avancé) — absents = figures directes */
  sections?: MindmapSectionInput[];
};

export type MindmapNode =
  | {
      kind: "hub";
      id: string;
      label: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  | {
      kind: "category";
      id: string;
      label: string;
      category: string;
      colorIndex: number;
      x: number;
      y: number;
      w: number;
      h: number;
      collapsed: boolean;
      figureCount: number;
      doneCount: number;
    }
  | {
      kind: "section";
      id: string;
      label: string;
      category: string;
      section: string;
      colorIndex: number;
      x: number;
      y: number;
      w: number;
      h: number;
      collapsed: boolean;
      figureCount: number;
      doneCount: number;
    }
  | {
      kind: "figure";
      id: string;
      slug: string;
      label: string;
      category: string;
      colorIndex: number;
      state: "done" | "open" | "locked";
      active: boolean;
      soonHighlight?: boolean;
      xp: number;
      x: number;
      y: number;
      w: number;
      h: number;
    };

export type MindmapEdge = {
  from: string;
  to: string;
  colorIndex: number;
};

export type MindmapLayout = {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  width: number;
  height: number;
};

const HUB_W = 120;
const HUB_H = 44;
const CAT_W = 168;
const CAT_H = 36;
const SEC_W = 188;
const SEC_H = 34;
const FIG_H = 30;
const ROW_H = 40;
const CHAIN_GAP = 20;
const DAG_COL_W = 196;
/** Au-delà, la chaîne sans prérequis passe à la ligne (ordre conservé) */
const CHAIN_WRAP = 8;
const GAP_HUB_CAT = 72;
const GAP_CAT_SEC = 56;
const GAP_SEC_FIG = 48;
const GAP_CAT_FIG = 48;
const SEC_GAP = 14;
const BLOCK_GAP = 28;
const PAD = 48;

/** Clé de repli d’un sous-module */
export function mindmapSectionKey(category: string, section: string) {
  return `${category}::${section}`;
}

function sortFigs(figs: MindmapFigureInput[]) {
  return [...figs].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr")
  );
}

function estimateFigWidth(label: string) {
  return Math.min(220, Math.max(140, 12 + label.length * 7.2));
}

function pushFig(
  f: MindmapFigureInput,
  x: number,
  y: number,
  w: number,
  category: string,
  colorIndex: number,
  nodes: MindmapNode[]
) {
  nodes.push({
    kind: "figure",
    id: f.id,
    slug: f.slug,
    label: f.name,
    category,
    colorIndex,
    state: f.state,
    active: f.active,
    soonHighlight: f.soonHighlight,
    xp: f.xp,
    x,
    y,
    w,
    h: FIG_H,
  });
}

/** Chaîne ordre pédagogique ; wrap pour ne pas faire 40 pastilles sur une ligne */
function placeChain(
  figs: MindmapFigureInput[],
  x0: number,
  y0: number,
  category: string,
  colorIndex: number,
  parentId: string,
  nodes: MindmapNode[],
  edges: MindmapEdge[]
): number {
  let x = x0;
  let row = 0;
  figs.forEach((f, j) => {
    if (j > 0 && j % CHAIN_WRAP === 0) {
      x = x0;
      row += 1;
    }
    const w = estimateFigWidth(f.name);
    pushFig(f, x, y0 + row * ROW_H + (ROW_H - FIG_H) / 2, w, category, colorIndex, nodes);
    edges.push({
      from: j === 0 ? parentId : figs[j - 1].id,
      to: f.id,
      colorIndex,
    });
    x += w + CHAIN_GAP;
  });
  return (row + 1) * ROW_H;
}

/** DAG : colonne = profondeur des prérequis, ligne = ordre */
function placeDag(
  figs: MindmapFigureInput[],
  x0: number,
  y0: number,
  category: string,
  colorIndex: number,
  parentId: string,
  nodes: MindmapNode[],
  edges: MindmapEdge[]
): number {
  const ids = new Set(figs.map((f) => f.id));
  const byId = new Map(figs.map((f) => [f.id, f]));
  const depth = new Map<string, number>();

  function dep(id: string, stack: Set<string>): number {
    const hit = depth.get(id);
    if (hit !== undefined) return hit;
    if (stack.has(id)) return 0;
    stack.add(id);
    const parents = (byId.get(id)?.prereqIds ?? []).filter((p) => ids.has(p));
    const d =
      parents.length === 0
        ? 0
        : 1 + Math.max(...parents.map((p) => dep(p, stack)));
    stack.delete(id);
    depth.set(id, d);
    return d;
  }
  for (const f of figs) dep(f.id, new Set());

  const byCol = new Map<number, MindmapFigureInput[]>();
  for (const f of figs) {
    const c = depth.get(f.id) ?? 0;
    const list = byCol.get(c) ?? [];
    list.push(f);
    byCol.set(c, list);
  }
  for (const list of byCol.values()) {
    list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr"));
  }

  let maxRows = 1;
  for (const [c, list] of byCol) {
    maxRows = Math.max(maxRows, list.length);
    list.forEach((f, row) => {
      const w = estimateFigWidth(f.name);
      pushFig(
        f,
        x0 + c * DAG_COL_W,
        y0 + row * ROW_H + (ROW_H - FIG_H) / 2,
        w,
        category,
        colorIndex,
        nodes
      );
      const parents = (f.prereqIds ?? []).filter((p) => ids.has(p));
      if (parents.length === 0) {
        edges.push({ from: parentId, to: f.id, colorIndex });
      } else {
        for (const p of parents) {
          edges.push({ from: p, to: f.id, colorIndex });
        }
      }
    });
  }
  return maxRows * ROW_H;
}

/** Même règle partout : prérequis → arbre, sinon chaîne ordonnée */
function placeFigureBranch(
  figs: MindmapFigureInput[],
  x0: number,
  y0: number,
  category: string,
  colorIndex: number,
  parentId: string,
  nodes: MindmapNode[],
  edges: MindmapEdge[]
): number {
  if (figs.length === 0) return 0;
  const ids = new Set(figs.map((f) => f.id));
  const hasPrereqs = figs.some((f) =>
    (f.prereqIds ?? []).some((p) => ids.has(p))
  );
  return hasPrereqs
    ? placeDag(figs, x0, y0, category, colorIndex, parentId, nodes, edges)
    : placeChain(figs, x0, y0, category, colorIndex, parentId, nodes, edges);
}

/**
 * Hub à gauche, catégories empilées, sous-modules puis chaîne de figures.
 */
export function layoutMindmap(
  categories: MindmapCategoryInput[],
  collapsed: Set<string>,
  hubLabel = "Figures"
): MindmapLayout {
  const catX = PAD + HUB_W + GAP_HUB_CAT;
  const secX = catX + CAT_W + GAP_CAT_SEC;
  const figXFromSec = secX + SEC_W + GAP_SEC_FIG;
  const figXFromCat = catX + CAT_W + GAP_CAT_FIG;

  const nodes: MindmapNode[] = [];
  const edges: MindmapEdge[] = [];
  let y = PAD;
  const blockCenters: number[] = [];

  categories.forEach((cat, i) => {
    const catId = `cat:${cat.name}`;
    const catCollapsed = collapsed.has(cat.name);
    const sections = cat.sections?.filter((s) => s.figures.length > 0) ?? [];
    const hasSections = sections.length > 0;
    const doneCount = cat.figures.filter((f) => f.state === "done").length;
    const y0 = y;

    if (catCollapsed) {
      nodes.push({
        kind: "category",
        id: catId,
        label: cat.name,
        category: cat.name,
        colorIndex: i,
        x: catX,
        y,
        w: CAT_W,
        h: CAT_H,
        collapsed: true,
        figureCount: cat.figures.length,
        doneCount,
      });
      edges.push({ from: "hub", to: catId, colorIndex: i });
      blockCenters.push(y + CAT_H / 2);
      y += CAT_H + BLOCK_GAP;
      return;
    }

    if (hasSections) {
      for (const sec of sections) {
        const sk = mindmapSectionKey(cat.name, sec.name);
        const secCollapsed = collapsed.has(sk);
        const figs = secCollapsed ? [] : sortFigs(sec.figures);
        const secId = `sec:${sk}`;
        const branchH = placeFigureBranch(
          figs,
          figXFromSec,
          y,
          cat.name,
          i,
          secId,
          nodes,
          edges
        );
        const blockH = Math.max(SEC_H, branchH);

        nodes.push({
          kind: "section",
          id: secId,
          label: sec.name,
          category: cat.name,
          section: sec.name,
          colorIndex: i,
          x: secX,
          y: y + (blockH - SEC_H) / 2,
          w: SEC_W,
          h: SEC_H,
          collapsed: secCollapsed,
          figureCount: sec.figures.length,
          doneCount: sec.figures.filter((f) => f.state === "done").length,
        });
        edges.push({ from: catId, to: secId, colorIndex: i });
        y += blockH + SEC_GAP;
      }
      y -= SEC_GAP;
    } else {
      const figs = sortFigs(cat.figures);
      const branchH = placeFigureBranch(
        figs,
        figXFromCat,
        y,
        cat.name,
        i,
        catId,
        nodes,
        edges
      );
      y += Math.max(CAT_H, branchH);
    }

    const stackH = Math.max(CAT_H, y - y0);
    const catY = y0 + (stackH - CAT_H) / 2;
    nodes.push({
      kind: "category",
      id: catId,
      label: cat.name,
      category: cat.name,
      colorIndex: i,
      x: catX,
      y: catY,
      w: CAT_W,
      h: CAT_H,
      collapsed: false,
      figureCount: cat.figures.length,
      doneCount,
    });
    edges.push({ from: "hub", to: catId, colorIndex: i });
    blockCenters.push(catY + CAT_H / 2);
    y = y0 + stackH + BLOCK_GAP;
  });

  const stackBottom = y - BLOCK_GAP;
  const hubY =
    blockCenters.length === 0
      ? PAD
      : (blockCenters[0] + blockCenters[blockCenters.length - 1]) / 2 -
        HUB_H / 2;

  nodes.unshift({
    kind: "hub",
    id: "hub",
    label: hubLabel,
    x: PAD,
    y: Math.max(PAD, hubY),
    w: HUB_W,
    h: HUB_H,
  });

  let maxX = 0;
  let maxY = 0;
  for (const n of nodes) {
    maxX = Math.max(maxX, n.x + n.w);
    maxY = Math.max(maxY, n.y + n.h);
  }

  return {
    nodes,
    edges,
    width: Math.ceil(maxX + PAD),
    height: Math.ceil(Math.max(maxY, stackBottom) + PAD),
  };
}
