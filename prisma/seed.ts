import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Lexique de figures kitesurf — sources croisées :
 * - SurferToday / PKRA official freestyle trick list
 * - IKO kiteboarder levels 1–5
 * - Brendan / The Rider Experience progression
 * - AKA Amateur Kiteboarders trick list
 * - Lexiques (Kitesurf Hyères, Suelta la Barra)
 * - Big Air KOTA (megalooop, S-loop, double loop, boogie, etc.)
 * - Wakeboard heritage names (313, Vulcan, Crow Mobe, Whirlybird…)
 *
 * Note : les combos inventés chaque saison sont infinis ; ici on couvre
 * toutes les figures NOMÉES / officielles + bases IKO + wave + foil.
 */

type FigureSeed = {
  slug: string;
  name: string;
  category: string;
  description: string;
  steps: string[];
  prerequisites?: string[];
};

const CAT = {
  BASES: "Bases et transitions",
  SURFACE: "Surface tricks & drags",
  BIGAIR: "Sauts & Big Air",
  OLDSCHOOL: "Old school / grabs / board-offs",
  KITELOOP: "Kiteloops & loops",
  UNHOOKED: "Unhooked freestyle",
  HANDLEPASS: "Handle passes & mobes",
  TOESIDE: "Toeside freestyle",
  WAVE: "Wave riding / strapless",
  FOIL: "Foil / Hydrofoil",
  EXTREME: "Extrême / compétition",
};

/** Helper compact pour déclarer une figure */
function f(
  slug: string,
  name: string,
  category: string,
  description: string,
  steps: string[],
  prerequisites?: string[]
): FigureSeed {
  return { slug, name, category, description, steps, prerequisites };
}

