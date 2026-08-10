# Kitesurf Tracker

Application Next.js (App Router) + TypeScript pour suivre sa progression
personnelle sur toutes les figures de kitesurf : compte utilisateur,
fiches détaillées par figure (description, étapes, prérequis), et
ajout de vidéos (liens YouTube/Vimeo embarqués).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **NextAuth.js** (Credentials provider, email + mot de passe, sessions JWT)
- **Prisma** + **SQLite** (facile à faire tourner en local, migrable vers Postgres/MySQL en prod)
- Aucune dépendance UI externe : CSS custom, thème "navy / sable"

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
  - Vidéos : ajout d'un lien (YouTube/Vimeo → lecteur intégré automatiquement,
    sinon simple lien cliquable), partagées entre tous les comptes

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
- Lancer des **défis** liés à une figure (+ bonus XP séjour)
- Voir le fil d’activité du trip et le classement « séjours les plus skillants »

(inclus dans `prisma/sql/supabase-full.sql`)

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
- supprimer une figure (supprime aussi la progression des utilisateurs et
  les vidéos associées, mais retire proprement les liens de prérequis des
  autres figures)

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
    api/figures/[slug]/video/     -> ajout/suppression de vidéo
  components/          -> Navbar, checkbox de progression, formulaire vidéo
  lib/                 -> prisma client, config NextAuth, helper embed vidéo
```

## Notes / pistes d'évolution

- Les descriptions et étapes de chaque figure dans `prisma/seed.ts` sont un
  point de départ solide (contenu réel et cohérent) — libre à toi de les
  enrichir/corriger, c'est un simple `UPDATE` en base ou un `npm run db:seed`
  après modification du fichier.
- Les vidéos sont stockées comme des **liens** (YouTube/Vimeo/Drive...), pas
  comme des fichiers uploadés : plus simple à mettre en place sans service de
  stockage cloud (S3, etc.), et ça évite les gros fichiers vidéo dans ta base.
  Si tu veux du vrai upload de fichier plus tard, il faudra brancher un
  service de stockage (Cloudflare R2, S3, Supabase Storage...).
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
   (`prisma/migrations/.../migration.sql` + `prisma/sql/2026-07-31-community.sql`),  
   puis `npm run db:seed` avec `DATABASE_URL` pointant sur Supabase.

### 3. Déployer sur Vercel
1. Va sur [https://vercel.com](https://vercel.com) → **Add New Project** → importe le repo GitHub.
2. Framework : Next.js (détecté auto).
3. **Environment Variables** (Production) :
   - `DATABASE_URL` = URI Supabase (idéalement **pooled** + `?pgbouncer=true` si demandé par Prisma)
   - `NEXTAUTH_SECRET` = `openssl rand -base64 32`
   - `NEXTAUTH_URL` = `https://ton-projet.vercel.app` (ou ton domaine custom)
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
