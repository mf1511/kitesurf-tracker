/**
 * Catalogue Duotone Academy Beginner — validé Marin (duotone-beginner-map-v1.tsv)
 */

export type DuotoneBeginnerLesson = {
  youtubeId: string;
  title: string;
  url: string;
  mergeSlug?: string;
  create?: { slug: string; name: string; category: string; description?: string };
};

export const DUOTONE_BEGINNER_LESSONS: DuotoneBeginnerLesson[] = [
  {
    "youtubeId": "ei63QqX-aaY",
    "title": "BEGINNER - Preperation of the kite - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=ei63QqX-aaY",
    "mergeSlug": "debuter-greer-son-aile"
  },
  {
    "youtubeId": "jwiaM0rUzSI",
    "title": "BEGINNER - Safety Release - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=jwiaM0rUzSI",
    "mergeSlug": "securite-largage"
  },
  {
    "youtubeId": "FhK4Li6Jn00",
    "title": "BEGINNER  - Launching your kite - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=FhK4Li6Jn00",
    "mergeSlug": "debuter-le-decollage-de-l-aile"
  },
  {
    "youtubeId": "OE69LLqbFqg",
    "title": "BEGINNER - Landing The Kite - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=OE69LLqbFqg",
    "mergeSlug": "debuter-latterrissage-de-l-aile"
  },
  {
    "youtubeId": "LsurXcVNouw",
    "title": "BEGINNER - Relaunch - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=LsurXcVNouw",
    "mergeSlug": "water-relaunch"
  },
  {
    "youtubeId": "WmDzW71VsAM",
    "title": "BEGINNER - 5th Line release & relaunch  - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=WmDzW71VsAM",
    "create": {
      "slug": "debuter-5th-line-relaunch",
      "name": "5th line release & relaunch",
      "category": "Débuter",
      "description": "Duotone Academy — Beginner."
    }
  },
  {
    "youtubeId": "NucMcWoQ0z0",
    "title": "BEGINNER - Bodydrag - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=NucMcWoQ0z0",
    "mergeSlug": "body-drag"
  },
  {
    "youtubeId": "bEF1pK6Ux6I",
    "title": "BEGINNER - Kitesurfing Rules - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=bEF1pK6Ux6I",
    "mergeSlug": "debuter-les-regles-de-priorite"
  },
  {
    "youtubeId": "bYG0luE9Rg0",
    "title": "BEGINNER - First use of the board - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=bYG0luE9Rg0",
    "mergeSlug": "debuter-la-planche"
  },
  {
    "youtubeId": "oyqG-tLr9rQ",
    "title": "BEGINNER - Waterstart - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=oyqG-tLr9rQ",
    "mergeSlug": "water-start"
  },
  {
    "youtubeId": "0b-ndNz0P_0",
    "title": "BEGINNER - Riding Upwind - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=0b-ndNz0P_0",
    "mergeSlug": "riding-upwind"
  },
  {
    "youtubeId": "mkuXYxvYmpE",
    "title": "BEGINNER - Sliding Transition - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=mkuXYxvYmpE",
    "mergeSlug": "transition-simple"
  },
  {
    "youtubeId": "l1fPt4pWLWk",
    "title": "BEGINNER - Jibe heel to toe - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=l1fPt4pWLWk",
    "create": {
      "slug": "jibe-heel-to-toe",
      "name": "Jibe heel to toe",
      "category": "Bases et transitions",
      "description": "Duotone Academy — Beginner."
    }
  },
  {
    "youtubeId": "2K7H8LShoVM",
    "title": "BEGINNER - Jibe toe to heel - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=2K7H8LShoVM",
    "create": {
      "slug": "jibe-toe-to-heel",
      "name": "Jibe toe to heel",
      "category": "Bases et transitions",
      "description": "Duotone Academy — Beginner."
    }
  },
  {
    "youtubeId": "96Ex_uJxsyY",
    "title": "BEGINNER - Ride one handed - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=96Ex_uJxsyY",
    "create": {
      "slug": "ride-one-handed",
      "name": "Ride one handed",
      "category": "Bases et transitions",
      "description": "Duotone Academy — Beginner."
    }
  },
  {
    "youtubeId": "LjlNVr_iWwY",
    "title": "BEGINNER - Ride toeside - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=LjlNVr_iWwY",
    "mergeSlug": "toe-side-riding"
  },
  {
    "youtubeId": "g8VBzOsKMyM",
    "title": "BEGINNER - Downloop jibe - Duotone Academy",
    "url": "https://www.youtube.com/watch?v=g8VBzOsKMyM",
    "mergeSlug": "power-jibe"
  }
];
