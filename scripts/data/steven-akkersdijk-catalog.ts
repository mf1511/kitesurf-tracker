/**
 * Catalogue Steven Akkersdijk validé — mapping → figures KiteQuest.
 * Les 3 vidéos « delete » ne sont pas listées.
 */

export const BONUS_CATEGORY = "Bonus";

export type StevenLesson = {
  youtubeId: string;
  title: string;
  url: string;
  /** Figure existante (merge) — catégorie / active inchangés */
  mergeSlug?: string;
  /** Création Bonus (active: false) */
  create?: { slug: string; name: string; category: string };
};

/** Compilations Easy Tricks → une figure Bonus (2 vidéos) */
export const STEVEN_BONUS_FIGURE = {
  slug: "bonus-easy-tricks",
  name: "Easy Tricks (SA Masterclass)",
  category: BONUS_CATEGORY,
} as const;

export const STEVEN_LESSONS: StevenLesson[] = [
  // —— Bonus ——
  {
    youtubeId: "GmnHt5FhUFw",
    title: "5 Easy Tricks For Kiteboarding Beginners //  SA Masterclass",
    url: "https://www.youtube.com/watch?v=GmnHt5FhUFw",
    create: STEVEN_BONUS_FIGURE,
  },
  {
    youtubeId: "sQ9EenKcjyg",
    title: "6 Beginner Friendly Tricks | Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=sQ9EenKcjyg",
    create: STEVEN_BONUS_FIGURE,
  },
  // —— Merges ——
  {
    youtubeId: "RssPfW0rYRw",
    title:
      "3 Ways to do a Backroll | Classic, Send and Inverted // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=RssPfW0rYRw",
    mergeSlug: "backroll-simple",
  },
  {
    youtubeId: "qlxAIYS0GiU",
    title:
      "3 Ways to do a Frontroll | Classic, Send and Inverted // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=qlxAIYS0GiU",
    mergeSlug: "frontroll-simple",
  },
  {
    youtubeId: "N1hRosTfF44",
    title: "3 Ways to land HIGH jumps | Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=N1hRosTfF44",
    mergeSlug: "saut-droit",
  },
  {
    youtubeId: "jO2fSGcAOOM",
    title: "5 tips to JUMP HIGHER on flat water // SA Masterclass",
    url: "https://www.youtube.com/watch?v=jO2fSGcAOOM",
    mergeSlug: "saut-droit",
  },
  {
    youtubeId: "_yyPaci2Q5M",
    title:
      "6 FUN Backroll variations | toeside, double and more! //  Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=_yyPaci2Q5M",
    mergeSlug: "backroll-simple",
  },
  {
    youtubeId: "YEgEGaMDmfY",
    title: "Around the world / Kite foil",
    url: "https://www.youtube.com/watch?v=YEgEGaMDmfY",
    mergeSlug: "foil-360",
  },
  {
    youtubeId: "i9tujb1jFNQ",
    title: "Average Kiteboarder tries the Moon Slide | Live Coaching",
    url: "https://www.youtube.com/watch?v=i9tujb1jFNQ",
    mergeSlug: "toeslide",
  },
  {
    youtubeId: "hDdNgXgIxvM",
    title: "Backroll Handdrag tutorial // SA Masterclass",
    url: "https://www.youtube.com/watch?v=hDdNgXgIxvM",
    mergeSlug: "hand-drag-backroll",
  },
  {
    youtubeId: "z2xeXrGdrBw",
    title: "Be DIFFERENT | Try this backroll // SA Masterclass",
    url: "https://www.youtube.com/watch?v=z2xeXrGdrBw",
    mergeSlug: "backroll-simple",
  },
  {
    youtubeId: "gEbytFaZJzo",
    title: "Boost higher with the PERFECT jump // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=gEbytFaZJzo",
    mergeSlug: "saut-droit",
  },
  {
    youtubeId: "sPaT4SceTyk",
    title:
      "First turns on a foil | Gybes and Footswitch // Kite Foil SA Masterclass",
    url: "https://www.youtube.com/watch?v=sPaT4SceTyk",
    mergeSlug: "jibe-foil",
  },
  {
    youtubeId: "6il4XjeETAA",
    title:
      "How to Backroll Hand Drag in 3 Easy Steps | Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=6il4XjeETAA",
    mergeSlug: "hand-drag-backroll",
  },
  {
    youtubeId: "NMUeVV3OZYQ",
    title: "How to Darkslide | 2 Easy Steps // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=NMUeVV3OZYQ",
    mergeSlug: "darkslide",
  },
  {
    youtubeId: "lDglyOlaSbg",
    title: "How to Moon Slide | Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=lDglyOlaSbg",
    mergeSlug: "toeslide",
  },
  {
    youtubeId: "ukC-MmFO9Qg",
    title: 'How to spice up your foiling "Roll tack" // SA Masterclass',
    url: "https://www.youtube.com/watch?v=ukC-MmFO9Qg",
    mergeSlug: "tack-foil",
  },
  {
    youtubeId: "BnKmSnBpciI",
    title:
      "How to turn on a foil | Tack and Rolltack // Kite Foil SA masterclass",
    url: "https://www.youtube.com/watch?v=BnKmSnBpciI",
    mergeSlug: "tack-foil",
  },
  {
    youtubeId: "Um3N8a_Y-P8",
    title: "Jump Transition - ALL you need to know // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=Um3N8a_Y-P8",
    mergeSlug: "jump-transition",
  },
  {
    youtubeId: "BI0TGidjqc8",
    title: "Landing your FIRST BOARDOFF // SA Masterclass",
    url: "https://www.youtube.com/watch?v=BI0TGidjqc8",
    mergeSlug: "board-off",
  },
  {
    youtubeId: "SpKBPv2L04s",
    title:
      "Learn to Heliloop / Downloop | 2 Easy Steps // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=SpKBPv2L04s",
    mergeSlug: "heli-loop",
  },
  {
    youtubeId: "9KDbHqXzOAg",
    title:
      "Progress further with the forward SEND JUMP // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=9KDbHqXzOAg",
    mergeSlug: "saut-droit",
  },
  {
    youtubeId: "WRS9IxSSMdc",
    title: "Pulling off the DARKSLIDE // SA Masterclass",
    url: "https://www.youtube.com/watch?v=WRS9IxSSMdc",
    mergeSlug: "darkslide",
  },
  {
    youtubeId: "gZg5uJVhaKY",
    title: "Road to Kiteloops | Getting Started // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=gZg5uJVhaKY",
    mergeSlug: "kite-loop-simple",
  },
  {
    youtubeId: "w2_s19Iabtc",
    title:
      "Road to Kiteloops | Timing, Gear and MEGALOOPS //  Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=w2_s19Iabtc",
    mergeSlug: "megaloop",
  },
  {
    youtubeId: "n52UpvN7UuQ",
    title: "Road to Kiteloops | Your first loops // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=n52UpvN7UuQ",
    mergeSlug: "kite-loop-simple",
  },
  {
    youtubeId: "O-6z1AKfTSM",
    title: "Sitting down on your FOIL // SA Masterclass",
    url: "https://www.youtube.com/watch?v=O-6z1AKfTSM",
    mergeSlug: "foil-balance",
  },
  {
    youtubeId: "iUFfH-1vwWQ",
    title:
      "Sliding in to the weekend with this delicious hand drag! // SA Masterclass",
    url: "https://www.youtube.com/watch?v=iUFfH-1vwWQ",
    mergeSlug: "hand-drag-basique",
  },
  {
    youtubeId: "9SYS3wdzu4s",
    title: "Stand out! Start riding blind // SA Masterclass",
    url: "https://www.youtube.com/watch?v=9SYS3wdzu4s",
    mergeSlug: "riding-blind",
  },
  {
    youtubeId: "dl_L3ps72SI",
    title:
      "Switch Tricks Challenge: Mastering Your Bad Side! // Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=dl_L3ps72SI",
    mergeSlug: "riding-switch",
  },
  {
    youtubeId: "4O6rdhIey2A",
    title:
      'This foiling trick should be on your "TO DO" list... The Ballerina // SA Masterclass',
    url: "https://www.youtube.com/watch?v=4O6rdhIey2A",
    mergeSlug: "light-wind-freestyle-foil",
  },
  {
    youtubeId: "JFySDtZ5_WM",
    title: "Trying the Viral Kiteloop Backflip | Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=JFySDtZ5_WM",
    mergeSlug: "backroll-kite-loop",
  },
  {
    youtubeId: "DX-YkEQwX14",
    title:
      "Trying the Viral Popped Backroll Hand Drag | Kiteboarding SA Masterclass",
    url: "https://www.youtube.com/watch?v=DX-YkEQwX14",
    mergeSlug: "hand-drag-backroll",
  },
];
