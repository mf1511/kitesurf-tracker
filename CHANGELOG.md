# Changelog

## 2026-08-10

### ✨ Added
- Catalogue figures : recherche instantanée (insensible aux accents) + tri (ordre conseillé, nom, XP croissant/décroissant) côté client
- Arbre de progression (`/figures/arbre`) : vue arborescente des prérequis par catégorie avec états validée / débloquée / verrouillée — les « Mondes » du dashboard pointent dessus
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
