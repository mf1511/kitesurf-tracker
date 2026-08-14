# Changelog

## 2026-08-14

### ✨ Added
- Wave / Surface / Old school / Kiteloops / Unhooked / Handle passes / Toeside : sous-modules + ordre pédagogique
- Strapless : sous-modules **Premiers vols** / **Navigation** / **Transitions** / **Freestyle**
- Wingfoil : sous-modules **Premiers vols** / **Navigation** / **Transitions** / **Freestyle** / **Vague**
- Kitefoil : sous-modules **Premiers vols** / **Navigation** / **Transitions** / **Freestyle** / **Vague**
- Bases et transitions : sous-modules **Transitions** / **Riding**
- Sauts & Big Air : sous-modules **Backroll** / **Frontroll** / **Raleys** / **Passes** / **Avancé**
- Admin : réordonnancement ↑↓ des **catégories** et des **figures** (SQL `022-app-settings.sql`)
- Admin : sous-sections **Débuter** / **Twintip avancé** repliables
- Arbre de progression : mode **Mindmap** (`/figures/arbre?mode=mindmap`) — hub + catégories + figures

### 🚀 Improved
- Catalogue figures : sous-modules indentés sous leur catégorie
- Catalogue figures : fold/unfold des **sous-modules** (comme les catégories)
- Catalogue figures : état fold/unfold des catégories conservé à la navigation (`sessionStorage`)
- Mindmap : remplissage LTR des cards catégorie / sous-module + check vert à 100 %
- Mindmap : branchage unifié (prérequis → arbre, sinon chaîne ordonnée) — plus de grille / éventail
- Mindmap : nœuds de **sous-modules** (Débuter / Twintip avancé) entre catégorie et figures
- Mindmap : arbre gauche→droite aligné + bouton **Réorganiser** (zoom 100 %, vue hub)

### 🔧 Changed
- Toeside freestyle → **Sauts & Big Air** (Raleys / Passes / Avancé) ; catégorie Toeside retirée
- Sauts & Big Air : spins / tantrum rangés dans **Backroll** / **Frontroll** (plus de sous-modules Bases / Spins)
- Freestyle : merges 313 / S-bend / board-flip / Hasselhoff ; Snake loop + Kiteloop 3 → Kiteloops ; Sauts : sous-modules **Bases** / **Spins**
- **Handle passes & mobes** + **Extrême / compétition** fusionnés en **Figures avancées** (sous-modules conservés)
- Tutoriels : merges vers Débuter / Beachstart + 23 fiches déplacées ; **First 14 Tricks** → Bonus ; 3 fiches College retirées ; catégorie Tutoriels vidée
- Figures **Twintip avancé** → **Bases et transitions** ; catégorie Twintip avancé retirée
- **Lâcher une main** → Débuter / Les sauts à une main
- Sous-module **La pratique solo** (4 figures) déplacé de Twintip avancé → **Débuter**
- **La flèche bis** + **Le rôle des lignes bis** mergés dans les figures Débuter (sans bis)
- **Body drag upwind**, **Water relaunch**, **Controlled stop** → Débuter / À l'eau
- Tuto **How to Kitesurf: Bodydrag Tutorial** mergé dans **La nage tractée** (`body-drag`)
- Catégories **Foil / Hydrofoil** + **Kitefoil** fusionnées sous **Kitefoil** ; doublons `tack-foil` → `kitefoil-tack`, `jibe-foil` → `kitefoil-jibe`
- Merges catalogue : relaunch / fenêtre de vol / edging / raley / largage / recommandations / gréage / transitions / leash / décollage-atterrissage (vidéos land → atterrissage)

## 2026-08-13

### 🔧 Changed
- Favoris figures : filtre **Favoris** sur `/figures` (page `/favoris` redirige vers `?favorites=1`)
- Figures : activation de toutes celles qui ont ≥1 vidéo (147 activées)
- Catalogue figures : filtres catégories en multi-select dropdown (à la place des chips)
- Figures catégorie **Sécurité** → **Débuter** / sous-module **La sécurité** (orders 607–618)
- Catalogue figures : suppression du filtre de tri « Ordre conseillé » (ordre pédagogique fixe)
- Catalogue figures : catégories repliables (clic titre + Tout ouvrir / Tout replier)

