/**
 * Gamification dérivée de UserProgress — aucune table dédiée.
 * XP / niveau / badges / quêtes calculés à la volée.
 */

export type FigureLike = {
  id: string;
  slug: string;
  name: string;
  category: string;
  prerequisites?: { id: string }[];
  progress?:
    | { completed: boolean; completedAt?: Date | string | null }[]
    | null;
};

/** Points XP selon la catégorie (plus technique = plus de points) */
const CATEGORY_XP: Record<string, number> = {
  Débuter: 5,
  "Twintip avancé": 8,
  Bonus: 8,
  Sécurité: 8,
  Tutoriels: 5,
  Kitefoil: 25,
  Wingfoil: 25,
  Strapless: 25,
  "Bases et transitions": 10,
  "Surface tricks & drags": 15,
  "Sauts & Big Air": 20,
  "Old school / grabs / board-offs": 20,
  "Kiteloops & loops": 30,
  "Unhooked freestyle": 35,
  "Handle passes & mobes": 40,
  "Toeside freestyle": 40,
  "Wave riding / strapless": 25,
  "Extrême / compétition": 50,
};

const DEFAULT_XP = 20;

/** Paliers de niveau (XP cumulé requis pour atteindre le niveau) */
const LEVEL_THRESHOLDS = [
  0, 50, 120, 220, 350, 520, 740, 1000, 1350, 1800, 2400, 3200, 4200, 5500,
  7000,
];

const LEVEL_TITLES = [
  "Débutant plage",
  "Waterstarter",
  "Rider",
  "Carver",
  "Booster",
  "Looper",
  "Freestyler",
  "Handle Pass Apprentice",
  "Mobe Hunter",
  "KGB Contender",
  "Wave Wizard",
  "Foil Flyer",
  "KOTA Contender",
  "Pro Rider",
  "Légende du spot",
];

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
};

export type Quest = {
  id: string;
  slug: string;
  name: string;
  category: string;
  xp: number;
};

export type GameStats = {
  totalDone: number;
  totalFigures: number;
  overallPct: number;
  xp: number;
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  xpProgressPct: number;
  badges: Badge[];
  quests: Quest[];
};

export function xpForCategory(category: string): number {
  return CATEGORY_XP[category] ?? DEFAULT_XP;
}

/** Ordre par défaut des mondes (fallback si AppSetting absent) */
export const DEFAULT_CATEGORY_ORDER = [
  "Débuter",
  "Twintip avancé",
  "Bonus",
  "Sécurité",
  "Tutoriels",
  "Kitefoil",
  "Wingfoil",
  "Strapless",
] as const;

/** Ordre d’affichage des mondes : order fourni, sinon DEFAULT, puis alpha FR */
export function sortCategories(
  categories: string[],
  order: readonly string[] = DEFAULT_CATEGORY_ORDER
): string[] {
  return [...categories].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return a.localeCompare(b, "fr");
  });
}

export function isCompleted(figure: FigureLike): boolean {
  return !!figure.progress?.some((p) => p.completed);
}

export function isUnlocked(figure: FigureLike, doneIds: Set<string>): boolean {
  if (!figure.prerequisites || figure.prerequisites.length === 0) return true;
  return figure.prerequisites.every((p) => doneIds.has(p.id));
}

function levelFromXp(xp: number): {
  level: number;
  title: string;
  into: number;
  need: number;
} {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 500;
  const into = xp - currentThreshold;
  const need = nextThreshold - currentThreshold;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, title, into, need };
}

export function medalForPct(pct: number): string | null {
  if (pct >= 100) return "🥇";
  if (pct >= 60) return "🥈";
  if (pct >= 25) return "🥉";
  return null;
}