const figures: FigureSeed[] = [
  // ========== BASES (IKO + freeride) ==========
  f("body-drag", "Body drag", CAT.BASES,
    "Se faire tirer par le kite dans l'eau sans board — base IKO Level 2.",
    ["Mettre le kite en traction stable (45°)", "S'allonger sur le côté et se laisser tirer", "Garder la tête hors de l'eau et les lignes dégagées"],
  ),
  f("body-drag-upwind", "Body drag upwind", CAT.BASES,
    "Body drag en remontant au vent pour récupérer la board ou se repositionner.",
    ["Orienter le corps face au vent", "Piloter le kite en 8 pour générer de la traction upwind", "Traverser la zone jusqu'à la board"],
    ["body-drag"]
  ),
  f("body-drag-with-board", "Body drag avec board", CAT.BASES,
    "Transporter la board sous le bras ou entre les jambes pendant le body drag.",
    ["Saisir la board par le handle", "Maintenir le kite stable d'une main", "Body-draguer jusqu'à une zone de waterstart"],
    ["body-drag"]
  ),
  f("water-relaunch", "Water relaunch", CAT.BASES,
    "Relancer le kite tombé à l'eau sans assistance.",
    ["Positionner le kite en bord de fenêtre", "Tirer sur la ligne arrière appropriée", "Remonter le kite au zénith progressivement"],
    ["body-drag"]
  ),
  f("water-start", "Water start", CAT.BASES,
    "Se relever sur la board et démarrer la glisse grâce à la traction du kite.",
    ["Board perpendiculaire au vent, genoux repliés", "Kite à ~45° pour une traction constante", "Se laisser tirer puis se redresser progressivement", "Orienter la board et prendre le plan"],
    ["body-drag-with-board"]
  ),
  f("controlled-stop", "Controlled stop", CAT.BASES,
    "S'arrêter proprement en carvant au vent et en dépowerant.",
    ["Remonter au vent en carvant fort", "Dépowerer le kite vers le zénith", "S'asseoir doucement dans l'eau si besoin"],
    ["water-start"]
  ),
  f("edging-control", "Edging & contrôle de vitesse", CAT.BASES,
    "Réguler la vitesse par la carre — prérequis de tous les sauts et unhooked.",
    ["Appuyer sur les talons pour freiner / remonter", "Relâcher la carre pour accélérer", "Garder le kite actif pour ne pas stall"],
    ["water-start"]
  ),
  f("riding-upwind", "Riding upwind", CAT.BASES,
    "Remonter au vent de façon stable et prolongée (IKO Level 3).",
    ["Carre franche talons, buste légèrement ouvert", "Kite bas pour maximiser l'upwind", "Allonger les traversées sans perdre de terrain"],
    ["edging-control"]
  ),
  f("toe-side-riding", "Toe-side riding", CAT.BASES,
    "Naviguer orteils vers l'avant — base du wave et des toeside tricks.",
    ["Partir heel-side stable", "Pivoter buste et hanches vers l'avant", "Poids sur les orteils, genoux fléchis"],
    ["riding-upwind"]
  ),
  f("toe-side-turn", "Toe-side turn", CAT.BASES,
    "Changer de bord en passant par le toe-side (IKO Level 3).",
    ["Ralentir et engager le toe-side", "Piloter le kite de l'autre côté", "Repartir heel-side dans le nouveau sens"],
    ["toe-side-riding"]
  ),
  f("transition-simple", "Transition simple (sliding)", CAT.BASES,
    "Changer de bord sans saut, board à plat sur l'eau.",
    ["Ralentir en remontant au vent", "Board à plat, kite qui change de côté", "Reprendre une carre franche"],
    ["riding-upwind"]
  ),
  f("power-jibe", "Power jibe", CAT.BASES,
    "Transition dynamique avec kite en traction — base du darkslide et des transitions avancées.",
    ["Garder de la vitesse en entrée", "Envoyer le kite en downloop / power stroke", "Repartir chargé dans le nouveau sens"],
    ["transition-simple"]
  ),
  f("transition-180", "Transition 180° (switch)", CAT.BASES,
    "Léger saut avec rotation 180° pour repartir en switch.",
    ["Charger la carre pour un petit pop", "Tourner épaules puis hanches à 180°", "Réceptionner switch, kite repiloté"],
    ["transition-simple"]
  ),
  f("jump-transition", "Jump transition", CAT.BASES,
    "Transition avec vrai saut (IKO Level 4) — change de sens en l'air.",
    ["Envoyer le kite pour booster", "Tourner en l'air vers le nouveau sens", "Réceptionner et accélérer"],
    ["saut-droit", "transition-180"]
  ),
  f("riding-switch", "Riding switch", CAT.BASES,
    "Naviguer longtemps en stance inversée de façon stable.",
    ["Allonger les phases switch après un 180", "Piloter le kite en miroir", "Égaliser le confort des deux stances"],
    ["transition-180"]
  ),
  f("bidirectionnel-fluide", "Bidirectionnel fluide", CAT.BASES,
    "Naviguer aussi bien dans les deux sens sans perte de vitesse.",
    ["Alterner les bords en session", "Automatiser les transitions", "Égaliser bord fort / bord faible"],
    ["riding-switch"]
  ),
  f("pop", "Pop (load & release)", CAT.BASES,
    "Technique de décollage unhooked : charger la carre puis relâcher d'un coup.",
    ["Kite bas (~45°), vitesse moyenne/élevée", "Charger progressivement la carre au vent", "Relâcher d'un coup pour popper verticalement"],
    ["edging-control", "bidirectionnel-fluide"]
  ),
  f("unhooked-riding", "Unhooked riding", CAT.BASES,
    "Naviguer décroché du chicken loop — prérequis de tout le freestyle wakestyle.",
    ["Décrocher en riding stable, kite bas", "Garder les bras souples et le kite contrôlé", "Se rehooker avant toute manœuvre risquée au début"],
    ["pop"]
  ),

  // ========== SURFACE / DRAGS ==========
  f("hand-drag-basique", "Hand drag", CAT.SURFACE,
    "Lâcher une main et traîner la main dans l'eau en pleine glisse.",
    ["Vitesse stable, kite un peu plus bas", "Se pencher et tremper la main", "Se redresser et reprendre la barre"],
    ["bidirectionnel-fluide"]
  ),
  f("hand-drag-transition", "Hand drag transition", CAT.SURFACE,
    "Hand drag enchaîné directement avec une transition de bord.",
    ["Hand drag stable", "Se redresser en ralentissant", "Enchaîner une transition simple"],
    ["hand-drag-basique", "transition-simple"]
  ),
  f("hand-drag-backroll", "Hand drag backroll", CAT.SURFACE,
    "Hand drag suivi d'un backroll au redressement.",
    ["Hand drag avec vitesse", "Pop léger en sortie", "Backroll et réception propre"],
    ["hand-drag-basique", "backroll-simple"]
  ),
  f("foot-drag", "Foot drag", CAT.SURFACE,
    "Retirer un pied du strap et le traîner dans l'eau.",
    ["Stabiliser le riding", "Sortir le pied arrière du strap", "Traîner puis remettre le pied"],
    ["hand-drag-basique"]
  ),
  f("tootsie-roll-surface", "Tootsie roll (surface)", CAT.SURFACE,
    "Foot drag stylé avec rotation / slide — classic old-school surface.",
    ["Foot drag stable", "Pivoter le corps en gardant le pied dans l'eau", "Remettre le pied et repartir"],
    ["foot-drag"]
  ),
  f("grab-drag", "Grab drag", CAT.SURFACE,
    "Grab de board en glisse avec une main dans l'eau ou près de la surface.",
    ["Lâcher une main pour grabber", "Se pencher vers l'eau", "Relâcher le grab et reprendre la barre"],
    ["hand-drag-basique", "grab-indy"]
  ),
  f("one-foot-slide", "1-foot slide", CAT.SURFACE,
    "Glisser sur un pied, l'autre sorti — progression vers barefoot / jesus.",
    ["Sortir un pied en riding lent", "Équilibrer le poids sur le pied strapé", "Remettre le pied avant d'accélérer"],
    ["foot-drag"]
  ),
  f("barefoot-slide", "Barefoot slide", CAT.SURFACE,
    "Glisser sans les deux pieds dans les straps, board sous contrôle.",
    ["Maîtriser le 1-foot slide", "Sortir progressivement les deux pieds", "Garder le kite en traction légère"],
    ["one-foot-slide"]
  ),
  f("jesus-walk", "Jesus walk", CAT.SURFACE,
    "Marcher / glisser sur l'eau pieds nus tracté par le kite (style).",
    ["Barefoot slide stable", "Se redresser progressivement", "Petits pas / glissades contrôlés"],
    ["barefoot-slide"]
  ),
  f("riding-blind", "Riding blind", CAT.SURFACE,
    "Naviguer dos au kite / regard opposé — base des réceptions blind.",
    ["Pop 180 backside contrôlé", "Stabiliser la glisse en blind", "Repivoter pour revenir heel-side"],
    ["toe-side-riding", "transition-180"]
  ),
  f("darkslide", "Darkslide", CAT.SURFACE,
    "Glisser sur le dessus (dark side) de la board, tip dans l'eau, sortie souvent en kiteloop.",
    ["Vitesse + power jibe approach", "Retourner la board (fins vers le ciel)", "Glisser tip avant dans l'eau", "Sortir en kiteloop pour se redresser"],
    ["power-jibe", "kite-loop-simple"]
  ),
  f("darkslide-backroll-out", "Darkslide backroll out", CAT.SURFACE,
    "Darkslide terminé par un backroll au lieu d'un simple kiteloop.",
    ["Darkslide stable", "Initier un backroll en sortie", "Réceptionner et reprendre la carre"],
    ["darkslide", "backroll-simple"]
  ),
  f("surface-pass", "Surface pass", CAT.SURFACE,
    "Passage de barre au niveau de l'eau (raley surface / flat pass prep).",
    ["Raley bas proche de l'eau", "Passer la barre près de la surface", "Réceptionner et se rehooker"],
    ["raley-front", "handle-pass-ftb"]
  ),

  // ========== SAUTS / BIG AIR BASE ==========
  f("saut-droit", "Saut droit (boost)", CAT.BIGAIR,
    "Saut vertical classique en envoyant le kite à 12h.",
    ["Carre au vent, vitesse", "Envoyer le kite à 12h et tirer la barre", "Absorber la réception genoux fléchis"],
    ["riding-upwind"]
  ),
  f("sent-jump", "Sent jump", CAT.BIGAIR,
    "Boost engagé avec kite envoyé franchement — base big air moderne.",
    ["Charger la carre plus fort qu'un saut droit", "Envoyer le kite agressivement", "Garder la barre sheetée en l'air"],
    ["saut-droit"]
  ),
  f("glide", "Glide", CAT.BIGAIR,
    "Saut long et flotté, kite qui soutient le rider en l'air (freestyle judge).",
    ["Boost propre", "Garder le kite au zénith pour flotter", "Descendre en contrôlant le sheet"],
    ["saut-droit"]
  ),
  f("inverted-jump", "Inverted jump", CAT.BIGAIR,
    "Saut avec inversion (tête vers le bas) sans rotation complète.",
    ["Boost et regarder en arrière / bas", "Amener les hanches au-dessus de la tête", "Se redresser avant la réception"],
    ["saut-droit", "backroll-simple"]
  ),
  f("tabletop", "Tabletop", CAT.BIGAIR,
    "Board à plat horizontale au sommet du saut (style old-school).",
    ["Boost propre", "Amener la board à l'horizontale face au ciel", "Revenir en position de réception"],
    ["saut-droit"]
  ),
  f("backroll-simple", "Backroll", CAT.BIGAIR,
    "Rotation dorsale 360° — premier trick de rotation incontournable.",
    ["Regarder par-dessus l'épaule avant", "Lever les talons, initier la rotation", "Repérer l'eau et envoyer le kite avant la réception"],
    ["saut-droit"]
  ),
  f("frontroll-simple", "Frontroll", CAT.BIGAIR,
    "Rotation ventrale 360°.",
    ["Regarder par-dessus l'épaule arrière", "Engager les orteils / genoux", "Compléter la rotation et sheet in à la réception"],
    ["saut-droit"]
  ),
  f("backroll-transition", "Backroll transition", CAT.BIGAIR,
    "Backroll utilisé comme transition de bord.",
    ["Backroll en approche de transition", "Orienter la réception dans le nouveau sens", "Repiloter le kite"],
    ["backroll-simple", "jump-transition"]
  ),
  f("frontroll-transition", "Frontroll transition", CAT.BIGAIR,
    "Frontroll utilisé comme transition de bord.",
    ["Frontroll en approche", "Réceptionner dans le nouveau sens", "Accélérer"],
    ["frontroll-simple", "jump-transition"]
  ),
  f("inverted-frontroll", "Inverted frontroll", CAT.BIGAIR,
    "Frontroll avec inversion marquée (tête en bas).",
    ["Frontroll engagé", "Exagérer l'inversion au sommet", "Se redresser pour la réception"],
    ["frontroll-simple", "inverted-jump"]
  ),
  f("double-backroll", "Double backroll", CAT.BIGAIR,
    "Deux backrolls enchaînés dans un même saut.",
    ["Boost haut pour le temps d'air", "Enchaîner deux rotations dorsales", "Spotter la réception tôt"],
    ["backroll-simple", "sent-jump"]
  ),
  f("double-frontroll", "Double frontroll", CAT.BIGAIR,
    "Deux frontrolls enchaînés.",
    ["Boost haut", "Enchaîner deux rotations ventrales", "Sheet in avant la réception"],
    ["frontroll-simple", "sent-jump"]
  ),
  f("triple-backroll", "Triple backroll", CAT.BIGAIR,
    "Trois backrolls — temps d'air et engagement élevés.",
    ["Megaboost ou kiteloop assist", "Enchaîner 3 rotations", "Préparer la réception tôt"],
    ["double-backroll"]
  ),
  f("backroll-540", "Backroll 5 (540)", CAT.BIGAIR,
    "Backroll avec demi-tour additionnel (réception switch / +180).",
    ["Backroll classique", "Prolonger la rotation de 180°", "Réceptionner switch"],
    ["backroll-simple", "riding-switch"]
  ),
  f("frontroll-540", "Frontroll 5 (540)", CAT.BIGAIR,
    "Frontroll + 180° additionnel.",
    ["Frontroll", "Ajouter 180° avant la réception", "Stabiliser switch ou toeside"],
    ["frontroll-simple"]
  ),
  f("backroll-720", "Backroll 7 (720)", CAT.BIGAIR,
    "Backroll avec double tour additionnel (compétition freestyle).",
    ["Temps d'air important", "Engager une rotation prolongée", "Spotter et réceptionner"],
    ["backroll-540", "double-backroll"]
  ),
  f("frontroll-720", "Frontroll 7 (720)", CAT.BIGAIR,
    "Frontroll prolongé type compétition (7).",
    ["Boost haut", "Rotation front prolongée", "Réception contrôlée"],
    ["frontroll-540", "double-frontroll"]
  ),
  f("spin-frontside-360", "Frontside spin 360", CAT.BIGAIR,
    "Rotation verticale frontside (axe planche) 360°.",
    ["Pop et regarder devant / côté frontside", "Tourner les épaules puis les hanches", "Réceptionner face au sens de marche"],
    ["saut-droit"]
  ),
  f("spin-backside-360", "Backside spin 360", CAT.BIGAIR,
    "Rotation verticale backside 360°.",
    ["Pop et engager backside", "Garder le kite stable", "Compléter le 360 et réceptionner"],
    ["saut-droit"]
  ),
  f("spin-frontside-540", "Frontside spin 5 (540)", CAT.BIGAIR,
    "Spin frontside 540°.",
    ["FS 360 maîtrisé", "Ajouter 180°", "Réceptionner switch"],
    ["spin-frontside-360"]
  ),
  f("spin-backside-540", "Backside spin 5 (540)", CAT.BIGAIR,
    "Spin backside 540°.",
    ["BS 360 maîtrisé", "Prolonger de 180°", "Stabiliser la réception"],
    ["spin-backside-360"]
  ),
  f("tantrum", "Tantrum", CAT.BIGAIR,
    "Frontflip / frontroll inversé type wake — barre souvent au-dessus de la tête.",
    ["Pop puissant, regard arrière", "Rotation front type flip", "Barre contrôlée au-dessus / devant", "Réception genoux souples"],
    ["frontroll-simple", "inverted-frontroll"]
  ),

  // ========== OLD SCHOOL / GRABS ==========
  f("grab-indy", "Grab indy", CAT.OLDSCHOOL,
    "Saisir le rail toeside entre les pieds.",
    ["Boost stable", "Main arrière sur le rail toeside", "Relâcher avant la réception"],
    ["saut-droit"]
  ),
  f("grab-mute", "Grab mute", CAT.OLDSCHOOL,
    "Saisir le rail toeside avec la main avant (croisé).",
    ["Boost", "Main avant croise pour grabber toeside", "Relâcher et réceptionner"],
    ["saut-droit"]
  ),
  f("grab-tail", "Grab tail", CAT.OLDSCHOOL,
    "Saisir le tail de la board.",
    ["Boost", "Main arrière sur le tail", "Board contrôlée, réception"],
    ["saut-droit"]
  ),
  f("grab-nose", "Grab nose", CAT.OLDSCHOOL,
    "Saisir le nose de la board.",
    ["Boost", "Main avant sur le nose", "Relâcher avant la réception"],
    ["saut-droit"]
  ),
  f("grab-method", "Grab method", CAT.OLDSCHOOL,
    "Grab heelside stylé avec board relevée vers le rider (heritage snowboard).",
    ["Boost", "Grab heelside + tweak method", "Tenir le style au sommet", "Réception"],
    ["grab-indy", "saut-droit"]
  ),
  f("grab-roast-beef", "Grab roast beef", CAT.OLDSCHOOL,
    "Main arrière passe entre les jambes pour grabber le heelside.",
    ["Boost", "Passer la main entre les jambes", "Grab heelside puis relâcher"],
    ["grab-indy"]
  ),
  f("grab-seatbelt", "Grab seatbelt", CAT.OLDSCHOOL,
    "Grab nose croisé type ceinture (raley + nose grab souvent).",
    ["Raley ou boost", "Main croisée sur le nose", "Relâcher et réceptionner"],
    ["grab-nose", "raley-front"]
  ),
  f("grab-slob", "Grab slob", CAT.OLDSCHOOL,
    "Mute grab avec tweak frontside (style).",
    ["Boost", "Mute + tweak slob", "Relâcher"],
    ["grab-mute"]
  ),
  f("backroll-grab", "Backroll grab", CAT.OLDSCHOOL,
    "Backroll avec grab (indy / mute / method).",
    ["Initier un backroll", "Grabber au sommet de la rotation", "Relâcher et réceptionner"],
    ["backroll-simple", "grab-indy"]
  ),
  f("one-foot-air", "One-foot air (judo air)", CAT.OLDSCHOOL,
    "Sortir un pied en l'air et le remettre avant la réception.",
    ["Boost stable", "Sortir le pied arrière", "Remettre le pied avant de toucher l'eau"],
    ["saut-droit", "foot-drag"]
  ),
  f("board-off", "Board off", CAT.OLDSCHOOL,
    "Retirer les deux pieds, tenir la board, et la remettre en l'air.",
    ["Boost haut et stable", "Sortir les pieds, saisir le handle", "Remettre les pieds avant la réception"],
    ["one-foot-air", "sent-jump"]
  ),
  f("heart-attack", "Heart attack", CAT.OLDSCHOOL,
    "Board off avec les deux jambes remontées / kick vers le haut.",
    ["Board off propre", "Remonter les deux jambes", "Remettre les pieds à temps"],
    ["board-off"]
  ),
  f("board-flip", "Board flip", CAT.OLDSCHOOL,
    "Faire tourner la board sur elle-même (roll) en la tenant.",
    ["Board off", "Faire flipper la board par le rail", "Rattraper et remettre les pieds"],
    ["board-off"]
  ),
  f("varial", "Varial", CAT.OLDSCHOOL,
    "Rotation horizontale 360° de la board tenue par le tail.",
    ["Board off par le tail", "Spinner la board à l'horizontale", "Rattraper et strapper"],
    ["board-off"]
  ),
  f("wizard", "Wizard", CAT.OLDSCHOOL,
    "Tourner la board comme une roulette en la tenant au centre.",
    ["Board off au handle", "Faire tourner la board", "Remettre les pieds"],
    ["board-off"]
  ),
  f("board-pass", "Board pass", CAT.OLDSCHOOL,
    "Passer la board autour du corps en la tenant par un strap.",
    ["Board off", "Passer la board autour du corps", "Remettre les pieds"],
    ["board-off"]
  ),
  f("shifty", "Shifty", CAT.OLDSCHOOL,
    "Twist 90° de la board sous le rider — complément de nombreux grabs / raleys.",
    ["Boost ou raley", "Tourner la board 90° sous soi", "Réaligner avant la réception"],
    ["saut-droit"]
  ),
  f("rocket-air", "Rocket air", CAT.OLDSCHOOL,
    "Board verticale pointée vers le haut, grab nose typique.",
    ["Boost", "Pointer le nose vers le ciel + grab", "Redescendre la board"],
    ["grab-nose", "tabletop"]
  ),
  f("air-raley-old-school", "Air raley (old school)", CAT.OLDSCHOOL,
    "Raley hooked / old-school — corps tendu, board derrière la tête.",
    ["Boost engagé", "Étendre le corps, board au-dessus", "Ramener les jambes pour la réception"],
    ["saut-droit", "shifty"]
  ),
  f("superman", "Superman", CAT.OLDSCHOOL,
    "Extension bras avant, corps tendu — variante visuelle du raley / air.",
    ["Boost ou raley", "Tendre un bras vers l'avant", "Revenir en position de réception"],
    ["air-raley-old-school"]
  ),
  f("stiffy", "Stiffy", CAT.OLDSCHOOL,
    "Saut jambes tendues / board figée — style old-school.",
    ["Boost", "Tendre les jambes complètement", "Fléchir juste avant la réception"],
    ["saut-droit"]
  ),

  // ========== KITELOOPS ==========
  f("down-loop", "Downloop", CAT.KITELOOP,
    "Loop du kite vers le bas / devant le rider (moins violent qu'un kiteloop back).",
    ["Kite en mouvement vers l'avant", "Engager un loop descendant", "Récupérer le kite en traction contrôlée"],
    ["saut-droit", "power-jibe"]
  ),
  f("down-loop-transition", "Downloop transition", CAT.KITELOOP,
    "Transition de bord en downloopant le kite.",
    ["Approcher la transition avec vitesse", "Downlooper le kite", "Repartir chargé dans le nouveau sens"],
    ["down-loop", "power-jibe"]
  ),
  f("kite-loop-simple", "Kiteloop", CAT.KITELOOP,
    "Loop complet du kite en bord de fenêtre — figure reine du big air.",
    ["Boost avec hauteur", "Engager le loop avant l'apogée", "Absorber la traction, réception genoux souples"],
    ["sent-jump", "down-loop"]
  ),
  f("heli-loop", "Heli loop (landing)", CAT.KITELOOP,
    "Petit loop / helix pour amortir et contrôler la réception.",
    ["En fin de saut, engager un petit loop", "Utiliser la traction pour soft-land", "Reprendre la glisse"],
    ["kite-loop-simple"]
  ),
  f("kite-loop-pendant-saut", "Late kiteloop", CAT.KITELOOP,
    "Kiteloop déclenché tardivement (après l'apogée) — classic big air.",
    ["Boost très haut", "Attendre le sommet / début de chute", "Looper et se faire rattraper"],
    ["kite-loop-simple"]
  ),
  f("backroll-kite-loop", "Backroll kiteloop", CAT.KITELOOP,
    "Backroll combiné à un kiteloop.",
    ["Initier backroll + envoyer le loop", "Garder la rotation pendant la traction", "Réceptionner"],
    ["backroll-simple", "kite-loop-simple"]
  ),
  f("frontroll-kite-loop", "Frontroll kiteloop", CAT.KITELOOP,
    "Frontroll combiné à un kiteloop.",
    ["Frontroll + loop synchronisés", "Garder le regard pour spotter", "Réception"],
    ["frontroll-simple", "kite-loop-simple"]
  ),
  f("megaloop", "Megaloop", CAT.KITELOOP,
    "Kiteloop massif en vent fort, chute verticale rapide — signature KOTA.",
    ["Vent fort, petit kite, boost max", "Loop large et engagé", "Préparer une réception très chargée"],
    ["kite-loop-pendant-saut", "sent-jump"]
  ),
  f("double-kite-loop", "Double kiteloop", CAT.KITELOOP,
    "Deux loops consécutifs du kite en l'air (Giel Vlugt / KOTA).",
    ["Megaloop maîtrisé", "Enchaîner un 2e loop sans perdre les lignes", "Gérer le slack et la réception"],
    ["megaloop"]
  ),
  f("triple-kite-loop", "Triple kiteloop", CAT.KITELOOP,
    "Trois loops kite — ultra extrême.",
    ["Double loop solide", "Enchaîner le 3e loop", "Réception ultra engagée"],
    ["double-kite-loop"]
  ),
  f("s-loop", "S-loop", CAT.KITELOOP,
    "Demi-megalooop puis inversion du sens du kite (forme en S).",
    ["Engager un megaloop", "Inverser le sens à mi-parcours", "Gérer slack + réception"],
    ["megaloop", "double-kite-loop"]
  ),
  f("contra-loop", "Contra loop", CAT.KITELOOP,
    "Loop du kite dans le sens opposé au sens habituel — freefall plus agressif.",
    ["Boost", "Looper à contre-sens", "Absorber le freefall"],
    ["kite-loop-simple"]
  ),
  f("boogie-loop", "Boogie loop", CAT.KITELOOP,
    "Kiteloop avec inverted frontroll — classic big air technique.",
    ["Kiteloop + inverted frontroll synchronisés", "Garder le board control", "Réception"],
    ["frontroll-kite-loop", "inverted-frontroll"]
  ),
  f("doobie-loop", "Doobie loop", CAT.KITELOOP,
    "Boogie loop avec double inverted frontroll.",
    ["Boogie loop maîtrisé", "Ajouter une 2e inverted frontroll", "Spotter la réception"],
    ["boogie-loop", "double-frontroll"]
  ),
  f("slider-loop", "Slider loop", CAT.KITELOOP,
    "Loop combiné à un slide / surface approach.",
    ["Approche type slide", "Engager le loop", "Repartir en riding"],
    ["kite-loop-simple", "darkslide"]
  ),
  f("kite-loop-board-off", "Kiteloop board off", CAT.KITELOOP,
    "Kiteloop / megaloop avec board tenue à la main (Nick Jacobsen era).",
    ["Board off en boost", "Envoyer le loop en tenant la board", "Remettre les pieds avant l'impact"],
    ["board-off", "megaloop"]
  ),
  f("unhooked-kite-loop", "Unhooked kiteloop", CAT.KITELOOP,
    "Kiteloop réalisé décroché — pont vers le freestyle powered.",
    ["Unhook + pop", "Looper en gardant la barre aux mains", "Se rehooker si possible avant / après réception"],
    ["unhooked-riding", "kite-loop-simple"]
  ),
  f("raley-kite-loop", "Raley kiteloop", CAT.KITELOOP,
    "Position raley + kiteloop (souvent unhooked).",
    ["Raley unhooked", "Engager le loop en extension", "Ramener les jambes pour atterrir"],
    ["raley-front", "unhooked-kite-loop"]
  ),
  f("loop-transition-unhooked", "Loop transition unhooked", CAT.KITELOOP,
    "Transition de bord via kiteloop / downloop en unhooked.",
    ["Unhook en approche", "Looper pour changer de sens", "Réceptionner et se rehooker"],
    ["unhooked-kite-loop", "down-loop-transition"]
  ),
  f("f16", "F-16", CAT.KITELOOP,
    "Kiteloop backroll unhooked — nom AKA / old freestyle.",
    ["Unhook + backroll", "Kiteloop synchronisé", "Réception et rehook"],
    ["backroll-kite-loop", "unhooked-riding"]
  ),

  // ========== UNHOOKED BASE FREESTYLE ==========
  f("chicken-loop-unhook-air", "Unhook / rehook en l'air", CAT.UNHOOKED,
    "Décrocher et se rehooker pendant un saut — compétence freestyle clé.",
    ["Unhook juste avant le pop", "Garder la barre stable en l'air", "Se rehooker avant la réception"],
    ["unhooked-riding", "saut-droit"]
  ),
  f("raley-front", "Raley", CAT.UNHOOKED,
    "Extension horizontale, board au-dessus de la tête — base du freestyle unhooked.",
    ["Unhook, kite ~45°, charger la carre", "Pop et s'étendre (superman)", "Ramener les genoux, réception, rehook"],
    ["pop", "unhooked-riding", "air-raley-old-school"]
  ),
  f("raley-back", "Back raley / wrapped setup", CAT.UNHOOKED,
    "Raley engagé côté back / préparation wrapped.",
    ["Pop raley avec rotation légère back", "Extension complète", "Réception contrôlée"],
    ["raley-front"]
  ),
  f("raley-to-blind", "Raley to blind", CAT.UNHOOKED,
    "Raley suivi d'un demi-tour pour atterrir blind / toeside.",
    ["Raley en pleine extension", "Tourner pour blind avant la réception", "Stabiliser toeside / blind"],
    ["raley-front", "riding-blind"]
  ),
  f("wrapped-raley", "Wrapped raley", CAT.UNHOOKED,
    "Raley avec lines wrappées (une rotation de wrap) — setup de wrapped tricks.",
    ["Créer le wrap au décollage", "Raley en wrap", "Gérer le unwrap à la réception"],
    ["raley-front"]
  ),
  f("s-bend", "S-bend", CAT.UNHOOKED,
    "Raley + frontroll 360 horizontal — signature freestyle.",
    ["Raley en extension", "Engager une rotation front en S", "Compléter et réceptionner"],
    ["raley-front", "frontroll-simple"]
  ),
  f("s-bend-unhooked", "S-bend (confirmé unhooked)", CAT.UNHOOKED,
    "S-bend propre 100% unhooked avec rehook contrôlé.",
    ["Unhook clean", "S-bend complet", "Rehook avant ou juste après réception"],
    ["s-bend", "chicken-loop-unhook-air"]
  ),
  f("double-s-bend", "Double S-bend", CAT.UNHOOKED,
    "Deux S-bends / double rotation S en un saut.",
    ["S-bend solide + gros pop", "Enchaîner la 2e rotation S", "Réception"],
    ["s-bend"]
  ),
  f("vulcan", "Vulcan", CAT.UNHOOKED,
    "S-bend avec frontside 180 (atterro toeside) — Parks Bonifay heritage.",
    ["S-bend", "Ajouter FS 180 en sortie", "Réception toeside"],
    ["s-bend", "raley-to-blind"]
  ),
  f("vulcan-to-sp", "Vulcan to blind (SP)", CAT.UNHOOKED,
    "Vulcan prolongé vers blind / SP landing.",
    ["Vulcan", "Prolonger vers blind", "Stabiliser"],
    ["vulcan"]
  ),
  f("nine-one-one", "911 / 9111", CAT.UNHOOKED,
    "Raley variant shifty / grab heritage — famille raley avancée (liste PKRA).",
    ["Raley shifty", "Tweak caractéristique 911", "Réception"],
    ["raley-front", "shifty"]
  ),
  f("s-bend-to-blind", "S-bend to blind (S1)", CAT.UNHOOKED,
    "S-bend atterrissant blind — souvent avec pass (S1).",
    ["S-bend", "Orienter vers blind", "Option pass selon variante"],
    ["s-bend", "raley-to-blind"]
  ),
  f("tantrum-unhooked", "Tantrum unhooked", CAT.UNHOOKED,
    "Tantrum réalisé unhooked en pleine traction.",
    ["Unhook + pop tantrum", "Barre au-dessus de la tête", "Réception et rehook"],
    ["tantrum", "unhooked-riding"]
  ),
  f("whirlybird", "Whirlybird", CAT.UNHOOKED,
    "Tantrum + backside 360 avec handle qui passe au-dessus de la tête.",
    ["Tantrum unhooked", "Spinner BS en passant la barre overhead", "Réception"],
    ["tantrum-unhooked"]
  ),
  f("whirlybird-540", "Whirlybird 5 (540)", CAT.UNHOOKED,
    "Whirlybird avec rotation additionnelle.",
    ["Whirlybird", "Ajouter 180/540", "Réception"],
    ["whirlybird"]
  ),
  f("moby-dick", "Moby Dick", CAT.UNHOOKED,
    "Tantrum + backside 360 handle pass style.",
    ["Tantrum", "BS 360 pass", "Réception"],
    ["tantrum-unhooked", "handle-pass-ftb"]
  ),
  f("moby-dick-540", "Moby Dick 5 (540)", CAT.UNHOOKED,
    "Moby Dick avec rotation supplémentaire.",
    ["Moby Dick", "Prolonger la rotation", "Réception"],
    ["moby-dick"]
  ),
  f("front-to-blind", "Front to blind", CAT.UNHOOKED,
    "Rotation / pass frontside atterrissant blind (Hasselhoff family).",
    ["Unhook + pop", "Rotation frontside vers blind", "Stabiliser blind"],
    ["raley-to-blind", "handle-pass-ftb"]
  ),
  f("back-to-blind", "Back to blind", CAT.UNHOOKED,
    "Sortie backside vers réception blind — lié à la famille KGB.",
    ["Backroll / KGB setup", "Atterrir blind", "Stabiliser"],
    ["kgb", "riding-blind"]
  ),
  f("hasselhoff", "Hasselhoff (front to blind)", CAT.UNHOOKED,
    "Front to blind nommé — flat / low pass vers blind.",
    ["Flat ou low pass", "Orienter front to blind", "Réception blind"],
    ["front-to-blind", "flat-360-pass"]
  ),

  // ========== HANDLE PASSES & MOBES ==========
  f("flat-180-pass", "Flat 180 pass", CAT.HANDLEPASS,
    "Premier handle pass : demi-tour avec passage de barre près de l'eau / flat.",
    ["Unhook, petit pop", "Passer la barre dans le dos sur 180°", "Réceptionner et se rehooker"],
    ["unhooked-riding", "pop"]
  ),
  f("flat-360-pass", "Flat 360 pass (flat 3)", CAT.HANDLEPASS,
    "Handle pass 360° flat — base avant le 313.",
    ["Flat 180 solide", "Compléter un 360 avec pass", "Réception downwind"],
    ["flat-180-pass"]
  ),
  f("dangle-pass", "Dangle pass", CAT.HANDLEPASS,
    "Pass en se laissant pendre sous la barre (dangle).",
    ["Unhook avec slack contrôlé", "Se suspendre et passer", "Réception"],
    ["flat-360-pass"]
  ),
  f("handle-pass-ftb", "Handle pass front-to-back", CAT.HANDLEPASS,
    "Passage de barre main avant → main arrière dans le dos.",
    ["Amener la barre à la hanche", "Lâcher front hand après que back hand a pris", "Continuer la rotation du regard"],
    ["flat-360-pass"]
  ),
  f("handle-pass-btf", "Handle pass back-to-front", CAT.HANDLEPASS,
    "Passage de barre main arrière → main avant.",
    ["Rotation opposée au FTB", "Pass clean back to front", "Réception"],
    ["handle-pass-ftb"]
  ),
  f("three-one-three", "313", CAT.HANDLEPASS,
    "Raley + handle pass frontside 360 — LA base des air passes (Shaun Murray).",
    ["Shifty raley en extension", "Amener la barre à la hanche, regard front shoulder", "Pass 360 et réception downwind"],
    ["raley-front", "handle-pass-ftb"]
  ),
  f("three-one-five", "315", CAT.HANDLEPASS,
    "313 + 180° = 540° de rotation totale.",
    ["313 avec plus de speed/power", "Après le pass, pousser la jambe arrière vers toeside", "Réception 540"],
    ["three-one-three"]
  ),
  f("three-one-seven", "317", CAT.HANDLEPASS,
    "Handle pass raley 720° (313 family).",
    ["315 solide", "Gros pop + rotation continue", "Réception 720"],
    ["three-one-five"]
  ),
  f("three-one-nine", "319", CAT.HANDLEPASS,
    "Handle pass raley 900° — haut niveau compétition.",
    ["317 maîtrisé", "Temps d'air et engagement max", "Réception"],
    ["three-one-seven"]
  ),
  f("blind-judge", "Blind judge", CAT.HANDLEPASS,
    "Pass / trick atterrissant en blind judge — base des blind 313.",
    ["Rotation vers blind", "Pass si nécessaire", "Réception blind stable"],
    ["riding-blind", "flat-360-pass"]
  ),
  f("blind-313", "Blind 313 (B313)", CAT.HANDLEPASS,
    "313 initié ou réceptionné blind.",
    ["Setup blind / backside", "Pass type 313", "Réception"],
    ["blind-judge", "three-one-three"]
  ),
  f("blind-315", "Blind 315", CAT.HANDLEPASS,
    "Blind 313 prolongé en 540.",
    ["Blind 313", "Ajouter 180°", "Réception"],
    ["blind-313", "three-one-five"]
  ),
  f("blind-317", "Blind 317", CAT.HANDLEPASS,
    "Blind handle pass 720°.",
    ["Blind 315", "Prolonger", "Réception"],
    ["blind-315"]
  ),
  f("blind-319", "Blind 319", CAT.HANDLEPASS,
    "Blind handle pass 900°.",
    ["Blind 317", "Max commit", "Réception"],
    ["blind-317"]
  ),
  f("back-mobe", "Back mobe", CAT.HANDLEPASS,
    "Backroll + handle pass 360 (frontside back mobe).",
    ["Backroll unhooked", "Pass à mi-rotation", "Réception et rehook"],
    ["backroll-simple", "three-one-three"]
  ),
  f("back-mobe-5", "Back mobe 5 (540)", CAT.HANDLEPASS,
    "Back mobe avec +180°.",
    ["Back mobe", "Prolonger la rotation", "Réception"],
    ["back-mobe"]
  ),
  f("back-mobe-7", "Back mobe 7 (720)", CAT.HANDLEPASS,
    "Back mobe 720°.",
    ["Back mobe 5", "Temps d'air + commit", "Réception"],
    ["back-mobe-5"]
  ),
  f("back-mobe-9", "Back mobe 9 (900)", CAT.HANDLEPASS,
    "Back mobe 900° — pro level.",
    ["Back mobe 7", "Max height", "Réception"],
    ["back-mobe-7"]
  ),
  f("front-mobe", "Front mobe", CAT.HANDLEPASS,
    "Frontroll + handle pass (backside front mobe).",
    ["Frontroll unhooked", "Pass synchronisé", "Réception"],
    ["frontroll-simple", "three-one-three"]
  ),
  f("front-blind-mobe", "Front blind mobe", CAT.HANDLEPASS,
    "Front mobe avec composante blind.",
    ["Front mobe", "Orienter blind", "Réception"],
    ["front-mobe", "blind-judge"]
  ),
  f("front-mobe-5", "Front mobe 5 (540)", CAT.HANDLEPASS,
    "Front mobe +180°.",
    ["Front mobe", "Prolonger", "Réception"],
    ["front-mobe"]
  ),
  f("front-mobe-7", "Front mobe 7 (720)", CAT.HANDLEPASS,
    "Front mobe 720°.",
    ["Front mobe 5", "Commit", "Réception"],
    ["front-mobe-5"]
  ),
  f("front-mobe-9", "Front mobe 9 (900)", CAT.HANDLEPASS,
    "Front mobe 900°.",
    ["Front mobe 7", "Max air", "Réception"],
    ["front-mobe-7"]
  ),
  f("kgb", "KGB (Kite Get Bored)", CAT.HANDLEPASS,
    "Backside back mobe : backroll + pass dans le sens opposé — figure culte.",
    ["Backroll unhooked engagé", "Pass backside opposé au roll", "Réception heel ou blind selon variante"],
    ["back-mobe", "backroll-simple"]
  ),
  f("kgb-5", "KGB 5 (540)", CAT.HANDLEPASS,
    "KGB avec rotation additionnelle.",
    ["KGB", "Prolonger +180°", "Réception"],
    ["kgb"]
  ),
  f("kgb-7", "KGB 7 (720)", CAT.HANDLEPASS,
    "KGB 720°.",
    ["KGB 5", "Gros pop", "Réception"],
    ["kgb-5"]
  ),
  f("kgb-9", "KGB 9 (900)", CAT.HANDLEPASS,
    "KGB 900°.",
    ["KGB 7", "Pro level", "Réception"],
    ["kgb-7"]
  ),
  f("kgb-to-blind", "KGB to blind", CAT.HANDLEPASS,
    "KGB atterrissant blind.",
    ["KGB", "Orienter la sortie en blind", "Stabiliser"],
    ["kgb", "riding-blind"]
  ),
  f("slim-chance", "Slim chance", CAT.HANDLEPASS,
    "Mobe invert : handle pass tête en bas.",
    ["Mobe avec inversion", "Pass pendant l'invert", "Se redresser pour la réception"],
    ["back-mobe", "inverted-jump"]
  ),
  f("slim-5", "Slim 5 (540)", CAT.HANDLEPASS,
    "Slim chance +180°.",
    ["Slim chance", "Prolonger", "Réception"],
    ["slim-chance"]
  ),
  f("slim-7", "Slim 7 (720)", CAT.HANDLEPASS,
    "Slim chance 720°.",
    ["Slim 5", "Commit", "Réception"],
    ["slim-5"]
  ),
  f("slim-9", "Slim 9 (900)", CAT.HANDLEPASS,
    "Slim chance 900°.",
    ["Slim 7", "Max", "Réception"],
    ["slim-7"]
  ),
  f("s-mobe", "S-mobe", CAT.HANDLEPASS,
    "S-bend + handle pass (mobe).",
    ["S-bend", "Intégrer le pass", "Réception"],
    ["s-bend", "back-mobe"]
  ),
  f("s-mobe-5", "S-mobe 5 (540)", CAT.HANDLEPASS,
    "S-mobe +180°.",
    ["S-mobe", "Prolonger", "Réception"],
    ["s-mobe"]
  ),
  f("s-mobe-7", "S-mobe 7 (720)", CAT.HANDLEPASS,
    "S-mobe 720°.",
    ["S-mobe 5", "Commit", "Réception"],
    ["s-mobe-5"]
  ),
  f("hinterberger-mobe", "Hinterberger mobe", CAT.HANDLEPASS,
    "Mobe Hinterberger — variante wake/kite de haut niveau.",
    ["Mobe avancé setup Hinterberger", "Pass synchronisé", "Réception"],
    ["back-mobe", "front-mobe"]
  ),
  f("hinterberger-mobe-5", "Hinterberger mobe 5", CAT.HANDLEPASS,
    "Hinterberger +180°.",
    ["Hinterberger", "Prolonger", "Réception"],
    ["hinterberger-mobe"]
  ),
  f("double-hinterberger", "Double Hinterberger mobe", CAT.HANDLEPASS,
    "Double Hinterberger (aka 118 en wake).",
    ["Hinterberger solide", "Double rotation", "Réception"],
    ["hinterberger-mobe-5"]
  ),
  f("loop-mobe", "Loop mobe", CAT.HANDLEPASS,
    "Kiteloop + mobe / handle pass.",
    ["Kiteloop unhooked", "Pass type mobe", "Réception"],
    ["unhooked-kite-loop", "back-mobe"]
  ),
  f("downloop-mobe", "Downloop mobe", CAT.HANDLEPASS,
    "Downloop + mobe handle pass.",
    ["Downloop powered", "Pass mobe", "Réception"],
    ["down-loop", "back-mobe"]
  ),
  f("late-mobe", "Late mobe", CAT.HANDLEPASS,
    "Mobe avec pass très tardif.",
    ["Mobe classique", "Retarder le pass au maximum", "Réception"],
    ["back-mobe"]
  ),
  f("low-mobe", "Low mobe", CAT.HANDLEPASS,
    "Mobe exécuté très bas / proche de l'eau.",
    ["Pop bas contrôlé", "Pass rapide", "Réception"],
    ["back-mobe"]
  ),
  f("krypto", "Krypto (Krypt)", CAT.HANDLEPASS,
    "KGB to blind / variante krypt — souvent listé après KGB to blind.",
    ["KGB to blind propre", "Extension / tweak krypt", "Stabiliser"],
    ["kgb-to-blind"]
  ),
  f("krypto-to-sp", "Krypt to SP", CAT.HANDLEPASS,
    "Krypt prolongé vers SP / blind landing spécifique.",
    ["Krypto", "Prolonger vers SP", "Réception"],
    ["krypto"]
  ),
  f("wrapped-krypto", "Wrapped krypto", CAT.HANDLEPASS,
    "Krypto avec lines wrappées.",
    ["Wrapped raley / wrap setup", "Krypto en wrap", "Unwrap contrôlé"],
    ["krypto", "wrapped-raley"]
  ),
  f("jesus", "Jesus", CAT.HANDLEPASS,
    "Figure unhooked avancée (famille pass / blind) — nom compétition.",
    ["Handle pass avancé", "Position jesus caractéristique", "Réception"],
    ["blind-judge", "three-one-five"]
  ),
  f("pete-rose", "Pete Rose", CAT.TOESIDE,
    "Toeside KGB — backroll toeside + pass.",
    ["Toeside backroll", "Pass type KGB", "Réception"],
    ["kgb", "toeside-backroll"]
  ),
  f("pete-rose-5", "Pete Rose 5 (540)", CAT.TOESIDE,
    "Pete Rose +180°.",
    ["Pete Rose", "Prolonger", "Réception"],
    ["pete-rose"]
  ),
  f("pete-rose-7", "Pete Rose 7 (720)", CAT.TOESIDE,
    "Pete Rose 720°.",
    ["Pete Rose 5", "Commit", "Réception"],
    ["pete-rose-5"]
  ),
  f("route-66", "Route 66", CAT.HANDLEPASS,
    "Combo handle pass avancé de compétition.",
    ["Enchaîner passes / rotations Route 66", "Garder la hauteur", "Réception"],
    ["three-one-seven", "back-mobe-5"]
  ),
  f("munchies", "Munchies", CAT.HANDLEPASS,
    "Trick unhooked nommé (grab + pass spécifique).",
    ["Setup unhooked", "Grab + pass munchies", "Réception"],
    ["krypto", "grab-indy"]
  ),
  f("nis", "NIS", CAT.HANDLEPASS,
    "Handle pass nommé de la liste freestyle (GSKV / comps).",
    ["Pass avancé NIS", "Rotation synchronisée", "Réception"],
    ["back-mobe", "front-mobe"]
  ),
  f("s-bend-pass", "S-bend pass", CAT.HANDLEPASS,
    "S-bend avec handle pass (sans forcément être un S-mobe complet).",
    ["S-bend", "Intégrer un pass", "Réception"],
    ["s-bend", "handle-pass-ftb"]
  ),
  f("kiteloop-3", "Kiteloop 3 (kiteloop pass)", CAT.HANDLEPASS,
    "Kiteloop + handle pass 360°.",
    ["Unhooked kiteloop", "Pass 360 pendant le loop", "Réception"],
    ["unhooked-kite-loop", "three-one-three"]
  ),

  // ========== TOESIDE FREESTYLE ==========
  f("toeside-backroll", "Toeside backroll", CAT.TOESIDE,
    "Backroll déclenché depuis le toeside.",
    ["Riding toeside stable", "Pop et backroll", "Réception"],
    ["toe-side-riding", "backroll-simple"]
  ),
  f("toeside-frontroll", "Toeside frontroll", CAT.TOESIDE,
    "Frontroll depuis le toeside.",
    ["Toeside", "Frontroll", "Réception"],
    ["toe-side-riding", "frontroll-simple"]
  ),
  f("toeside-backroll-5", "Toeside backroll 5", CAT.TOESIDE,
    "Toeside backroll +180°.",
    ["Toeside backroll", "Prolonger", "Réception"],
    ["toeside-backroll"]
  ),
  f("toeside-frontroll-5", "Toeside frontroll 5", CAT.TOESIDE,
    "Toeside frontroll +180°.",
    ["Toeside frontroll", "Prolonger", "Réception"],
    ["toeside-frontroll"]
  ),
  f("scarecrow", "Scarecrow", CAT.TOESIDE,
    "Toeside frontroll + frontside 180.",
    ["Toeside frontroll", "Ajouter FS 180", "Réception"],
    ["toeside-frontroll"]
  ),
  f("crow-mobe", "Crow mobe", CAT.TOESIDE,
    "Toeside frontroll + frontside 360 pass (Parks Bonifay).",
    ["Scarecrow / toeside frontroll", "Pass FS 360", "Réception"],
    ["scarecrow", "front-mobe"]
  ),
  f("crow-mobe-5", "Crow mobe 5 (540)", CAT.TOESIDE,
    "Crow mobe +180°.",
    ["Crow mobe", "Prolonger", "Réception"],
    ["crow-mobe"]
  ),
  f("crow-mobe-7", "Crow mobe 7 (720)", CAT.TOESIDE,
    "Crow mobe 720°.",
    ["Crow mobe 5", "Commit", "Réception"],
    ["crow-mobe-5"]
  ),
  f("crow-mobe-9", "Crow mobe 9 (900)", CAT.TOESIDE,
    "Crow mobe 900°.",
    ["Crow mobe 7", "Max", "Réception"],
    ["crow-mobe-7"]
  ),
  f("fruit-loop", "Fruit loop", CAT.TOESIDE,
    "Toeside frontflip + backside 180.",
    ["Toeside", "Frontflip / invert", "BS 180 et réception"],
    ["toeside-frontroll", "inverted-frontroll"]
  ),
  f("flavor-flip", "Flavor flip", CAT.TOESIDE,
    "Variante toeside front flip (liste PKRA).",
    ["Fruit loop / front flip toeside", "Tweak flavor", "Réception"],
    ["fruit-loop"]
  ),
  f("nine-o-two-one-o", "90210", CAT.TOESIDE,
    "Toeside raley + frontside 360 pass.",
    ["Toeside raley", "Pass FS 360", "Réception"],
    ["raley-front", "toe-side-riding", "three-one-three"]
  ),
  f("oh-really", "90215 / Oh Really", CAT.TOESIDE,
    "Évolution du 90210 (liste officielle).",
    ["90210", "Prolonger la rotation / pass", "Réception"],
    ["nine-o-two-one-o"]
  ),
  f("toeside-r2b", "Toeside raley to blind", CAT.TOESIDE,
    "Raley toeside atterrissant blind.",
    ["Raley toeside", "Orienter blind", "Stabiliser"],
    ["raley-to-blind", "toe-side-riding"]
  ),
  f("toeside-backside-313", "Toeside backside 313", CAT.TOESIDE,
    "313 toeside backside.",
    ["Toeside setup", "Pass type 313 backside", "Réception"],
    ["three-one-three", "toeside-r2b"]
  ),
  f("toeside-backside-315", "Toeside backside 315", CAT.TOESIDE,
    "Toeside BS 313 +180°.",
    ["Toeside BS 313", "Prolonger", "Réception"],
    ["toeside-backside-313"]
  ),
  f("c7", "C7", CAT.TOESIDE,
    "Toeside advanced S-bend family (liste PKRA).",
    ["S-bend toeside", "Rotation C7", "Réception"],
    ["s-bend", "toe-side-riding"]
  ),
  f("c7-5", "C7 5", CAT.TOESIDE,
    "C7 +180°.",
    ["C7", "Prolonger", "Réception"],
    ["c7"]
  ),
  f("c10", "C10", CAT.TOESIDE,
    "Évolution C7 / S-bend toeside avancé.",
    ["C7 5", "Rotation supérieure", "Réception"],
    ["c7-5"]
  ),
  f("g-spot", "G-Spot", CAT.TOESIDE,
    "Toeside backmobe nommé.",
    ["Toeside backroll", "Pass mobe", "Réception"],
    ["toeside-backroll", "back-mobe"]
  ),
  f("blind-pete", "Blind Pete", CAT.TOESIDE,
    "Variante toeside / blind liée au Pete Rose.",
    ["Pete Rose ou G-Spot", "Sortie blind", "Stabiliser"],
    ["pete-rose", "blind-judge"]
  ),
  f("dum-dum", "Dum Dum", CAT.TOESIDE,
    "Toeside slim / tootsie family (liste PKRA).",
    ["Toeside slim setup", "Pass Dum Dum", "Réception"],
    ["slim-chance", "toeside-frontroll"]
  ),
  f("dum-dum-5", "Dum Dum 5", CAT.TOESIDE,
    "Dum Dum +180°.",
    ["Dum Dum", "Prolonger", "Réception"],
    ["dum-dum"]
  ),
  f("tootsie-roll-pass", "Tootsie roll (pass)", CAT.TOESIDE,
    "Toeside frontroll + backside handle pass (kitingsheep / comps).",
    ["Toeside frontroll", "BS pass derrière le dos", "Réception"],
    ["toeside-frontroll", "handle-pass-btf"]
  ),

  // ========== WAVE / STRAPLESS ==========
  f("bottom-turn", "Bottom turn", CAT.WAVE,
    "Virage bas de vague pour générer de la vitesse — base du surfkite.",
    ["Descendre la vague", "Carver bas pieds/ commis", "Remonter pour le top turn"],
    ["toe-side-riding", "riding-upwind"]
  ),
  f("top-turn", "Top turn", CAT.WAVE,
    "Virage haut de vague, spray et redirection.",
    ["Bottom turn chargé", "Monter au lip", "Pivoter et redescendre"],
    ["bottom-turn"]
  ),
  f("cutback", "Cutback", CAT.WAVE,
    "Changement de direction fort pour revenir dans la puissance de la vague.",
    ["Vitesse sur le shoulder", "Cutback appuyé", "Revenir dans le pocket"],
    ["top-turn"]
  ),
  f("off-the-lip", "Off the lip", CAT.WAVE,
    "Rebond / hit sur le lip de la vague.",
    ["Bottom turn", "Viser le lip", "Rebound et redescendre"],
    ["top-turn"]
  ),
  f("aerial", "Aerial (wave)", CAT.WAVE,
    "Saut au-dessus du lip en vague.",
    ["Vitesse + bottom turn", "Décoller du lip", "Réceptionner dans la vague"],
    ["off-the-lip", "saut-droit"]
  ),
  f("air-reverse", "Air reverse", CAT.WAVE,
    "Aerial avec rotation / reverse en l'air.",
    ["Aerial", "Rotation reverse", "Réception"],
    ["aerial"]
  ),
  f("down-the-line", "Down the line", CAT.WAVE,
    "Naviguer le long de la vague en enchaînant les sections.",
    ["Se positionner dans le pocket", "Enchaîner bottom / top turns", "Suivre la ligne de vague"],
    ["bottom-turn", "top-turn"]
  ),
  f("strapless-riding", "Strapless riding", CAT.WAVE,
    "Naviguer en surfboard sans footstraps.",
    ["Waterstart strapless", "Pression pieds / rails", "Transitions douces"],
    ["water-start", "toe-side-riding"]
  ),
  f("strapless-shove-it", "Strapless shove-it", CAT.WAVE,
    "Faire tourner la board 180° sous les pieds (shove-it).",
    ["Pop léger strapless", "Spinner la board 180°", "Rattraper avec les pieds"],
    ["strapless-riding"]
  ),
  f("strapless-backroll", "Strapless backroll", CAT.WAVE,
    "Backroll en strapless.",
    ["Pop strapless", "Backroll en gardant la board aux pieds", "Réception"],
    ["strapless-riding", "backroll-simple"]
  ),
  f("strapless-air", "Strapless air", CAT.WAVE,
    "Saut strapless avec board control (souvent grab).",
    ["Pop ou lip launch", "Contrôler la board (grab si besoin)", "Réception pieds sur la board"],
    ["strapless-riding", "aerial"]
  ),
  f("strapless-freestyle", "Strapless freestyle (combo)", CAT.WAVE,
    "Enchaînement shove-it, backroll, airs en strapless.",
    ["Maîtriser shove-it + backroll + air", "Enchaîner en run", "Varier les grabs"],
    ["strapless-shove-it", "strapless-backroll", "strapless-air"]
  ),

  // ========== FOIL ==========
  f("water-start-foil", "Water start foil", CAT.FOIL,
    "Démarrer et faire décoller le foil.",
    ["Board au vent, foil immergé", "Kite en traction progressive", "Laisser le foil lifter sans forcer"],
  ),
  f("foil-balance", "Foil balance (flight)", CAT.FOIL,
    "Tenir le foil en vol stable à hauteur constante.",
    ["Micro-ajustements pied avant/arrière", "Kite stable", "Éviter les pump excessifs"],
    ["water-start-foil"]
  ),
  f("tack-foil", "Tack foil", CAT.FOIL,
    "Virement de bord face au vent en foil.",
    ["Remonter au vent", "Passer le nose dans le vent", "Repartir sur l'autre bord"],
    ["foil-balance"]
  ),
  f("jibe-foil", "Jibe foil", CAT.FOIL,
    "Empannage foil (vent arrière).",
    ["Arrondir la courbe downwind", "Changer de bord en vol", "Rester foiling"],
    ["foil-balance"]
  ),
  f("foil-transition", "Foil transition 180", CAT.FOIL,
    "Transition 180 en restant en vol.",
    ["Petit hop ou carve 180", "Garder le foil chargé", "Repartir"],
    ["jibe-foil", "tack-foil"]
  ),
  f("foil-360", "Foil 360", CAT.FOIL,
    "Rotation 360° complète en foil.",
    ["Vitesse et hauteur foil", "Initier le 360", "Rester en vol à la sortie"],
    ["foil-transition"]
  ),
  f("foil-jump", "Foil jump", CAT.FOIL,
    "Saut en hydrofoil.",
    ["Charger le foil", "Pop / kite assist", "Réception soft sur le foil"],
    ["foil-balance", "saut-droit"]
  ),
  f("tantrum-foil", "Tantrum foil", CAT.FOIL,
    "Tantrum réalisé en foil.",
    ["Foil jump", "Tantrum", "Réception foil"],
    ["foil-jump", "tantrum"]
  ),
  f("foil-wave-riding", "Foil wave riding", CAT.FOIL,
    "Surfer la vague en kitefoil.",
    ["Se positionner sur la vague", "Utiliser l'énergie du swell", "Carves foil en vague"],
    ["foil-balance", "bottom-turn"]
  ),
  f("light-wind-freestyle-foil", "Light wind freestyle foil", CAT.FOIL,
    "Tricks freestyle en foil par vent faible.",
    ["Vol stable light wind", "Petits tricks (360, transitions)", "Garder le foil en l'air"],
    ["foil-360", "foil-jump"]
  ),

  // ========== EXTREME / COMP ==========
  f("double-front-mobe", "Double front mobe", CAT.EXTREME,
    "Front mobe avec double rotation.",
    ["Gros pop / kiteloop assist", "Double rotation + pass", "Réception"],
    ["front-mobe-7"]
  ),
  f("triple-handle-pass", "Triple handle pass", CAT.EXTREME,
    "Trois passages de barre en un seul saut.",
    ["Pop max", "Enchaîner 3 passes", "Rehook / réception"],
    ["route-66", "three-one-nine"]
  ),
  f("kgb-to-blind-judge", "KGB to blind judge", CAT.EXTREME,
    "Combo KGB enchaîné en blind judge.",
    ["KGB to blind", "Enchaîner blind judge", "Run competition style"],
    ["kgb-to-blind", "blind-judge"]
  ),
  f("snake-loop", "Snake loop", CAT.EXTREME,
    "S-loop prolongé type « snake » — quasi mythique / KOTA experimental.",
    ["S-loop maîtrisé", "Retracer un loop supplémentaire", "Gérer un slack extrême"],
    ["s-loop"]
  ),
  f("bel-air", "Bel-Air", CAT.EXTREME,
    "Trick nommé AKA / freestyle boost handle-pass family.",
    ["Boost + pass", "Setup Bel-Air", "Réception"],
    ["three-one-five", "sent-jump"]
  ),
];

async function main() {
  console.log(`Seeding ${figures.length} figures...`);

  const slugs = figures.map((fig) => fig.slug);

  // Supprime les anciennes figures absentes du nouveau lexique (dev / refresh seed)
  await prisma.figure.deleteMany({
    where: { slug: { notIn: slugs } },
  });

  // Passe 1 : upsert contenu + ordre d'affichage
  for (let i = 0; i < figures.length; i++) {
    const fig = figures[i];
    await prisma.figure.upsert({
      where: { slug: fig.slug },
      update: {
        name: fig.name,
        category: fig.category,
        description: fig.description,
        steps: JSON.stringify(fig.steps),
        order: i,
      },
      create: {
        slug: fig.slug,
        name: fig.name,
        category: fig.category,
        description: fig.description,
        steps: JSON.stringify(fig.steps),
        order: i,
      },
    });
  }

  // Passe 2 : prérequis (set = remplace les liens existants)
  for (const fig of figures) {
    await prisma.figure.update({
      where: { slug: fig.slug },
      data: {
        prerequisites: {
          set: (fig.prerequisites ?? []).map((slug) => ({ slug })),
        },
      },
    });
  }

  console.log(`Seed terminé : ${figures.length} figures.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
