/**
 * Catalogue Les Coachings de Pierre — validé Marin (pierre-map-v2.tsv)
 */

export const SECURITE_CATEGORY = "Sécurité";
export const TUTORIELS_CATEGORY = "Tutoriels";

export type PierreLesson = {
  youtubeId: string;
  title: string;
  url: string;
  mergeSlug?: string;
  create?: { slug: string; name: string; category: string; description?: string };
};

function idFromUrl(url: string): string {
  const m = url.match(/[?&]v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/);
  if (!m) throw new Error(`youtubeId introuvable : ${url}`);
  return m[1];
}

/** Construit le catalogue depuis le TSV validé */
export function loadPierreCatalogFromTsv(tsv: string): PierreLesson[] {
  const lines = tsv.trim().split("\n").slice(1).filter(Boolean);
  const out: PierreLesson[] = [];

  for (const line of lines) {
    const [action, , targetSlug, targetName, video, url] = line.split("\t");
    if (!video || !url) continue;
    const youtubeId = idFromUrl(url);
    const base = { youtubeId, title: video, url };

    if (action === "merge" && targetSlug && targetSlug !== "—") {
      out.push({ ...base, mergeSlug: targetSlug.trim() });
      continue;
    }

    if (action === "create-securite" && targetSlug && targetSlug !== "—") {
      out.push({
        ...base,
        create: {
          slug: targetSlug.trim(),
          name: targetName.trim(),
          category: SECURITE_CATEGORY,
          description: "Module sécurité — Les Coachings de Pierre.",
        },
      });
      continue;
    }

    if (action === "tuto") {
      const slug = `tuto-${slugifyTitle(video)}`;
      out.push({
        ...base,
        create: {
          slug,
          name: shortTutoName(video),
          category: TUTORIELS_CATEGORY,
          description: "Tutoriel — Les Coachings de Pierre.",
        },
      });
    }
  }

  return out;
}

function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
}

function shortTutoName(title: string): string {
  return title
    .replace(/\s*[|–—].*$/, "")
    .replace(/\s*\(.*?\)\s*$/, "")
    .trim()
    .slice(0, 80);
}

