/**
 * Catalogue Kitesurf College — validé Marin (kitesurfcollege-map-final.tsv)
 */

export type KitesurfCollegeLesson = {
  youtubeId: string;
  title: string;
  url: string;
  mergeSlug?: string;
  create?: { slug: string; name: string; category: string; description?: string };
};

export const KITESURF_COLLEGE_LESSONS: KitesurfCollegeLesson[] = [
  {
    "youtubeId": "Q7MO9ftcPpU",
    "title": "DEATH LOOPS: how to fix them and how to avoid them",
    "url": "https://www.youtube.com/watch?v=Q7MO9ftcPpU",
    "create": {
      "slug": "securite-death-loops",
      "name": "Death loops",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "Gpmf7IVsmFg",
    "title": "2 ways to Self Launch: Anchor & Kite Drag Methods (kiteboard / kitesurf tutorial)",
    "url": "https://www.youtube.com/watch?v=Gpmf7IVsmFg",
    "mergeSlug": "debuter-le-decollage-de-l-aile"
  },
  {
    "youtubeId": "Q6enZTVhVpA",
    "title": "5 Ways to Self-Land (Kiteboarding Tutorial)",
    "url": "https://www.youtube.com/watch?v=Q6enZTVhVpA",
    "mergeSlug": "debuter-latterrissage-de-l-aile"
  },
  {
    "youtubeId": "ihA0MhiL2BM",
    "title": "How to Kitesurf: Launch Tutorial",
    "url": "https://www.youtube.com/watch?v=ihA0MhiL2BM",
    "mergeSlug": "debuter-le-decollage-de-l-aile"
  },
  {
    "youtubeId": "LQW54aZKaro",
    "title": "Kitesurf Drift Launch",
    "url": "https://www.youtube.com/watch?v=LQW54aZKaro",
    "mergeSlug": "debuter-le-decollage-de-l-aile"
  },
  {
    "youtubeId": "B78nQ-_Rt_0",
    "title": "Launching a kite safely (with assistant, inflatable power kite)",
    "url": "https://www.youtube.com/watch?v=B78nQ-_Rt_0",
    "mergeSlug": "debuter-le-decollage-de-l-aile"
  },
  {
    "youtubeId": "DtDJNxgb6rI",
    "title": "How to fix crossed or inverted lines (kitesurf tutorial)",
    "url": "https://www.youtube.com/watch?v=DtDJNxgb6rI",
    "create": {
      "slug": "securite-lignes-croisees",
      "name": "Lignes croisées / inversées",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "qRk5n_CQkE0",
    "title": "Rights of Way (for kite-boarders and other water users)",
    "url": "https://www.youtube.com/watch?v=qRk5n_CQkE0",
    "create": {
      "slug": "securite-priorites",
      "name": "Priorités (right of way)",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "OqrCpwbhuls",
    "title": "How to kite gusty wind",
    "url": "https://www.youtube.com/watch?v=OqrCpwbhuls",
    "create": {
      "slug": "securite-rafales",
      "name": "Rafales / vent irrégulier",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "ni71cWa2rMA",
    "title": "Sudden wind increases – how to avoid/handle them",
    "url": "https://www.youtube.com/watch?v=ni71cWa2rMA",
    "create": {
      "slug": "securite-rafales",
      "name": "Rafales / vent irrégulier",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "bmKgb8M3WQc",
    "title": "Kitesurf Self Rescue",
    "url": "https://www.youtube.com/watch?v=bmKgb8M3WQc",
    "create": {
      "slug": "securite-self-rescue",
      "name": "Self-rescue",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "U5_T_RuC6U0",
    "title": "Introduction to Kitesurf Safety Systems",
    "url": "https://www.youtube.com/watch?v=U5_T_RuC6U0",
    "create": {
      "slug": "securite-systemes",
      "name": "Systèmes de sécurité",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "UL4j_k1VH3I",
    "title": "Safety Systems (kiteboard / power kite tutorial)",
    "url": "https://www.youtube.com/watch?v=UL4j_k1VH3I",
    "create": {
      "slug": "securite-systemes",
      "name": "Systèmes de sécurité",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "DGMXpDzu_sw",
    "title": "Introduction to Unhooking (unhook, rehook, leashing, semi suicide etc)",
    "url": "https://www.youtube.com/watch?v=DGMXpDzu_sw",
    "create": {
      "slug": "securite-unhook-leash",
      "name": "Unhook & leash",
      "category": "Sécurité",
      "description": "Module sécurité — Kitesurf College."
    }
  },
  {
    "youtubeId": "L0XbGM0mvik",
    "title": "Kite Foil: How to backroll",
    "url": "https://www.youtube.com/watch?v=L0XbGM0mvik",
    "create": {
      "slug": "kitefoil-backroll",
      "name": "Kitefoil : backroll",
      "category": "Kitefoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "Qx4wXF5UBG4",
    "title": "Kite Foil Footswap (foiling stance switch)",
    "url": "https://www.youtube.com/watch?v=Qx4wXF5UBG4",
    "create": {
      "slug": "kitefoil-footswap",
      "name": "Kitefoil : footswap",
      "category": "Kitefoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "nwtFn4iafuU",
    "title": "Kite Foil: Taxi Footswap (switching stance tutorial)",
    "url": "https://www.youtube.com/watch?v=nwtFn4iafuU",
    "create": {
      "slug": "kitefoil-footswap",
      "name": "Kitefoil : footswap",
      "category": "Kitefoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "e_eL6owMwBM",
    "title": "Kite Foil: How to frontroll",
    "url": "https://www.youtube.com/watch?v=e_eL6owMwBM",
    "create": {
      "slug": "kitefoil-frontroll",
      "name": "Kitefoil : frontroll",
      "category": "Kitefoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "aCXAX7n87r8",
    "title": "Kite Foil Tutorial (bodydrag, taxi, microflights, long flights, gear, how to kite foil etc)",
    "url": "https://www.youtube.com/watch?v=aCXAX7n87r8",
    "create": {
      "slug": "kitefoil-intro",
      "name": "Kitefoil : introduction",
      "category": "Kitefoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "syWVv3rJRXg",
    "title": "Kite Foil Jibes (Gybes) & hydrofoil steering principles, Part 1",
    "url": "https://www.youtube.com/watch?v=syWVv3rJRXg",
    "create": {
      "slug": "kitefoil-jibe",
      "name": "Kitefoil : jibe",
      "category": "Kitefoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "bUDAv11U2-Y",
    "title": "Kite Foil Jibes (Gybes) & hydrofoil turning principles, PART 1",
    "url": "https://www.youtube.com/watch?v=bUDAv11U2-Y",
    "create": {
      "slug": "kitefoil-jibe",
      "name": "Kitefoil : jibe",
      "category": "Kitefoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "aP2wGO1XGdI",
    "title": "Hydrofoil Pumping Explained (how to pump a foil & what makes it work?)",
    "url": "https://www.youtube.com/watch?v=aP2wGO1XGdI",
    "create": {
      "slug": "kitefoil-pump",
      "name": "Kitefoil : pump",
      "category": "Kitefoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "3Dh1MsCADqg",
    "title": "Kite Foil: How to Sit",
    "url": "https://www.youtube.com/watch?v=3Dh1MsCADqg",
    "create": {
      "slug": "kitefoil-sit",
      "name": "Kitefoil : sit",
      "category": "Kitefoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "3luFYsLV2mo",
    "title": "Kite Foil: Heel to Toe Tack (how to start tacking tutorial)",
    "url": "https://www.youtube.com/watch?v=3luFYsLV2mo",
    "create": {
      "slug": "kitefoil-tack",
      "name": "Kitefoil : tack",
      "category": "Kitefoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "iaac7ijsgI8",
    "title": "Kite-Foil Roll Tack",
    "url": "https://www.youtube.com/watch?v=iaac7ijsgI8",
    "create": {
      "slug": "kitefoil-tack",
      "name": "Kitefoil : tack",
      "category": "Kitefoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "lSn8gxz1PC0",
    "title": "Upwind & Downwind Foiling Tips",
    "url": "https://www.youtube.com/watch?v=lSn8gxz1PC0",
    "create": {
      "slug": "kitefoil-upwind",
      "name": "Kitefoil : upwind / downwind",
      "category": "Kitefoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "OQ2YwwhvC0I",
    "title": "How to improve YAW foiling",
    "url": "https://www.youtube.com/watch?v=OQ2YwwhvC0I",
    "create": {
      "slug": "kitefoil-yaw",
      "name": "Kitefoil : yaw",
      "category": "Kitefoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "Q4Imo6M2qa0",
    "title": "Wing foil 360s (Basic/Training Version)",
    "url": "https://www.youtube.com/watch?v=Q4Imo6M2qa0",
    "create": {
      "slug": "wingfoil-360",
      "name": "Wingfoil : 360",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "v4XztnlDgAI",
    "title": "Wing Foil: Front-Side 360 (beginner to advanced versions)",
    "url": "https://www.youtube.com/watch?v=v4XztnlDgAI",
    "create": {
      "slug": "wingfoil-360",
      "name": "Wingfoil : 360",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "bMn7Fx0zyes",
    "title": "WING FOIL: Wing-Swing 360",
    "url": "https://www.youtube.com/watch?v=bMn7Fx0zyes",
    "create": {
      "slug": "wingfoil-360",
      "name": "Wingfoil : 360",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "z8FHirPUSD8",
    "title": "Wing-Foil: Around the world (flagged-out 360)",
    "url": "https://www.youtube.com/watch?v=z8FHirPUSD8",
    "create": {
      "slug": "wingfoil-360",
      "name": "Wingfoil : 360",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "tT7_Q_2lDm4",
    "title": "Wing Foil: How to Air Jibe (your first aerial rotation)",
    "url": "https://www.youtube.com/watch?v=tT7_Q_2lDm4",
    "create": {
      "slug": "wingfoil-air-jibe",
      "name": "Wingfoil : air jibe",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "lNtE_bDDV28",
    "title": "WINGFOIL: How to backwind (detailed tutorial)",
    "url": "https://www.youtube.com/watch?v=lNtE_bDDV28",
    "create": {
      "slug": "wingfoil-backwind",
      "name": "Wingfoil : backwind",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "_K-TCAJ9_xI",
    "title": "Wing-Foil Backwinded 360, how to (downwind version)",
    "url": "https://www.youtube.com/watch?v=_K-TCAJ9_xI",
    "create": {
      "slug": "wingfoil-backwind-360",
      "name": "Wingfoil : backwind 360",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "GCRR1JXpyjE",
    "title": "Wing Foil: BackWing (How to)",
    "url": "https://www.youtube.com/watch?v=GCRR1JXpyjE",
    "create": {
      "slug": "wingfoil-backwing",
      "name": "Wingfoil : backwing",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "89_JG8phSHs",
    "title": "WING FOIL: Foot, Mast & Weight Placement Guide",
    "url": "https://www.youtube.com/watch?v=89_JG8phSHs",
    "create": {
      "slug": "wingfoil-balance",
      "name": "Wingfoil : équilibre & stance",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "RSOi9YOKAjY",
    "title": "Wing Foil: How to improve stance and reduce fatigue",
    "url": "https://www.youtube.com/watch?v=RSOi9YOKAjY",
    "create": {
      "slug": "wingfoil-balance",
      "name": "Wingfoil : équilibre & stance",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "HSdgIx7VeLY",
    "title": "Wing Foil: Hydrofoil Stalling, and how to avoid it (P4 of Foiling Fundamentals)",
    "url": "https://www.youtube.com/watch?v=HSdgIx7VeLY",
    "create": {
      "slug": "wingfoil-balance",
      "name": "Wingfoil : équilibre & stance",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "hzKBU9azmAY",
    "title": "WING FOIL: Keeping Balance & Controlling Roll (foiling fundamentals)",
    "url": "https://www.youtube.com/watch?v=hzKBU9azmAY",
    "create": {
      "slug": "wingfoil-balance",
      "name": "Wingfoil : équilibre & stance",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "xHZbM9S8wA8",
    "title": "Wing Foil: Stance Tips and Mistakes",
    "url": "https://www.youtube.com/watch?v=xHZbM9S8wA8",
    "create": {
      "slug": "wingfoil-balance",
      "name": "Wingfoil : équilibre & stance",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "QNK_uGoRdGo",
    "title": "Wingfoil: Ski Stance",
    "url": "https://www.youtube.com/watch?v=QNK_uGoRdGo",
    "create": {
      "slug": "wingfoil-balance",
      "name": "Wingfoil : équilibre & stance",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "wmyD8KE2RnM",
    "title": "WING FOIL: How to foil further (improving height & speed control)",
    "url": "https://www.youtube.com/watch?v=wmyD8KE2RnM",
    "create": {
      "slug": "wingfoil-control",
      "name": "Wingfoil : contrôle hauteur/vitesse",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "aCUTm49LG28",
    "title": "Duck Jibe (Wing Foil Tutorial)",
    "url": "https://www.youtube.com/watch?v=aCUTm49LG28",
    "create": {
      "slug": "wingfoil-duck-jibe",
      "name": "Wingfoil : duck jibe",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "ILctJe-V4CI",
    "title": "Wing Foil Footswaps: Part 2",
    "url": "https://www.youtube.com/watch?v=ILctJe-V4CI",
    "create": {
      "slug": "wingfoil-footswap",
      "name": "Wingfoil : footswap",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "-TTIAGyH6iM",
    "title": "WING FOIL: How to switch stance",
    "url": "https://www.youtube.com/watch?v=-TTIAGyH6iM",
    "create": {
      "slug": "wingfoil-footswap",
      "name": "Wingfoil : footswap",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "bS_cFjazfTE",
    "title": "WING FOIL: How to switch stance (foot swap, heelside / toeside switch)",
    "url": "https://www.youtube.com/watch?v=bS_cFjazfTE",
    "create": {
      "slug": "wingfoil-footswap",
      "name": "Wingfoil : footswap",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "oQGpPGARLI0",
    "title": "Hydrofoil principles and gear guide (P2, wingfoil gear guide)",
    "url": "https://www.youtube.com/watch?v=oQGpPGARLI0",
    "create": {
      "slug": "wingfoil-gear",
      "name": "Wingfoil : matos",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "RPc75_723b8",
    "title": "Looking after wing foil gear (tips to make your gear last longer)",
    "url": "https://www.youtube.com/watch?v=RPc75_723b8",
    "create": {
      "slug": "wingfoil-gear",
      "name": "Wingfoil : matos",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "IxzYFBo-N7k",
    "title": "Wing Foil Gear Guide: Hand Wings, Leashes, Protection & Footstraps.",
    "url": "https://www.youtube.com/watch?v=IxzYFBo-N7k",
    "create": {
      "slug": "wingfoil-gear",
      "name": "Wingfoil : matos",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "KHT1zT57Lrc",
    "title": "Wing-Foil Gear Guide: Boards (volume & shape)",
    "url": "https://www.youtube.com/watch?v=KHT1zT57Lrc",
    "create": {
      "slug": "wingfoil-gear",
      "name": "Wingfoil : matos",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "jqZna51y0B0",
    "title": "Wing Foil: Heineken Jibe (detailed tutorial)",
    "url": "https://www.youtube.com/watch?v=jqZna51y0B0",
    "create": {
      "slug": "wingfoil-heineken-jibe",
      "name": "Wingfoil : Heineken jibe",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "nHPB4siiprQ",
    "title": "How to Wing Foil: Introduction (from wing handling to first flights)",
    "url": "https://www.youtube.com/watch?v=nHPB4siiprQ",
    "create": {
      "slug": "wingfoil-intro",
      "name": "Wingfoil : introduction",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "oiSuTgL4PAo",
    "title": "Wing Foil Beginner Mistakes (review video)",
    "url": "https://www.youtube.com/watch?v=oiSuTgL4PAo",
    "create": {
      "slug": "wingfoil-intro",
      "name": "Wingfoil : introduction",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "D6QzwVy9bq0",
    "title": "Brief-Backwind Jibe or Race Jibe (Wing Foil Tutorial)",
    "url": "https://www.youtube.com/watch?v=D6QzwVy9bq0",
    "create": {
      "slug": "wingfoil-jibe",
      "name": "Wingfoil : jibe",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "-a6P9FXp61k",
    "title": "How to jibe II (extra tips for the wing foil jibe)",
    "url": "https://www.youtube.com/watch?v=-a6P9FXp61k",
    "create": {
      "slug": "wingfoil-jibe",
      "name": "Wingfoil : jibe",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "QWAD57ZAzHI",
    "title": "Wing Foil Jibe / Gybe:  Heel to Toe, Common Mistakes, Toe to Heel & Training Tips",
    "url": "https://www.youtube.com/watch?v=QWAD57ZAzHI",
    "create": {
      "slug": "wingfoil-jibe",
      "name": "Wingfoil : jibe",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "12unYNCfvBk",
    "title": "Wing Foil: How to Jump",
    "url": "https://www.youtube.com/watch?v=12unYNCfvBk",
    "create": {
      "slug": "wingfoil-jump",
      "name": "Wingfoil : jump",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "lz9355-4OgA",
    "title": "Wing Foil Pumping / Light-Wind Take Off (all steps from basic to advanced)",
    "url": "https://www.youtube.com/watch?v=lz9355-4OgA",
    "create": {
      "slug": "wingfoil-pump",
      "name": "Wingfoil : pump / décollage",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "i9_zbTZRXpI",
    "title": "WING FOIL: Pump Take Off - Part 2",
    "url": "https://www.youtube.com/watch?v=i9_zbTZRXpI",
    "create": {
      "slug": "wingfoil-pump",
      "name": "Wingfoil : pump / décollage",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "kmyH_JXJDGI",
    "title": "Wing Foil: Raley",
    "url": "https://www.youtube.com/watch?v=kmyH_JXJDGI",
    "create": {
      "slug": "wingfoil-raley",
      "name": "Wingfoil : raley",
      "category": "Wingfoil",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "ZoNO6jFEiSs",
    "title": "WING FOIL Crashing & tips to reduce the risks",
    "url": "https://www.youtube.com/watch?v=ZoNO6jFEiSs",
    "create": {
      "slug": "wingfoil-safety",
      "name": "Wingfoil : sécurité / chutes",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "8bJlfg5UW4s",
    "title": "Stinkbug Start & Rodeo Stinkbug - to wingfoil on lower-volume boards, or in more choppy conditions.",
    "url": "https://www.youtube.com/watch?v=8bJlfg5UW4s",
    "create": {
      "slug": "wingfoil-stinkbug",
      "name": "Wingfoil : stinkbug start",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "mu5poHFtczE",
    "title": "WING FOIL: Heel Toe Tack",
    "url": "https://www.youtube.com/watch?v=mu5poHFtczE",
    "create": {
      "slug": "wingfoil-tack",
      "name": "Wingfoil : tack",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "6ZBEkFaxh2c",
    "title": "Wing Foil: Toe to Heel Tack",
    "url": "https://www.youtube.com/watch?v=6ZBEkFaxh2c",
    "create": {
      "slug": "wingfoil-tack",
      "name": "Wingfoil : tack",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "7temrTg_2lM",
    "title": "Wing-Pass Tack (wing foil tutorial)",
    "url": "https://www.youtube.com/watch?v=7temrTg_2lM",
    "create": {
      "slug": "wingfoil-tack",
      "name": "Wingfoil : tack",
      "category": "Wingfoil",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "b8NLyZj9uA8",
    "title": "WING FOIL: Toeside (tips, mistakes & upwind riding)",
    "url": "https://www.youtube.com/watch?v=b8NLyZj9uA8",
    "create": {
      "slug": "wingfoil-toeside",
      "name": "Wingfoil : toeside",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "oIg23jl3yV8",
    "title": "Wing Foil Wave Riding P2",
    "url": "https://www.youtube.com/watch?v=oIg23jl3yV8",
    "create": {
      "slug": "wingfoil-wave",
      "name": "Wingfoil : vague",
      "category": "Wingfoil",
      "description": "Module « Vague » — Kitesurf College."
    }
  },
  {
    "youtubeId": "yYAzwbQy02g",
    "title": "Wing Foil: Catching your 1st waves",
    "url": "https://www.youtube.com/watch?v=yYAzwbQy02g",
    "create": {
      "slug": "wingfoil-wave",
      "name": "Wingfoil : vague",
      "category": "Wingfoil",
      "description": "Module « Vague » — Kitesurf College."
    }
  },
  {
    "youtubeId": "T5oPed3vAWw",
    "title": "Wing foil: Dealing with shore dump",
    "url": "https://www.youtube.com/watch?v=T5oPed3vAWw",
    "create": {
      "slug": "wingfoil-wave",
      "name": "Wingfoil : vague",
      "category": "Wingfoil",
      "description": "Module « Vague » — Kitesurf College."
    }
  },
  {
    "youtubeId": "8afFdRYWyoM",
    "title": "Gybe & Footswap Tutorials  (Strapless & Directional Kitesurf Series)",
    "url": "https://www.youtube.com/watch?v=8afFdRYWyoM",
    "create": {
      "slug": "strapless-gybe",
      "name": "Strapless : gybe & footswap",
      "category": "Strapless",
      "description": "Module « Navigation » — Kitesurf College."
    }
  },
  {
    "youtubeId": "wlJ_BgKqvIA",
    "title": "Strapless pop / ollie (kitesurf tutorial)",
    "url": "https://www.youtube.com/watch?v=wlJ_BgKqvIA",
    "create": {
      "slug": "strapless-pop",
      "name": "Strapless : pop / ollie",
      "category": "Strapless",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "LORwvFbFWRk",
    "title": "Quick Starts on a Directional Board",
    "url": "https://www.youtube.com/watch?v=LORwvFbFWRk",
    "create": {
      "slug": "strapless-quick-start",
      "name": "Strapless : quick start",
      "category": "Strapless",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "-7siieD6HFs",
    "title": "STRAPLESS & DIRECTIONAL, all tutorials together without breaks",
    "url": "https://www.youtube.com/watch?v=-7siieD6HFs",
    "create": {
      "slug": "strapless-serie-complete",
      "name": "Strapless : série complète",
      "category": "Strapless",
      "description": "Module « Freestyle » — Kitesurf College."
    }
  },
  {
    "youtubeId": "wiWy6bjfoCg",
    "title": "Roll Tack / Duck Tack Tutorial (with a strapless directional board)",
    "url": "https://www.youtube.com/watch?v=wiWy6bjfoCg",
    "create": {
      "slug": "strapless-tack",
      "name": "Strapless : tack",
      "category": "Strapless",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "DnAgzcS55wQ",
    "title": "Tack Tutorial (Strapless & Directional Kitesurf Series)",
    "url": "https://www.youtube.com/watch?v=DnAgzcS55wQ",
    "create": {
      "slug": "strapless-tack",
      "name": "Strapless : tack",
      "category": "Strapless",
      "description": "Module « Transitions » — Kitesurf College."
    }
  },
  {
    "youtubeId": "7pIuAOkd2u4",
    "title": "How to surf white water",
    "url": "https://www.youtube.com/watch?v=7pIuAOkd2u4",
    "create": {
      "slug": "strapless-white-water",
      "name": "Strapless : white water",
      "category": "Strapless",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "UqOEuaGSuGc",
    "title": "HOW TO SURF, part 1, Small White-Water Waves (detailed guide)",
    "url": "https://www.youtube.com/watch?v=UqOEuaGSuGc",
    "create": {
      "slug": "strapless-white-water",
      "name": "Strapless : white water",
      "category": "Strapless",
      "description": "Module « Premiers vols » — Kitesurf College."
    }
  },
  {
    "youtubeId": "4FoA9elNLj4",
    "title": "How to kitesurf: 313 handle pass",
    "url": "https://www.youtube.com/watch?v=4FoA9elNLj4",
    "mergeSlug": "three-one-three"
  },
  {
    "youtubeId": "RFSeTqBhY20",
    "title": "Backstalling - how to spot it & fix it (kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=RFSeTqBhY20",
    "create": {
      "slug": "tuto-backstalling-how-to-spot-it-fix-it",
      "name": "Backstalling - how to spot it & fix it",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "e8qMLUbrUu4",
    "title": "Basic Relaunches (How to Kitesurf / Kiteboarding tutorial, Part 1)",
    "url": "https://www.youtube.com/watch?v=e8qMLUbrUu4",
    "mergeSlug": "water-relaunch"
  },
  {
    "youtubeId": "IA5Z9tsdR7I",
    "title": "Checking lines to make your kite fly correctly",
    "url": "https://www.youtube.com/watch?v=IA5Z9tsdR7I",
    "create": {
      "slug": "tuto-checking-lines-to-make-your-kite-fly-correctly",
      "name": "Checking lines to make your kite fly correctly",
      "category": "Débuter",
      "description": "Module « Régler son matériel » — Kitesurf College."
    }
  },
  {
    "youtubeId": "3BTgyiNSPmc",
    "title": "First 14 Tricks for Kiteboarders (hooked in, twintip, light wind skills)",
    "url": "https://www.youtube.com/watch?v=3BTgyiNSPmc",
    "create": {
      "slug": "tuto-first-14-tricks-for-kiteboarders",
      "name": "First 14 Tricks for Kiteboarders",
      "category": "Bonus",
      "description": "Bonus — Kitesurf College."
    }
  },
  {
    "youtubeId": "NYP2P-yYy8Q",
    "title": "Foul Hook, Miss Hook and Re-Hook Tutorial",
    "url": "https://www.youtube.com/watch?v=NYP2P-yYy8Q",
    "create": {
      "slug": "tuto-foul-hook-miss-hook-and-re-hook-tutorial",
      "name": "Foul Hook, Miss Hook and Re-Hook Tutorial",
      "category": "Débuter",
      "description": "Module « La sécurité » — Kitesurf College."
    }
  },
  {
    "youtubeId": "gd257WOYOAA",
    "title": "How to do a Running Start (twintip kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=gd257WOYOAA",
    "mergeSlug": "beach-start"
  },
  {
    "youtubeId": "AZssXDnrGjQ",
    "title": "How to fly a kite (detailed guide to small 2-line power kites / trainer kites)",
    "url": "https://www.youtube.com/watch?v=AZssXDnrGjQ",
    "create": {
      "slug": "tuto-how-to-fly-a-kite",
      "name": "How to fly a kite",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "xKsawlnMOvw",
    "title": "How to Kitesurf: Bodydrag Tutorial",
    "url": "https://www.youtube.com/watch?v=xKsawlnMOvw",
    "mergeSlug": "body-drag"
  },
  {
    "youtubeId": "u6G8ajDZL_Q",
    "title": "How to kitesurf downwind",
    "url": "https://www.youtube.com/watch?v=u6G8ajDZL_Q",
    "mergeSlug": "debuter-la-descente-sous-le-vent"
  },
  {
    "youtubeId": "oE9ynbq1qTQ",
    "title": "How to Kitesurf: Set-Up (LEI, inflatable kite)",
    "url": "https://www.youtube.com/watch?v=oE9ynbq1qTQ",
    "mergeSlug": "debuter-greer-son-aile"
  },
  {
    "youtubeId": "9pK4a1ZZ0S8",
    "title": "How to Kitesurf: Trainer Kite Tutorial",
    "url": "https://www.youtube.com/watch?v=9pK4a1ZZ0S8",
    "create": {
      "slug": "tuto-how-to-kitesurf-trainer-kite-tutorial",
      "name": "How to Kitesurf: Trainer Kite Tutorial",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "3b0jtlMlAdU",
    "title": "Kite boarding in light wind (detailed kitesurf tutorial)",
    "url": "https://www.youtube.com/watch?v=3b0jtlMlAdU",
    "mergeSlug": "debuter-le-vent-leger"
  },
  {
    "youtubeId": "NrSzKBdMX0E",
    "title": "Kite Control 101 (tips for first kitesurf lesson)",
    "url": "https://www.youtube.com/watch?v=NrSzKBdMX0E",
    "create": {
      "slug": "tuto-kite-control-101",
      "name": "Kite Control 101",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "LIK71w1oylQ",
    "title": "Kite Control II (controlling the power of a kite)",
    "url": "https://www.youtube.com/watch?v=LIK71w1oylQ",
    "create": {
      "slug": "tuto-kite-control-ii",
      "name": "Kite Control II",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "VhuHhEtJWf4",
    "title": "Kite Front Stalls (how to fix and how to avoid)",
    "url": "https://www.youtube.com/watch?v=VhuHhEtJWf4",
    "create": {
      "slug": "tuto-kite-front-stalls",
      "name": "Kite Front Stalls",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "5wS5G7vCvz0",
    "title": "Kite Shapes Explained (Bow, Delta, C kite, Hybrid, Flat, Aspect Ratio, Buying Choices etc)",
    "url": "https://www.youtube.com/watch?v=5wS5G7vCvz0",
    "create": {
      "slug": "tuto-kite-shapes-explained",
      "name": "Kite Shapes Explained",
      "category": "Débuter",
      "description": "Module « Le choix du matériel » — Kitesurf College."
    }
  },
  {
    "youtubeId": "DmIZPXLxl3M",
    "title": "Kitesurf Depower Systems (Bar, Trim Strap, Rigging Options, Backstalling, Wind Conditions etc)",
    "url": "https://www.youtube.com/watch?v=DmIZPXLxl3M",
    "create": {
      "slug": "tuto-kitesurf-depower-systems",
      "name": "Kitesurf Depower Systems",
      "category": "Débuter",
      "description": "Module « Le choix du matériel » — Kitesurf College."
    }
  },
  {
    "youtubeId": "rWCvcR_xZRU",
    "title": "Kitesurfing one handed & board rescues (kiteboard, twintip tutorial)",
    "url": "https://www.youtube.com/watch?v=rWCvcR_xZRU",
    "create": {
      "slug": "tuto-kitesurfing-one-handed-board-rescues",
      "name": "Kitesurfing one handed & board rescues",
      "category": "Débuter",
      "description": "Module « À l'eau » — Kitesurf College."
    }
  },
  {
    "youtubeId": "mI8UVcLvipg",
    "title": "Kitesurf Lesson Mistakes & Tips For Avoiding Them",
    "url": "https://www.youtube.com/watch?v=mI8UVcLvipg",
    "create": {
      "slug": "tuto-lesson-mistakes",
      "name": "Erreurs de cours & tips",
      "category": "Débuter",
      "description": "Module « Adapter sa pratique » — Kitesurf College."
    }
  },
  {
    "youtubeId": "lHO50PSJIp8",
    "title": "Making your kiting gear last longer",
    "url": "https://www.youtube.com/watch?v=lHO50PSJIp8",
    "create": {
      "slug": "tuto-making-your-kiting-gear-last-longer",
      "name": "Making your kiting gear last longer",
      "category": "Débuter",
      "description": "Module « Le choix du matériel » — Kitesurf College."
    }
  },
  {
    "youtubeId": "Niw8e7RP9L8",
    "title": "Parking a kite at 12 (When you can and when you can’t)",
    "url": "https://www.youtube.com/watch?v=Niw8e7RP9L8",
    "create": {
      "slug": "tuto-parking-a-kite-at-12",
      "name": "Parking a kite at 12",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "mCzKVypsctw",
    "title": "Power Kite Parts and Terminology",
    "url": "https://www.youtube.com/watch?v=mCzKVypsctw",
    "create": {
      "slug": "tuto-power-kite-parts-and-terminology",
      "name": "Power Kite Parts and Terminology",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "zpm7shkh5xQ",
    "title": "Power Kite Principles Part 1 - becoming an independent kiter (Aug 2020 update)",
    "url": "https://www.youtube.com/watch?v=zpm7shkh5xQ",
    "create": {
      "slug": "tuto-power-kite-principles-part-1-becoming-an-indepen",
      "name": "Power Kite Principles Part 1 - becoming an independent kiter",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "GtooKREurjo",
    "title": "Power Kite Principles Part 2: technical kite info (updated Aug 2020)",
    "url": "https://www.youtube.com/watch?v=GtooKREurjo",
    "create": {
      "slug": "tuto-power-kite-principles-part-2-technical-kite-info",
      "name": "Power Kite Principles Part 2: technical kite info",
      "category": "Débuter",
      "description": "Module « Les bases essentielles » — Kitesurf College."
    }
  },
  {
    "youtubeId": "ze_AQUMCbxo",
    "title": "How to Raley, unhooked kiteboarding tutorial",
    "url": "https://www.youtube.com/watch?v=ze_AQUMCbxo",
    "mergeSlug": "raley-front"
  },
  {
    "youtubeId": "TF2n-VEjUTE",
    "title": "Raley Tutorial (Kiteboarding / Kitesurfing)",
    "url": "https://www.youtube.com/watch?v=TF2n-VEjUTE",
    "mergeSlug": "raley-front"
  },
  {
    "youtubeId": "fjh8q3C5bZE",
    "title": "Relaunch Basics (how to kitesurf / kiteboard tutorial, Part 1)",
    "url": "https://www.youtube.com/watch?v=fjh8q3C5bZE",
    "mergeSlug": "water-relaunch"
  },
  {
    "youtubeId": "8PgfRJHSTLs",
    "title": "Relaunch Part II, Advanced (kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=8PgfRJHSTLs",
    "mergeSlug": "water-relaunch"
  },
  {
    "youtubeId": "VCZp3YLMxsA",
    "title": "The Wind Window (an introduction to kiteboarding and power kiting)",
    "url": "https://www.youtube.com/watch?v=VCZp3YLMxsA",
    "mergeSlug": "debuter-la-fenetre-de-vol"
  },
  {
    "youtubeId": "F1aXHQmpblc",
    "title": "Setting trim & stopper (for different heights & wind speeds)",
    "url": "https://www.youtube.com/watch?v=F1aXHQmpblc",
    "mergeSlug": "debuter-le-trim"
  },
  {
    "youtubeId": "TM7oXdd0d4Q",
    "title": "Trim System Comparison: Steering Line Trim Vs. Centre Line Trim",
    "url": "https://www.youtube.com/watch?v=TM7oXdd0d4Q",
    "create": {
      "slug": "tuto-trim-system-comparison-steering-line-trim-vs-cen",
      "name": "Trim System Comparison: Steering Line Trim Vs. Centre Line Trim",
      "category": "Débuter",
      "description": "Module « Régler son matériel » — Kitesurf College."
    }
  },
  {
    "youtubeId": "Uo6R01SJmHo",
    "title": "Tuning Bar & Lines (checking kite lines are equal length)",
    "url": "https://www.youtube.com/watch?v=Uo6R01SJmHo",
    "mergeSlug": "debuter-regler-sa-barre"
  },
  {
    "youtubeId": "LWEi_kZoACk",
    "title": "Twintips explained (freeride, freestyle, rocker, outline etc)",
    "url": "https://www.youtube.com/watch?v=LWEi_kZoACk",
    "mergeSlug": "debuter-la-planche"
  },
  {
    "youtubeId": "_hudNYbga-Q",
    "title": "How to Kitesurf: Water Re-Launch (Basics)",
    "url": "https://www.youtube.com/watch?v=_hudNYbga-Q",
    "mergeSlug": "water-relaunch"
  },
  {
    "youtubeId": "_6wI48iJ4lc",
    "title": "Wind, Weather & Conditions (for Kitesurfing and Wind Sports)",
    "url": "https://www.youtube.com/watch?v=_6wI48iJ4lc",
    "create": {
      "slug": "tuto-wind-weather-conditions",
      "name": "Wind, Weather & Conditions",
      "category": "Débuter",
      "description": "Module « Adapter sa pratique » — Kitesurf College."
    }
  },
  {
    "youtubeId": "2JdXPdgaK4g",
    "title": "how to backroll (kiteboard / kitesurf tutorial)",
    "url": "https://www.youtube.com/watch?v=2JdXPdgaK4g",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "gOyp44_zhv0",
    "title": "How to Backroll Transition, Kitesurf Tutorial",
    "url": "https://www.youtube.com/watch?v=gOyp44_zhv0",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "cODij99_UPQ",
    "title": "How to Kitesurf: Back Roll",
    "url": "https://www.youtube.com/watch?v=cODij99_UPQ",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "-owy0erDsEg",
    "title": "kite surf backroll - alex buss",
    "url": "https://www.youtube.com/watch?v=-owy0erDsEg",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "Nlt7L9L5hf4",
    "title": "Kitesurf double back roll",
    "url": "https://www.youtube.com/watch?v=Nlt7L9L5hf4",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "hUl23SY8bsI",
    "title": "OLD SCHOOL 101 CHAPTER 3 , Backroll Tricks",
    "url": "https://www.youtube.com/watch?v=hUl23SY8bsI",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "2P8oqa-GlzY",
    "title": "Surface backroll (full 360 ride with a twintip)",
    "url": "https://www.youtube.com/watch?v=2P8oqa-GlzY",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "dVwYmj9X2J0",
    "title": "Surface Backroll Transition (Twintip Tack)",
    "url": "https://www.youtube.com/watch?v=dVwYmj9X2J0",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "GkIQoWvHiCo",
    "title": "Unhooked Backroll Tutorial (from new how-to-unhook series)",
    "url": "https://www.youtube.com/watch?v=GkIQoWvHiCo",
    "mergeSlug": "backroll-simple"
  },
  {
    "youtubeId": "lkdkTCJxeek",
    "title": "Beach Start (twintip, kitesurf tutorial)",
    "url": "https://www.youtube.com/watch?v=lkdkTCJxeek",
    "mergeSlug": "beach-start"
  },
  {
    "youtubeId": "tzx-R7nHNHA",
    "title": "Kiteboarding Back-roll Board-off Light-Wind",
    "url": "https://www.youtube.com/watch?v=tzx-R7nHNHA",
    "mergeSlug": "board-off"
  },
  {
    "youtubeId": "MQmLq19_CtA",
    "title": "Backroll darkslide (kitesurf tutorial)",
    "url": "https://www.youtube.com/watch?v=MQmLq19_CtA",
    "mergeSlug": "darkslide"
  },
  {
    "youtubeId": "OeJkgDGSFzE",
    "title": "Darkslide with backroll",
    "url": "https://www.youtube.com/watch?v=OeJkgDGSFzE",
    "mergeSlug": "darkslide"
  },
  {
    "youtubeId": "EjGXImaOBY4",
    "title": "How to Darkslide (Kitesurf / Kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=EjGXImaOBY4",
    "mergeSlug": "darkslide"
  },
  {
    "youtubeId": "Z3sd2mbehS4",
    "title": "How To Jesus Walk (Kitesurf / Kiteboard Tutorial)",
    "url": "https://www.youtube.com/watch?v=Z3sd2mbehS4",
    "mergeSlug": "darkslide"
  },
  {
    "youtubeId": "5t1EnF0bTVI",
    "title": "How to kitesurf: Darkslide",
    "url": "https://www.youtube.com/watch?v=5t1EnF0bTVI",
    "mergeSlug": "darkslide"
  },
  {
    "youtubeId": "jLYTYGnZNqg",
    "title": "Down Loop Transition - Kite Surf Co Tutorial",
    "url": "https://www.youtube.com/watch?v=jLYTYGnZNqg",
    "mergeSlug": "down-loop"
  },
  {
    "youtubeId": "N_PZx34tj94",
    "title": "How to Downloop Transition, Twintip Tutorial (Basic + Carving turns)",
    "url": "https://www.youtube.com/watch?v=N_PZx34tj94",
    "mergeSlug": "down-loop"
  },
  {
    "youtubeId": "Ajrr_KqG9U4",
    "title": "Kite Foil 360 Tutorial",
    "url": "https://www.youtube.com/watch?v=Ajrr_KqG9U4",
    "mergeSlug": "foil-360"
  },
  {
    "youtubeId": "JrXWZzEZZHM",
    "title": "Kite Foil: Jumps (small jumps, mistakes & mid size jumps)",
    "url": "https://www.youtube.com/watch?v=JrXWZzEZZHM",
    "mergeSlug": "foil-jump"
  },
  {
    "youtubeId": "aRn5t0zkSKI",
    "title": "Heelside Backflip Tutorial (popped inverted frontroll)",
    "url": "https://www.youtube.com/watch?v=aRn5t0zkSKI",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "n89FBU-snsY",
    "title": "How to do an unhooked frontroll or s-bend (kiteboarding tutorial)",
    "url": "https://www.youtube.com/watch?v=n89FBU-snsY",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "hnZR1RPBorA",
    "title": "How to Kitesurf: Front Roll",
    "url": "https://www.youtube.com/watch?v=hnZR1RPBorA",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "7NOg9e_Z_B4",
    "title": "How to Kitesurf: Frontroll 2017",
    "url": "https://www.youtube.com/watch?v=7NOg9e_Z_B4",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "nHJQynGBAX0",
    "title": "How to Kitesurf: Frontroll Transition",
    "url": "https://www.youtube.com/watch?v=nHJQynGBAX0",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "0ZWCzdWgUCQ",
    "title": "Kiteboard Backflip from Toeside (+ pops from toeside)",
    "url": "https://www.youtube.com/watch?v=0ZWCzdWgUCQ",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "xCFqQH0x-R4",
    "title": "Kiteboard: Frontroll Hand Drag Tutorial",
    "url": "https://www.youtube.com/watch?v=xCFqQH0x-R4",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "16-w1gyrOME",
    "title": "Kitesurf double front-roll tail-grab",
    "url": "https://www.youtube.com/watch?v=16-w1gyrOME",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "TGtoLSHX4uU",
    "title": "OLD SCHOOL 101 CHAPTER 5, Frontroll Tricks",
    "url": "https://www.youtube.com/watch?v=TGtoLSHX4uU",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "MGyrwZmYdFc",
    "title": "Triple Front Roll Transition",
    "url": "https://www.youtube.com/watch?v=MGyrwZmYdFc",
    "mergeSlug": "frontroll-simple"
  },
  {
    "youtubeId": "QUQISgQ3yME",
    "title": "Jump Transitions with Grabs and More",
    "url": "https://www.youtube.com/watch?v=QUQISgQ3yME",
    "mergeSlug": "grab-indy"
  },
  {
    "youtubeId": "pejswx55LnE",
    "title": "OLD SCHOOL 101 CHAPTER 2, Grabs to Boards Offs",
    "url": "https://www.youtube.com/watch?v=pejswx55LnE",
    "mergeSlug": "grab-indy"
  },
  {
    "youtubeId": "QJ_gmo4yEKA",
    "title": "OLD SCHOOL 101 CHAPTER 2B tip for better board control",
    "url": "https://www.youtube.com/watch?v=QJ_gmo4yEKA",
    "mergeSlug": "grab-indy"
  },
  {
    "youtubeId": "HVTpAq_NYXI",
    "title": "Basic hand drags + hand drags with backroll transitions & loops (kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=HVTpAq_NYXI",
    "mergeSlug": "hand-drag-backroll"
  },
  {
    "youtubeId": "8FtHXedSjpw",
    "title": "Kitesurf / Kiteboard Hand Drag Tutorial",
    "url": "https://www.youtube.com/watch?v=8FtHXedSjpw",
    "mergeSlug": "hand-drag-backroll"
  },
  {
    "youtubeId": "Ef6V0JGe10M",
    "title": "How to Heli Loop (Extended Kitesurf Tutorial)",
    "url": "https://www.youtube.com/watch?v=Ef6V0JGe10M",
    "mergeSlug": "heli-loop"
  },
  {
    "youtubeId": "RfYQbLQJr3o",
    "title": "How to Heli Loop, Back Loop, Powered Loop and Mega Loop (aerial kiteloops)",
    "url": "https://www.youtube.com/watch?v=RfYQbLQJr3o",
    "mergeSlug": "heli-loop"
  },
  {
    "youtubeId": "ax-JVPBgmak",
    "title": "Jumping Higher, Kiteboard Tutorial (inc: landing, heli loops, launching, conditions & safety)",
    "url": "https://www.youtube.com/watch?v=ax-JVPBgmak",
    "mergeSlug": "heli-loop"
  },
  {
    "youtubeId": "0JzAxLsZOos",
    "title": "Soft landings without heli loops (improved double movements & more)",
    "url": "https://www.youtube.com/watch?v=0JzAxLsZOos",
    "mergeSlug": "heli-loop"
  },
  {
    "youtubeId": "I8-x7dTeqio",
    "title": "Backroll Kiteloops (Beginner / Light-Wind Version)",
    "url": "https://www.youtube.com/watch?v=I8-x7dTeqio",
    "mergeSlug": "kite-loop-simple"
  },
  {
    "youtubeId": "9XuJCc8Qcgk",
    "title": "Full kite loop and catch from a 2m jump (10m rebel)",
    "url": "https://www.youtube.com/watch?v=9XuJCc8Qcgk",
    "mergeSlug": "kite-loop-simple"
  },
  {
    "youtubeId": "QHoQI-7YvRk",
    "title": "How to kite loop and catch?! – Vol. 2 MEGA guide to kite loops",
    "url": "https://www.youtube.com/watch?v=QHoQI-7YvRk",
    "mergeSlug": "kite-loop-simple"
  },
  {
    "youtubeId": "abU3gbuGeF0",
    "title": "Introduction to Kiteloops (how to kitesurf / kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=abU3gbuGeF0",
    "mergeSlug": "kite-loop-simple"
  },
  {
    "youtubeId": "jbrt-_4Up_Y",
    "title": "Kite Loop Late Backroll & all training steps",
    "url": "https://www.youtube.com/watch?v=jbrt-_4Up_Y",
    "mergeSlug": "kite-loop-simple"
  },
  {
    "youtubeId": "N7BY6wuak_8",
    "title": "MEGA guide to kite loops – Vol. 1 (how to + training steps)",
    "url": "https://www.youtube.com/watch?v=N7BY6wuak_8",
    "mergeSlug": "kite-loop-simple"
  },
  {
    "youtubeId": "g9xj0q6lXtk",
    "title": "The MEGA guide to powered loops – Vol. 1 (how to + training steps)",
    "url": "https://www.youtube.com/watch?v=g9xj0q6lXtk",
    "mergeSlug": "kite-loop-simple"
  },
  {
    "youtubeId": "1xlLAWewPbk",
    "title": "Blind to Toeside Transition (twintip kitesurf trick tutorial)",
    "url": "https://www.youtube.com/watch?v=1xlLAWewPbk",
    "mergeSlug": "riding-blind"
  },
  {
    "youtubeId": "yiju53kKVV4",
    "title": "How to Kitesurf: Blind",
    "url": "https://www.youtube.com/watch?v=yiju53kKVV4",
    "mergeSlug": "riding-blind"
  },
  {
    "youtubeId": "pKIpcQwwSb0",
    "title": "Pop to blind, with toeside shifty",
    "url": "https://www.youtube.com/watch?v=pKIpcQwwSb0",
    "mergeSlug": "riding-blind"
  },
  {
    "youtubeId": "IfxGmMTjqyA",
    "title": "How to Kitesurf Upwind",
    "url": "https://www.youtube.com/watch?v=IfxGmMTjqyA",
    "mergeSlug": "riding-upwind"
  },
  {
    "youtubeId": "FWgU2V45QHc",
    "title": "How to Kitesurf Upwind (extended edition)",
    "url": "https://www.youtube.com/watch?v=FWgU2V45QHc",
    "mergeSlug": "riding-upwind"
  },
  {
    "youtubeId": "Sw81xcZf5qs",
    "title": "Turns & course control: controlling course, basic upwind & downwind, simple turns, complex turns etc",
    "url": "https://www.youtube.com/watch?v=Sw81xcZf5qs",
    "mergeSlug": "riding-upwind"
  },
  {
    "youtubeId": "OYJUxOlKxEw",
    "title": "Big kitesurf jump",
    "url": "https://www.youtube.com/watch?v=OYJUxOlKxEw",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "2Nf6usDas38",
    "title": "How to Jump Stop (twintip kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=2Nf6usDas38",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "1eDiP9A5LWQ",
    "title": "How to Kitesurf: Jumping, Part 1: small jumps, medium jumps & mistakes",
    "url": "https://www.youtube.com/watch?v=1eDiP9A5LWQ",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "8JqWBxt69P4",
    "title": "How to Kitesurf: Jumping, Part 1: Small Jumps, Medium Jumps, and Mistakes",
    "url": "https://www.youtube.com/watch?v=8JqWBxt69P4",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "fVrkoFSMlx4",
    "title": "How to Kitesurf: Pop (Quick Tips)",
    "url": "https://www.youtube.com/watch?v=fVrkoFSMlx4",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "bos1UCOjo0Y",
    "title": "How to Pop, in-depth for Kitesurfing / Kiteboarding Tutorial",
    "url": "https://www.youtube.com/watch?v=bos1UCOjo0Y",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "C3t2RGZqfY4",
    "title": "How to Pop, In-depth Kitesurf / Kiteboard Tutorial",
    "url": "https://www.youtube.com/watch?v=C3t2RGZqfY4",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "A6aWrMpnr_k",
    "title": "Jump Starts and Quick Starts (twintip kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=A6aWrMpnr_k",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "DCw42m7_h14",
    "title": "kitesurf how to jump",
    "url": "https://www.youtube.com/watch?v=DCw42m7_h14",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "WJefCkl4AgQ",
    "title": "Pre-Load Pop Take Off (drop & pop take off)",
    "url": "https://www.youtube.com/watch?v=WJefCkl4AgQ",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "PnT11aX1iDw",
    "title": "Send Jump (i.e. double send / double kite-movement ascent)",
    "url": "https://www.youtube.com/watch?v=PnT11aX1iDw",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "xQzkP6Wekbw",
    "title": "TAKE OFF (guide for launching better kitesurf jumps)",
    "url": "https://www.youtube.com/watch?v=xQzkP6Wekbw",
    "mergeSlug": "saut-droit"
  },
  {
    "youtubeId": "JRIZufOYGqQ",
    "title": "How to Kiteboard: Toeside (Quick Tips)",
    "url": "https://www.youtube.com/watch?v=JRIZufOYGqQ",
    "mergeSlug": "toe-side-riding"
  },
  {
    "youtubeId": "D4ecMg2aJeM",
    "title": "How to Ride Toeside (Kiteboard Tutorial)",
    "url": "https://www.youtube.com/watch?v=D4ecMg2aJeM",
    "mergeSlug": "toe-side-riding"
  },
  {
    "youtubeId": "jOITJ1Gpn_8",
    "title": "Kitesurf toe side back flip",
    "url": "https://www.youtube.com/watch?v=jOITJ1Gpn_8",
    "mergeSlug": "toe-side-riding"
  },
  {
    "youtubeId": "v15HBSR82Xo",
    "title": "1st step for learning slide tricks",
    "url": "https://www.youtube.com/watch?v=v15HBSR82Xo",
    "mergeSlug": "toeslide"
  },
  {
    "youtubeId": "FKNnmuTvguE",
    "title": "Carving Turns / Transitions (twintip kitesurf / kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=FKNnmuTvguE",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "dNRgDJJN4Ro",
    "title": "High-speed Carve Transitions (kiteboard tutorial)",
    "url": "https://www.youtube.com/watch?v=dNRgDJJN4Ro",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "ESmc2Zh8Sec",
    "title": "How to Kitesurf: Jump Transition",
    "url": "https://www.youtube.com/watch?v=ESmc2Zh8Sec",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "FMKHuEDfae4",
    "title": "How to Kitesurf: Transitions (Turns)",
    "url": "https://www.youtube.com/watch?v=FMKHuEDfae4",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "JHN31rTRjFU",
    "title": "How to Kitesurf: Transitions (turns) , Tutorial",
    "url": "https://www.youtube.com/watch?v=JHN31rTRjFU",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "it8ilvdfXYQ",
    "title": "Jump Transitions, Higher Jump Transitions & Common Mistakes (kiteboarding tutorial)",
    "url": "https://www.youtube.com/watch?v=it8ilvdfXYQ",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "85pkpjFxv-A",
    "title": "Jump Transitions, Higher Jump Transitions, and Common Mistakes (kiteboarding tutorial)",
    "url": "https://www.youtube.com/watch?v=85pkpjFxv-A",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "N47s-gDkjJ8",
    "title": "Kitesurf Handplant Transition",
    "url": "https://www.youtube.com/watch?v=N47s-gDkjJ8",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "VVtDM2950uU",
    "title": "Board Behind Waterstart (twintip kitesurf)",
    "url": "https://www.youtube.com/watch?v=VVtDM2950uU",
    "mergeSlug": "water-start"
  },
  {
    "youtubeId": "UMmy_iqpz2k",
    "title": "How to kitesurf: Water Start",
    "url": "https://www.youtube.com/watch?v=UMmy_iqpz2k",
    "mergeSlug": "water-start"
  },
  {
    "youtubeId": "Bjh7hmKU1eM",
    "title": "How to Kitesurf: Waterstart Tutorial 2017",
    "url": "https://www.youtube.com/watch?v=Bjh7hmKU1eM",
    "mergeSlug": "water-start"
  },
  {
    "youtubeId": "ZqWKVbmQn2Q",
    "title": "Kitesurfing lesson: how to water start",
    "url": "https://www.youtube.com/watch?v=ZqWKVbmQn2Q",
    "mergeSlug": "water-start"
  },
  {
    "youtubeId": "F-rZzXLqoKc",
    "title": "Waterstart II (extra waterstart tips)",
    "url": "https://www.youtube.com/watch?v=F-rZzXLqoKc",
    "mergeSlug": "water-start"
  }
];
