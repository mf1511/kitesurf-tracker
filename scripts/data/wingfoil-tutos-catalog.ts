/**
 * Catalogue Tutos Wingfoil — playlist PLgbP_MG5reEXNgN-xqnHHmG26rerj_IfV
 * Map: .tmp/wingfoil-tutos-map-v1.tsv
 */

export type WingfoilTutosLesson = {
  youtubeId: string;
  title: string;
  url: string;
  mergeSlug?: string;
  create?: { slug: string; name: string; category: string; description?: string };
};

export const WINGFOIL_TUTOS_LESSONS: WingfoilTutosLesson[] = [
  {
    "youtubeId": "pIyi4qCDs74",
    "title": "Tutos Wingfoil #1 - Comment bien s'équiper ?",
    "url": "https://www.youtube.com/watch?v=pIyi4qCDs74",
    "mergeSlug": "wingfoil-gear"
  },
  {
    "youtubeId": "qfc_w3U1HDo",
    "title": "Tutos Wingfoil #2 - Comment choisir sa zone de navigation ?",
    "url": "https://www.youtube.com/watch?v=qfc_w3U1HDo",
    "create": {
      "slug": "wingfoil-spot-zone",
      "name": "Wingfoil : zone de navigation",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Tutos Wingfoil."
    }
  },
  {
    "youtubeId": "9g0dvC9VNfo",
    "title": "Wingfoil Tutorials #3 - How to handle the wing?",
    "url": "https://www.youtube.com/watch?v=9g0dvC9VNfo",
    "create": {
      "slug": "wingfoil-wing-handling",
      "name": "Wingfoil : manipuler la wing",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Tutos Wingfoil."
    }
  },
  {
    "youtubeId": "T1caCUFfMxM",
    "title": "Wingfoil Tutorial #4 - How to prepare for your first flight?",
    "url": "https://www.youtube.com/watch?v=T1caCUFfMxM",
    "create": {
      "slug": "wingfoil-first-flight",
      "name": "Wingfoil : préparer le 1er vol",
      "category": "Wingfoil",
      "description": "Module « Premiers vols » — Tutos Wingfoil."
    }
  },
  {
    "youtubeId": "f2BklI-76dg",
    "title": "Wingfoil Tutorials #5 - How to change direction?",
    "url": "https://www.youtube.com/watch?v=f2BklI-76dg",
    "create": {
      "slug": "wingfoil-change-direction",
      "name": "Wingfoil : changer de direction",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Tutos Wingfoil."
    }
  },
  {
    "youtubeId": "-LhiIXdymGY",
    "title": "Wingfoil Tutorials #6 - How to take off?",
    "url": "https://www.youtube.com/watch?v=-LhiIXdymGY",
    "mergeSlug": "wingfoil-pump"
  },
  {
    "youtubeId": "1xfh1qW_F_Y",
    "title": "Wingfoil Tutorials #7 - How to Stabilize Your Flight?",
    "url": "https://www.youtube.com/watch?v=1xfh1qW_F_Y",
    "mergeSlug": "wingfoil-control"
  },
  {
    "youtubeId": "XfHQg4SvN9U",
    "title": "Wingfoil Tutorials #8 - How to perform a carving maneuver?",
    "url": "https://www.youtube.com/watch?v=XfHQg4SvN9U",
    "create": {
      "slug": "wingfoil-carve",
      "name": "Wingfoil : carving",
      "category": "Wingfoil",
      "description": "Module « Navigation » — Tutos Wingfoil."
    }
  },
  {
    "youtubeId": "tKaagz4iXJY",
    "title": "Wingfoil Tutorials #9 - How to perform a jibe?",
    "url": "https://www.youtube.com/watch?v=tKaagz4iXJY",
    "mergeSlug": "wingfoil-jibe"
  },
  {
    "youtubeId": "J0puGKR27uE",
    "title": "Tutos Wingfoil #10 - Comment réaliser le free surf ?",
    "url": "https://www.youtube.com/watch?v=J0puGKR27uE",
    "mergeSlug": "wingfoil-wave"
  }
];