/** Catalogue embarqué (snapshot TSV validé) — source de vérité pour l’import */
export const PIERRE_LESSONS: PierreLesson[] = loadPierreCatalogFromTsv(`
action	category	target_slug	target_name	video	url	note
merge	Débuter	debuter-le-decollage-de-l-aile	Le décollage de l'aile	Décoller et poser sans stress en kitesurf	https://www.youtube.com/watch?v=dVp5Z32f8OQ	
merge	Débuter	debuter-larguer-puis-poser	Larguer puis poser	Kite release = End of session?	https://www.youtube.com/watch?v=EFIA62t90H8	
merge	Débuter	debuter-pratiquer-en-securite	Pratiquer en sécurité	Kitesurfing safety (my recommendations)	https://www.youtube.com/watch?v=kvOlLoQ87UA	
create-securite	Sécurité	securite-arret-urgence	Arrêt d'urgence	L' ARRÊT D' URGENCE : une BASE pour bien CRANTER en kitesurf	https://www.youtube.com/watch?v=4IKKCu-JgTc	
merge	Débuter	debuter-le-leash-d-aile	Le leash d'aile	Le suic*de leash peut-il optimiser votre sécurité en kitesurf ?	https://www.youtube.com/watch?v=e_05U6veRSM	
merge	Débuter	debuter-le-decollage-de-l-aile	Le décollage de l'aile	Take off and land your kite alone	https://www.youtube.com/watch?v=shmw3tnr7I8	
merge	Surface tricks & drags	darkslide	Darkslide	1 technique, 3 figures ! (Darkslide / One Foot Drag / Jesus Walk)	https://www.youtube.com/watch?v=FodZHSt1epg	
merge	Débuter	transition-simple	La transition	A seamless TRANSITION in KITESURFING (learning and progression)	https://www.youtube.com/watch?v=RySoz7jbg6g	
merge	Débuter	water-start	Le waterstart	An effective waterstart! (The cornerstone of your kitesurfing skills)	https://www.youtube.com/watch?v=8CZS0HxjNRA	
merge	Surface tricks & drags	riding-blind	Riding blind	Blind kitesurfing: discovery and progression	https://www.youtube.com/watch?v=ofeHO2oGWK4	
merge	Kiteloops & loops	heli-loop	Heli loop (landing)	Comprendre les loops de réception	https://www.youtube.com/watch?v=TXsGwVEsCvU	
merge	Sauts & Big Air	backroll-simple	Backroll	Débloquez le backroll rapidement en kitesurf	https://www.youtube.com/watch?v=3HWYG4mfYeg	
merge	Kiteloops & loops	kite-loop-simple	Kiteloop	Don't you dare send loops? Watch this video.	https://www.youtube.com/watch?v=J6JG1pZJt4w	
merge	Surface tricks & drags	darkslide	Darkslide	Get your DARKSLIDES and your FRONTROLLS to the NEXT LEVEL!!	https://www.youtube.com/watch?v=V6sO7TgTBjA	
merge	Sauts & Big Air	saut-droit	Saut droit (boost)	How to Get More Air on Your Kitesurfing Rotations	https://www.youtube.com/watch?v=XSr7-DQlAJk	
merge	Bases et transitions	beach-start	Beachstart	How to Master the Kite Surf Beach Start (and Look Cool Doing It...)	https://www.youtube.com/watch?v=bJpAkreDDF4	
merge	Sauts & Big Air	saut-droit	Saut droit (boost)	Improve your kitesurfing jumps (progression tutorial)	https://www.youtube.com/watch?v=pFZRNpufeJM	
merge	Sauts & Big Air	saut-droit	Saut droit (boost)	Improve your pop in kitesurfing	https://www.youtube.com/watch?v=fOQ_3LYQSS4	
merge	Sauts & Big Air	saut-droit	Saut droit (boost)	Les clés d'un bon saut en kitesurf	https://www.youtube.com/watch?v=_EpJznUTcPI	
merge	Old school / grabs / board-offs	grab-indy	Grab indy	Not happy with your kitesurfing grabs? Here's why	https://www.youtube.com/watch?v=UxUxfKkm0A4	
merge	Old school / grabs / board-offs	one-foot-air	One-foot air (judo air)	One foot: the basis of old school kitesurfing	https://www.youtube.com/watch?v=Tgc_-VeFzaA	
merge	Surface tricks & drags	hand-drag-backroll	Hand drag backroll	Réalisez un backroll hand drag en kitesurf	https://www.youtube.com/watch?v=NaY2mJHpRjk	
merge	Bases et transitions	toe-side-riding	Toe-side riding	Rider toeside facilement en kitesurf (sans s'arrêter)	https://www.youtube.com/watch?v=iPbhbdN9P2k	
merge	Kiteloops & loops	kite-loop-simple	Kiteloop	Understanding the Kiteloop	https://www.youtube.com/watch?v=clINTUssfZc	
merge	Débuter	riding-upwind	La remontée au vent	Upwind Kitesurfing: What You Need to Know	https://www.youtube.com/watch?v=xAX0PBIxve0	
merge	Sauts & Big Air	saut-droit	Saut droit (boost)	Vos premiers sauts en kitesurf ! (en toute sécurité)	https://www.youtube.com/watch?v=i2JogRYV6TY	
merge	Surface tricks & drags	toeslide	Toeslide	What you need to know about kitesurfing slides (with @OneLaunchKiteboarding)	https://www.youtube.com/watch?v=MSZliahI6zg	
merge	Sauts & Big Air	frontroll-simple	Frontroll	Your first frontroll in kitesurfing	https://www.youtube.com/watch?v=AtSlqfIgHeA	
merge	Kiteloops & loops	kite-loop-simple	Kiteloop	Your first kiteloops in kitesurfing	https://www.youtube.com/watch?v=B7N-siad-Qg	
tuto	Tutoriels	—	—	5 erreurs à ne pas faire pour progresser sereinement en kite	https://www.youtube.com/watch?v=kBmmYRNhMPQ	
tuto	Tutoriels	—	—	Comment progresser en kitesurf ? - Épisode 1: Bien préparer sa session	https://www.youtube.com/watch?v=4oUW9yGyt6Q	
tuto	Tutoriels	—	—	Comment progresser en kitesurf ? - Épisode 3 : J'analyse ma session	https://www.youtube.com/watch?v=zJgZFH8SnM4	
merge	Débuter	debuter-le-vent-leger	Le vent léger	How to improve your kitesurfing skills? - Episode 2: A light wind session	https://www.youtube.com/watch?v=8bthsRJRvqM	
merge	Bases et transitions	edging-control	Edging & contrôle de vitesse	Managing your speed effectively when kitesurfing	https://www.youtube.com/watch?v=OIJVHPSa944	
merge	Débuter	debuter-greer-son-aile	Gréer son aile	Setting Up and Packing Away Your Kitesurfing Gear (Instructor Tips)	https://www.youtube.com/watch?v=3zczEcD0yYA	
tuto	Tutoriels	—	—	Understanding the different kite materials	https://www.youtube.com/watch?v=A8zYA3ItWZ4	
merge	Débuter	debuter-la-fenetre-de-vol	La fenêtre de vol	Understanding the Kitesurfing Wind Window (With an Umbrella)	https://www.youtube.com/watch?v=C821MDUl5iE	
`);
