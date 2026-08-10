# KiteQuest

[kitequest.fr](https://kitequest.fr) — application Next.js (App Router) + TypeScript
pour suivre sa progression sur les figures de kitesurf : XP, quêtes, séjours crew,
fiches détaillées, vidéos Supabase Storage, PWA hors-ligne.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **NextAuth.js** (Credentials provider, email + mot de passe, sessions JWT)
- **Prisma** + **Postgres Supabase**
- **Supabase Storage** (bucket `figure-videos`)
- **PWA** (`@ducanh2912/next-pwa`) — installable + cache shell / pages
- Aucune dépendance UI externe : CSS custom (charte KiteQuest)

## Fonctionnalités

- Création de compte / connexion (email + mot de passe, hashé avec bcrypt)
- Espace personnel (`/dashboard`) avec jauge de progression globale + par catégorie
- Liste de 219 figures (`/figures`), filtrables par catégorie
- Fiche détaillée par figure (`/figures/[slug]`) :
  - Description
  - Étapes pour réaliser la figure
  - Figures à maîtriser avant (prérequis), cliquables, avec statut acquis/non acquis
  - Figures débloquées ensuite
  - Case à cocher "acquis" (verrouillée tant que les prérequis ne sont pas validés)
  - Vidéos multi-fichiers (mp4/webm/mov) hébergées sur Supabase Storage
  - Téléchargement hors-ligne : par vidéo, par figure, pack séjour, catalogue

## Communauté

Espace `/community` pour jouer entre potes :

- **Lien d'invitation** partageable (`/invite/xxxxx`) — l'ami s'inscrit et vous
  devenez amis automatiquement
- **Demande d'ami par email** si le compte existe déjà
- **Classement XP** entre amis + **fil d'activité** (figures validées)

**SQL Supabase (Postgres) — un seul fichier :**  
`prisma/sql/supabase-full.sql`  
(ne pas utiliser les migrations SQLite `DATETIME` — Postgres refuse.)

## Séjours (trips)

Espace `/trips` pour les sessions en crew (ex. 12 jours à Dakhla) :

- Créer un séjour avec **dates** → l’XP des figures cochées entre ces dates
  compte automatiquement pour le leaderboard du trip (via `completedAt`)
- Inviter le crew avec un lien `/trips/join/[code]`
- Construire une **liste de figures** partagée + **objectifs perso** pour chaque rider
- Voir le fil d’activité du trip et le classement « séjours les plus skillants »

(inclus dans `prisma/sql/supabase-full.sql`)

## Matériel

Espace `/materiel` pour ton quiver perso :

- Catégories : aile, barre, harnais, planche, straps, pads, foil, casque,
  combinaison, leash, pompe, ailerons, wing, accessoire…
- Date / prix d’achat, notes, compteur de sorties (+/−)
- Facture jointe (PDF ou image, max 4 Mo, stockée en base)

Migration incrémentale : `prisma/sql/007-gear.sql`  
(voir l’ordre dans `prisma/sql/README.md` — aussi dans `supabase-full.sql`)

## Espace admin

Un espace `/admin` permet de créer, modifier et supprimer n'importe quelle
figure (nom, catégorie, description, étapes, ordre d'affichage, prérequis),
réservé aux comptes ayant le rôle `admin`.

Pour te donner les droits admin :

```bash
# 1. Crée d'abord ton compte normalement via /register
# 2. Promeus-le en admin :
npm run make-admin -- ton-email@example.com
```

Le lien "Admin" apparaît ensuite dans la barre de navigation une fois
reconnecté. Depuis `/admin` tu peux :
- voir toutes les figures, leur nombre de prérequis et de vidéos
- créer une nouvelle figure (`/admin/figures/new`)
- modifier une figure existante, y compris son slug et ses prérequis
  (`/admin/figures/[slug]/edit`)
- **uploader plusieurs vidéos** par figure (Supabase Storage) depuis la page d’édition
- supprimer une figure (supprime aussi la progression des utilisateurs et
  les vidéos associées, mais retire proprement les liens de prérequis des
  autres figures)

## Vidéos Supabase Storage + PWA

### Setup Storage (manuel)

1. Dashboard Supabase → **Storage** → New bucket **`figure-videos`** (public).
2. Exécute `prisma/sql/005-figure-videos-storage.sql` (colonnes Video).
3. Exécute `prisma/sql/006-figure-videos-storage-policies.sql` (lecture publique).
4. Ajoute dans `.env` / Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (jamais exposée au client)

Les uploads admin passent par une **signed upload URL** (pas de gros body via Vercel).

### Hors-ligne

- Page `/offline` : packs + gestion du cache local
- Par vidéo / figure sur `/figures/[slug]`
- Pack séjour sur `/trips/[id]`
- Pack catalogue sur `/figures` ou `/offline`

Le service worker (build prod) cache le shell et les navigations ; les fichiers vidéo
ne sont téléchargés que sur action explicite (Cache Storage `kitequest-offline-videos`).

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Édite .env et remplace NEXTAUTH_SECRET par une chaîne aléatoire
# (tu peux en générer une avec : openssl rand -base64 32)

# 3. Créer la base de données SQLite + tables
npx prisma migrate dev --name init

# 4. Peupler la base avec les 219 figures et leurs prérequis
npm run db:seed

# 5. Lancer le serveur de dev
npm run dev
```

L'app tourne ensuite sur http://localhost:3000

## Structure du projet

```
prisma/
  schema.prisma      -> modèles User, Figure, UserProgress, Video
  seed.ts             -> toutes les figures + leurs prérequis
src/
  app/
    page.tsx                    -> accueil
    login/, register/           -> auth
    dashboard/                  -> suivi personnel
    figures/                    -> liste des figures
    figures/[slug]/              -> fiche détaillée d'une figure
    api/auth/[...nextauth]/      -> NextAuth
    api/auth/register/           -> inscription
    api/progress/                 -> toggle "figure acquise"
    api/admin/figures/[slug]/videos/ -> upload / CRUD vidéos Storage (admin)
    api/videos/catalog/              -> catalogue pour packs hors-ligne
    offline/                         -> gestion cache vidéos
  components/          -> Navbar, players, offline packs, admin vidéos
  lib/                 -> prisma, auth, supabase-admin, offline-videos
```

## Notes / pistes d'évolution

- Les descriptions et étapes de chaque figure dans `prisma/seed.ts` sont un
  point de départ solide (contenu réel et cohérent) — libre à toi de les
  enrichir/corriger, c'est un simple `UPDATE` en base ou un `npm run db:seed`
  après modification du fichier.

## Mise en ligne (Vercel + Supabase) — pas à pas

SQLite ne marche pas bien en prod serverless. On utilise **Postgres Supabase** + **Vercel**.

### 1. Repo GitHub
1. Crée un repo GitHub (privé ou public).
2. Depuis ton projet local :
```bash
git add .
git commit -m "Ready for deploy"
git remote add origin https://github.com/TON_USER/kitesurf-tracker.git
git push -u origin main
```

### 2. Base Supabase (Postgres)
1. Va sur [https://supabase.com](https://supabase.com) → New project.
2. **Settings → Database** → copie l’URI **Transaction** / URI Postgres  
   (format `postgresql://postgres.[ref]:[PASSWORD]@aws-0-....pooler.supabase.com:6543/postgres`).
3. Dans `prisma/schema.prisma`, change :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
4. En local, mets temporairement cette URL dans `.env` puis :
```bash
npx prisma migrate deploy
npm run db:seed
```
   Ou exécute toi-même les SQL dans le SQL Editor Supabase  
   (`prisma/sql/supabase-full.sql` ou les migrations `001…` dans l’ordre),  
   puis `npm run db:seed` avec `DATABASE_URL` pointant sur Supabase.

### 3. Déployer sur Vercel
1. Va sur [https://vercel.com](https://vercel.com) → **Add New Project** → importe le repo GitHub.
2. Framework : Next.js (détecté auto).
3. **Environment Variables** (Production) :
   - `DATABASE_URL` = URI Supabase (idéalement **pooled** + `?pgbouncer=true` si demandé par Prisma)
   - `NEXTAUTH_SECRET` = `openssl rand -base64 32`
   - `NEXTAUTH_URL` = `https://ton-projet.vercel.app` (ou ton domaine custom)
   - `NEXT_PUBLIC_SUPABASE_URL` = URL projet Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = clé service role (Storage uploads admin)
4. Deploy. Après le premier deploy, mets à jour `NEXTAUTH_URL` si l’URL Vercel diffère, puis **Redeploy**.

### 4. Après le go-live
1. Ouvre l’URL Vercel → `/register` → crée ton compte.
2. En local (avec `DATABASE_URL` prod) :  
   `npm run make-admin -- ton-email@example.com`
3. Reconnecte-toi → lien Admin + Communauté.
4. (Optionnel) Domaine custom dans Vercel → Settings → Domains, puis mets à jour `NEXTAUTH_URL`.

### Checklist mobile
- Teste sur ton iPhone : menu burger, figures, cocher une figure, communauté (copier le lien d’invite).
- Partage le lien d’invite WhatsApp → tes potes s’inscrivent depuis le téléphone.

## Keepalive Supabase (anti-pause free tier)

Le free tier Supabase **pause** le projet après ~7 jours sans activité.
Un cron GitHub Actions ping la DB chaque jour.

1. Repo GitHub → **Settings → Secrets and variables → Actions**
2. New secret : `DATABASE_URL` = ton URI **pooler** Supabase (port 6543)
3. Push le workflow `.github/workflows/supabase-keepalive.yml`
4. **Actions** → “Supabase keepalive” → **Run workflow** (test manuel)

Option Vercel : `GET /api/cron/keepalive` avec header  
`Authorization: Bearer $CRON_SECRET` (ajoute aussi `CRON_SECRET` dans Vercel).