### ✨ Added
- Import Tutos Kitesurf UCPA : `npm run import:ucpa-kitesurf` — 14 tutos playlist (merges Débuter / freestyle / strapless)
- Import Tutos Wingfoil : `npm run import:wingfoil-tutos` — 10 tutos playlist (merge + créations)

## 2026-08-12

### 🚀 Improved
- Navigation plus fluide : plus de skeleton liste sur `/figures/*`, cache catalogue figures (~2 min), `staleTimes` router 60s, barre de chargement discrète
- Séjour (créateur) : checklist figures — celles sans vidéo restent visibles mais désactivées
- Imports YouTube : compression adaptée aux tutos longs (budget kbps selon durée) + skip members-only + `--only=id1,id2`
- Import Kitesurf College : support `YTDLP_COOKIES` pour les vidéos members-only

### 🔧 Changed
- Figures : toutes les étapes (`steps`) vidées en base — à ressaisir à la main
- Séjour : impossible d’ajouter une figure sans vidéo à la liste du trip
- Figure **Moonslide** créée ; 2 vidéos Moon Slide migrées hors de `toeslide`

### ✨ Added
- Favoris figures : étoile sur fiche / catalogue + page **Mes favoris** (`/favoris`) — SQL `021-figure-favorites.sql`
- Catalogue figures : nombre de vidéos affiché sur chaque ligne
- Import Kitesurf College : `npm run import:kitesurfcollege` — Sécurité / Tutoriels / Kitefoil / Wingfoil / Strapless + merges (vidéos empilées)
- Import Duotone Academy Strapless : `npm run import:duotone-strapless` — 35 tutos playlist (merge + créations Strapless)
- Import Duotone Academy Hooked : `npm run import:duotone-hooked` — 83 tutos playlist (merge + créations)
- Import Duotone Academy Foil : `npm run import:duotone-foil` — 19 tutos playlist (merge Kitefoil / Foil + créations)
- Import Duotone Academy Unhooked : `npm run import:duotone-unhooked` — 41 tutos playlist (merge Unhooked / mobes / toeside + créations)
- Import Duotone Academy Wave : `npm run import:duotone-wave` — 21 tutos playlist (merge Wave / Strapless + créations)
- Import Duotone Academy Beginner : `npm run import:duotone-beginner` — 17 tutos playlist (merge Débuter / Bases / Sécurité + créations)
- Catégories monde **Kitefoil**, **Wingfoil** et **Strapless** (ordre catalogue / XP) — mapping Kitesurf College
- Retry Duotone : yt-dlp `player_client=android,ios,web` pour limiter les 403

## 2026-08-11

### ✨ Added
- Import Les Coachings de Pierre : `npm run import:pierre` — figures **Sécurité** / **Tutoriels** (inactive) + merge sur figures existantes (vidéos empilées)
- Catégorie monde **Tutoriels** (ordre catalogue / XP)
- Catégorie monde **Sécurité** (ordre catalogue / XP)
- Import Steven Akkersdijk : `npm run import:steven` (yt-dlp → compress → Storage) + catégorie **Bonus** (Easy Tricks)
- Script `npm run fetch:youtube` — catalogue liens vidéos d’une chaîne YouTube (yt-dlp → JSON/CSV)
- Admin figures : catégories repliables (clic titre + Tout ouvrir / Tout replier)
- Admin figures : colonne **Done** (suivi curation interne) + filtre À faire / Done — SQL `020-figure-admin-done.sql`
- Admin figures : barre de recherche (nom / slug / catégorie) + filtres actif / inactif et avec / sans vidéo, liste groupée par catégorie + case pour activer / désactiver toute une catégorie

### 📚 Documentation
- Charte graphique KiteQuest (`CHARTE-GRAPHIQUE.md`) — palette, typo, marque, thèmes clair/sombre

## 2026-08-10

### 🐛 Fixed
- Hors-ligne : plus de reload Safari pendant le téléchargement (`reloadOnOnline` off) + lecture inline des vidéos en cache (évite l’erreur `FetchEvent.respondWith` / no-response)

### 🚀 Improved
- Séjour : cocher / décocher un objectif est instantané (maj locale, plus de refresh page entier)