function buildBadges(
  figures: FigureLike[],
  doneIds: Set<string>,
  totalDone: number,
): Badge[] {
  const done = figures.filter((f) => doneIds.has(f.id));
  const cats = Array.from(new Set(figures.map((f) => f.category)));

  const hasCat = (partial: string) =>
    done.some((f) => f.category.toLowerCase().includes(partial));

  const catComplete = (cat: string) => {
    const list = figures.filter((f) => f.category === cat);
    return list.length > 0 && list.every((f) => doneIds.has(f.id));
  };

  const completedCats = cats.filter(catComplete).length;

  const defs: Omit<Badge, "earned">[] = [
    {
      id: "first",
      name: "Premier trick",
      description: "Valide ta 1ère figure",
      icon: "🌊",
    },
    {
      id: "ten",
      name: "Décathlon",
      description: "10 figures acquises",
      icon: "🔟",
    },
    {
      id: "twentyfive",
      name: "Quarter century",
      description: "25 figures acquises",
      icon: "🎯",
    },
    {
      id: "fifty",
      name: "Half century",
      description: "50 figures acquises",
      icon: "🏆",
    },
    {
      id: "hundred",
      name: "Centurion",
      description: "100 figures acquises",
      icon: "💯",
    },
    {
      id: "bases",
      name: "Fondations",
      description: "Complète Bases et transitions",
      icon: "🧱",
    },
    {
      id: "loop",
      name: "Looper",
      description: "Acquiers un kiteloop",
      icon: "🌀",
    },
    {
      id: "unhooked",
      name: "Décroché",
      description: "Premier unhooked freestyle",
      icon: "🔓",
    },
    {
      id: "pass",
      name: "Handle Pass",
      description: "Premier handle pass / mobe",
      icon: "🔄",
    },
    {
      id: "wave",
      name: "Surfeur",
      description: "Figure wave / strapless",
      icon: "🏄",
    },
    {
      id: "foil",
      name: "Foil flyer",
      description: "Figure foil validée",
      icon: "🪽",
    },
    {
      id: "worlds",
      name: "Explorateur",
      description: "3 catégories 100%",
      icon: "🗺️",
    },
  ];

  const earnedMap: Record<string, boolean> = {
    first: totalDone >= 1,
    ten: totalDone >= 10,
    twentyfive: totalDone >= 25,
    fifty: totalDone >= 50,
    hundred: totalDone >= 100,
    bases: catComplete("Bases et transitions"),
    loop: hasCat("kiteloop"),
    unhooked: hasCat("unhooked"),
    pass: hasCat("handle pass") || hasCat("mobe"),
    wave: hasCat("wave"),
    foil: hasCat("foil"),
    worlds: completedCats >= 3,
  };

  return defs.map((b) => ({ ...b, earned: !!earnedMap[b.id] }));
}

export function computeGameStats(figures: FigureLike[]): GameStats {
  const doneIds = new Set(figures.filter(isCompleted).map((f) => f.id));
  const totalDone = doneIds.size;
  const totalFigures = figures.length;
  const overallPct = totalFigures
    ? Math.round((totalDone / totalFigures) * 100)
    : 0;

  let xp = 0;
  for (const f of figures) {
    if (!doneIds.has(f.id)) continue;
    xp += xpForCategory(f.category);
  }

  const { level, title, into, need } = levelFromXp(xp);
  const badges = buildBadges(figures, doneIds, totalDone);

  // Quêtes : débloquées, pas encore faites, max 3 (priorité XP croissante)
  const quests: Quest[] = figures
    .filter((f) => !doneIds.has(f.id) && isUnlocked(f, doneIds))
    .map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      category: f.category,
      xp: xpForCategory(f.category),
    }))
    .sort((a, b) => a.xp - b.xp)
    .slice(0, 3);

  return {
    totalDone,
    totalFigures,
    overallPct,
    xp,
    level,
    title,
    xpIntoLevel: into,
    xpForNextLevel: need,
    xpProgressPct: need ? Math.min(100, Math.round((into / need) * 100)) : 100,
    badges,
    quests,
  };
}
