# Changelog

## 2026-07-31

### ✨ Added
- Lexique complet de 219 figures kitesurf (bases IKO, surface, big air, old school, kiteloops, unhooked, handle passes/mobes, toeside, wave/strapless, foil, extrême)
- Familles officielles freestyle : 313→319, mobes, KGB, Slim, Crow Mobe, Hinterberger, Vulcan, Whirlybird, Moby Dick, etc.
- Big air moderne : megaloop, S-loop, double/triple loop, boogie/doobie, contra loop, kiteloop board-off
- Gamification : XP par catégorie, niveaux + titres, streak, 12 badges, quêtes suivantes, médailles par monde
- Feedback joyeux à l’acquisition (toast +XP + confetti CSS)
- Communauté : lien d’invitation `/invite/[code]`, demandes d’amis par email, classement XP entre potes, fil d’activité
- SQL prêt à jouer : `prisma/sql/2026-07-31-community.sql`
- Séjours kite (ex. Dakhla) : création, invite crew, défis sur figures, leaderboard XP par dates + classement des trips les plus skillants
- SQL séjours : `prisma/sql/2026-07-31-trips.sql`

### 🔧 Changed
- `prisma/seed.ts` réécrit avec prérequis réels, ordre d'affichage, et nettoyage des anciennes figures absentes du lexique
- README : compteur de figures mis à jour (~220)
- Thème UI soft côtier (fond clair ciel/aqua/sable) à la place du navy quasi-noir
- Polices Fredoka + Nunito ; dashboard / listes / home restylés en hub de jeu
- UI full responsive mobile : menu burger, touch targets, safe-area, filtres scrollables
- README : guide de mise en ligne Vercel + Supabase