### 🔧 Changed
- « Bientôt disponible » en rouge pour les figures de l’import Twintip avancé (repère temporaire)
- Figures inactives (admin) : visibles catalogue / arbre / séjour, non cliquables, libellé « Bientôt disponible » — fiche détail réservée admin
- Figures : on peut marquer acquise même sans avoir validé les prérequis
- Séjour : rangée d’avatars du crew en haut de la fiche (places + profils)
- Séjour « Inviter le crew » : message correct si amis déjà membres + ajout place (prénom / email / photo) dans le dialog — SQL `014-trip-seat-email.sql`
- Navigation mobile : retour depuis une fiche figure vers la page d’origine (arbre, séjour, dashboard, amis…) + restauration du pan de l’arbre
- Amis : liste des potes en premier (cartes cliquables), fil d’activité en dessous — profil ami `/community/[id]` (progression, objectifs, figures, sessions)
- Séjour : « Objectif de … » affiche les photos de profil (ou initiales) à la place des prénoms
- Spots : plus de saisie lat/lng — coords optionnelles en base (SQL `013-spot-coords-optional.sql`)
- Séjour : liste de figures groupée par monde (ordre arbre), réussies perso masquées par défaut + bouton pour les réafficher
- Séjour : hors-ligne via icône télécharger (dialog : tout le séjour ou mes objectifs, avec nb de vidéos + taille Mo/Go)
- Séjour : « Inviter le crew » en dialog via bouton en haut à droite (plus de carte pleine page)
- Arbre de progression : vrai skill-tree gauche→droite (nœuds + arêtes SVG, pan/scroll) — Débuter en chaînes linéaires par module
- Page Communauté renommée **Amis** (nav + bottom bar) : invite lien + ajout par email regroupés dans un dialog « Inviter un ami »
- Social sans compétition : retrait du classement potes, des défis, des leaderboards séjour / « séjours skillants » et de la comparaison amis sur les figures — fil d’activité et invites conservés (célébration, pas classement)

### ✨ Added
- Formation **Twintip avancé** : catégorie + import vidéos OLK (`npm run import:avance`) — merges tricks existants, nouvelles figures inactives (Flèche bis, Beachstart, Toeslide, olés…)
- Pseudo `@username` unique : inscription + profil, recherche d’amis par pseudo (sinon invite email) — SQL `019-user-username.sql`
- Figures **Surface Backroll Transition**, **Surface Backroll 360**, **Backroll to Toeside**, **Blind to Toeside Transition** — SQL `015`–`018`
- Séjour : le créateur peut retirer un rider (Participants invités → Retirer) — libère place + objectifs
- Vidéos figures : bouton de vitesse de lecture (0.5× → 2×)
- Spots : top 3 populaires (les + mis en favori), ajout en favori en un clic, suggestions de noms similaires à la création
- Séjour : dans « Inviter le crew », ajouter directement des amis déjà sur KiteQuest (membre + place claimée)
- Invitation séjour façon Tricount : places (prénom + photo), lien « Qui es-tu ? », claim après login/register — SQL `prisma/sql/012-trip-seats.sql`
- Inscription fermée : code d’invitation obligatoire — pré-invites admin (email, nom, photo) via `/admin/invites` — SQL `prisma/sql/011-pre-invites.sql`
- Photo de profil : upload JPEG/PNG/WebP (max 2 Mo) dans Paramètres, affichage dans la nav — SQL `prisma/sql/010-user-avatar.sql` + bucket Storage `avatars`
- Formation Débuter : sous-sections des dossiers (bases, matériel, plage, eau, sécurité…) dans le catalogue et l’arbre — badge module sur chaque leçon
- Catalogue figures : recherche instantanée (insensible aux accents) + tri (ordre conseillé, nom, XP croissant/décroissant) côté client
- Arbre de progression (`/figures/arbre`) : skill-tree LTR des prérequis par catégorie (états validée / débloquée / verrouillée) — les « Mondes » du dashboard pointent dessus
- Carnet perso par figure : note libre privée sur chaque fiche (`FigureNote`, `PUT /api/figures/[id]/note`)
- Fiche figure : section « Tes amis sur cette figure » (qui l'a validée et quand)
- Page Stats (`/stats`) : courbe d'XP cumulé 12 mois (SVG maison), répartition par catégorie, records (meilleur mois, première figure, rythme, temps sur l'eau, session la plus ventée)
- Récap hebdo sur `/stats` : figures, XP, sessions et temps sur l'eau de la semaine + carte image partageable (canvas 1080×1350, Web Share API ou téléchargement)
- Défis entre amis sur `/community` : « premier à valider la figure avant la deadline », vainqueur détecté automatiquement depuis la progression (`Challenge`, `POST /api/challenges`, `PATCH/DELETE /api/challenges/[id]`)
- Onboarding nouveau rider (`/onboarding`) : coche les figures déjà maîtrisées après inscription pour démarrer au bon niveau (`POST /api/progress/bulk`)
- SQL migration : `prisma/sql/009-notes-challenges.sql` (`FigureNote`, `Challenge`)
- ESLint configuré (`next/core-web-vitals`) — zéro erreur sur tout le projet
- Spots perso (`/spots`) : création avec géolocalisation, plan d'eau, orientations de vent, spot favori exclusif
- Météo vent Open-Meteo (gratuit, sans clé) : conditions actuelles + prévisions 7 jours (nœuds, rafales, direction, qualité kite) sur le spot favori — cache serveur 30 min
- Assistant taille d'aile : poids rider (profil) × vent prévu → taille conseillée chaque jour + aile du quiver correspondante
- Journal de sessions (`/sessions`) : date, spot, vent, durée, matériel utilisé, ressenti + stats globales (sessions, temps sur l'eau, vent moyen)
- Dashboard : widget météo spot favori + 3 dernières sessions, raccourcis Spots / Sessions
- Matériel : compteur de sorties synchronisé automatiquement depuis les sessions loggées + heures cumulées + historique par pièce
- API : `GET/POST /api/spots`, `PATCH/DELETE /api/spots/[id]` (favori exclusif), `GET/POST /api/sessions`, `PATCH/DELETE /api/sessions/[id]`
- Profil : champ poids (kg) — `PATCH /api/account` accepte `weightKg`
- SQL migration : `prisma/sql/008-sessions-spots.sql` (`Spot`, `KiteSession`, `SessionGear`, `User.weightKg`)
- Dark mode complet « nuit sur le spot » : toggle Auto / Clair / Sombre dans Profil, suit `prefers-color-scheme`, persistance sans flash, `theme-color` PWA dynamique
- Bottom tab bar mobile (Home, Figures, Séjours, Crew, Profil) — remplace le burger pour les connectés
- États de route App Router : `loading.tsx` avec skeletons brandés (dashboard, figures, trips, community, matériel), `error.tsx` avec bouton réessayer, `not-found.tsx` custom
- Système de toasts maison (succès / erreur / info, `aria-live`) branché sur les erreurs réseau muettes (invites, amis, progression)
- Modale de confirmation accessible (focus trap, Escape) remplaçant les 6 `window.confirm()` natifs
- Page Profil (`/parametres`) enrichie : thème, lien Admin (si rôle), bouton Déconnexion
- Vidéos figures : multi-fichiers sur Supabase Storage (upload admin, player HTML5)
- PWA installable (manifest + service worker) + page `/offline`
- Téléchargement hors-ligne : par vidéo, par figure, pack séjour, catalogue actif
- SQL : `prisma/sql/005-figure-videos-storage.sql` + `006-…-policies.sql`
- Keepalive Supabase anti-pause : cron GitHub Actions quotidien + `npm run db:keepalive`
- Endpoint optionnel `GET /api/cron/keepalive` (Bearer `CRON_SECRET`)
- Séjours : liste de figures partagée + objectifs perso (à la place des défis)
- Admin : colonne « Actif » pour masquer / afficher une figure sur `/figures`
- Matériel : quiver perso (`/materiel`) — catégories kite, date/prix d’achat, facture, compteur de sorties
- SQL migration : `prisma/sql/007-gear.sql`
- Page `/parametres` : nom d’affichage + raccourcis compte (`PATCH /api/account`)

### 🐛 Fixed
- `FigureCheckbox` : rollback de l'état si l'API échoue (plus de figure « validée » à tort hors-ligne), confetti seulement après confirmation serveur
- Styles `.subtitle` / `.game-section` manquants (sous-titres non stylés sur trips / matériel / community / paramètres)
- Vercel : `prisma generate` en `postinstall` + `build` (client Prisma obsolète en cache)

### 🔧 Changed
- Filtres catégorie / « masquer les validées » du catalogue figures : instantanés côté client (plus de rechargement de page)
- Inscription sans invitation ni trip : redirection vers `/onboarding` (au lieu du dashboard)
- Design system : `globals.css` (~2 400 lignes) découpé en `src/styles/tokens.css` / `base.css` / `components.css` / `pages.css` (zéro changement visuel)
- Couleurs tokenisées (`--surface`, `color-mix`) pour supporter les deux thèmes
- Polices Fredoka / Nunito migrées vers `next/font` (auto-hébergées, fin du FOUT et de l'appel Google Fonts)
- Boutons `nav-btn` du contenu (communauté) remplacés par `btn btn-secondary` pour la cohérence
- Suppression du streak quotidien (peu réaliste pour le kite)
- Visiteurs déconnectés : accès limité à la landing + connexion (`/figures`, fiches, `/offline` → login)
- Vidéos : plus de liens YouTube/Vimeo — uniquement fichiers Storage (`storagePath`, `order`, …)
- Suppression du système de défis / bonus XP séjour (`TripChallenge` → `TripFigure` + `TripMemberObjective`)
- SQL migration : `prisma/sql/003-trip-objectives.sql`
- Rebrand **KiteQuest** (kitequest.fr) : logos, wordmark, metadata, docs

### 🚀 Improved
- Accessibilité : skip link, `:focus-visible` global, focus rings sur tous les formulaires, `aria-label` sur la checkbox figure, navigation clavier (flèches) du menu profil, `prefers-reduced-motion`
- États `disabled` visibles sur tous les boutons + boutons amis désactivés pendant l'action
- Navbar : placeholder skeleton pendant le chargement de session (plus de « trou » UI)
- Apparition douce des cards + fallbacks Suspense login / register avec skeleton
- Dashboard : UX resserrée (header progression, quêtes en liste, mondes compact, slider badges ←→)
- Landing kitequest.fr : hero marque + scène côtière, sections figures / crew / hors-ligne
- Séjours : checklist figures réservée au créateur ; membres voient la liste + « Ajouter une figure »
- Page figure : bouton « Ajouter à un séjour » → choix du trip
- Séjours : à côté des figures, avatars + prénoms des riders qui l’ont déjà en acquis perso
- Header plateforme : liens produit allégés + menu **Profil** (Matériel, Hors-ligne, Paramètres, Admin, déconnexion)
- Nav : « Aventure » → **Home**, placé en premier lien
- Dashboard : hub app (prochain séjour, objectifs trip, badges en rail horizontal)
- `/figures` : filtre pour masquer les figures déjà validées

### 📚 Documentation
- README : setup bucket `figure-videos`, env Storage, PWA / hors-ligne
- README séjours mis à jour (objectifs au lieu de défis)
- README : section Matériel
- SQL : `prisma/sql/004-figure-active.sql`
- Migrations SQL renommées / numérotées (`001…007`) + `prisma/sql/README.md`

## 2026-08-06

### 📚 Documentation
- Charte graphique extraite de l’UI : `CHARTE-GRAPHIQUE.md`

## 2026-07-31

### ✨ Added
- Lexique complet de 219 figures kitesurf (bases IKO, surface, big air, old school, kiteloops, unhooked, handle passes/mobes, toeside, wave/strapless, foil, extrême)
- Familles officielles freestyle : 313→319, mobes, KGB, Slim, Crow Mobe, Hinterberger, Vulcan, Whirlybird, Moby Dick, etc.
- Big air moderne : megaloop, S-loop, double/triple loop, boogie/doobie, contra loop, kiteloop board-off
- Gamification : XP par catégorie, niveaux + titres, streak, 12 badges, quêtes suivantes, médailles par monde
- Feedback joyeux à l’acquisition (toast +XP + confetti CSS)
- Communauté : lien d’invitation `/invite/[code]`, demandes d’amis par email, classement XP entre potes, fil d’activité
- SQL prêt à jouer : `prisma/sql/001-community.sql`
- Séjours kite (ex. Dakhla) : création, invite crew, défis sur figures, leaderboard XP par dates + classement des trips les plus skillants
- SQL séjours : `prisma/sql/002-trips.sql`

### 🔧 Changed
- `prisma/seed.ts` réécrit avec prérequis réels, ordre d'affichage, et nettoyage des anciennes figures absentes du lexique
- README : compteur de figures mis à jour (~220)
- Thème UI soft côtier (fond clair ciel/aqua/sable) à la place du navy quasi-noir
- Polices Fredoka + Nunito ; dashboard / listes / home restylés en hub de jeu
- UI full responsive mobile : menu burger, touch targets, safe-area, filtres scrollables
- README : guide de mise en ligne Vercel + Supabase
