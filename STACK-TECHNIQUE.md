# KiteQuest — Stack technique

Document de référence de la stack et de l’architecture applicative.

**Prod :** [kitequest.fr](https://kitequest.fr)  
**Repo :** Next.js App Router, TypeScript, Prisma, Supabase.

---

## Vue d’ensemble

```
┌─────────────────────────────────────────────────────────┐
│  Client (mobile-first PWA)                              │
│  React 18 · CSS custom · Service Worker (prod)          │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────┐
│  Next.js 14 (App Router) — Node.js / Vercel             │
│  Pages RSC · Route Handlers `/api/*` · NextAuth JWT     │
└─────────────┬─────────────────────────────┬─────────────┘
              │ Prisma                      │ supabase-js
              │                             │ (service role)
┌─────────────▼─────────────┐   ┌───────────▼─────────────┐
│  PostgreSQL (Supabase)    │   │  Supabase Storage       │
│  schéma Prisma + SQL manuel│   │  figure-videos, avatars │
└───────────────────────────┘   └─────────────────────────┘
              │
              │ HTTPS (sans clé)
┌─────────────▼─────────────┐
│  Open-Meteo API           │
│  vent / prévisions spots  │
└───────────────────────────┘
```

---

## Runtime & framework

| Couche | Techno | Version / notes |
|--------|--------|-----------------|
| Framework | **Next.js** | `14.2.15` — App Router (`src/app`) |
| Langage | **TypeScript** | `^5.5` — `strict` via `tsconfig.json` |
| UI | **React** | `^18.3` |
| Styles | **CSS custom** | `src/styles/*` — pas de Tailwind / pas de lib UI |
| Package manager | npm | `package-lock.json` |

### Patterns Next.js utilisés

- **Server Components** par défaut pour les pages data
- **Client Components** (`"use client"`) isolés : forms, dialogs, toasts, skill-tree, PWA offline
- **Route Handlers** : `src/app/api/**/route.ts`
- États de route : `loading.tsx`, `error.tsx`, `not-found.tsx`
- Navigation retour mobile : query `?from=` (`src/lib/nav-return.ts`)

---

## Auth

| Élément | Détail |
|---------|--------|
| Lib | **NextAuth.js** `^4.24` |
| Provider | **Credentials** (email + mot de passe) |
| Session | **JWT** (pas de sessions DB) |
| Hash | **bcryptjs** |
| Pages | `/login`, `/register` |
| Config | `src/lib/auth.ts` |

Inscription **sur invitation** :

- code ami (`Invite`)
- pré-invite admin (`PreInvite` — email + nom + photo)
- code séjour (`Trip.inviteCode`) pour le flow join Tricount

Rôles : `user` | `admin` (champ `User.role`).

---

## Données

| Élément | Détail |
|---------|--------|
| ORM | **Prisma** `^5.20` (`@prisma/client`) |
| Base | **PostgreSQL** hébergé **Supabase** |
| URL | `DATABASE_URL` (direct ou pooler) |
| Schéma | `prisma/schema.prisma` |
| Migrations | SQL manuel dans `prisma/sql/*.sql` (appliqués dans le SQL Editor Supabase) |

### Domaines métier (modèles principaux)

- **Progression** : `Figure`, `UserProgress`, `FigureNote`, prérequis
- **Social** : `Friendship`, `Invite`, `PreInvite`
- **Séjours** : `Trip`, `TripMember`, `TripFigure`, `TripMemberObjective`, `TripSeat`
- **Terrain** : `Spot`, `KiteSession`, `SessionGear`
- **Matériel** : `Gear`
- **Médias** : `Video` (+ Storage)
- **Autres** : `Challenge` (héritage schéma ; UI compétitive retirée)

### Seed & scripts

```bash
npm run db:seed          # figures (tsx prisma/seed.ts)
npm run db:studio        # Prisma Studio
npm run db:keepalive     # ping DB (évite pause Supabase free)
npm run make-admin       # promotion admin
npm run import:debuter   # import vidéos formation Débuter
```

---

## Stockage fichiers (Supabase Storage)

Client admin : `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY`  
(`src/lib/supabase-admin.ts`)

| Bucket | Usage |
|--------|--------|
| `figure-videos` | Vidéos de figures / leçons |
| `avatars` | Photos profil, pré-invites, places séjour |

Variables :

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Front & UX

- **Mobile-first** + bottom tab bar (`src/components/bottom-nav.tsx`)
- Charte : `CHARTE-GRAPHIQUE.md`
- Composants UI maison : toasts, confirm dialog, avatars
- Skill-tree SVG custom : `src/lib/skill-tree-layout.ts` + `skill-tree-canvas.tsx`
- Hors-ligne vidéos : Cache Storage navigateur (`src/lib/offline-videos.ts`)

### PWA

- `@ducanh2912/next-pwa` (Workbox)
- Activée en **production uniquement** (`next.config.js`)
- Cache : fonts, `_next/static`, pages clés (NetworkFirst)
- Vidéos : téléchargement explicite, pas de runtime caching agressif

---

## APIs externes

| Service | Usage | Auth |
|---------|--------|------|
| **Open-Meteo** | Vent actuel + prévisions 7j (spots) | Aucune clé |
| Code | `src/lib/weather.ts` | — |

Assistant taille d’aile : `User.weightKg` × vent prévu → reco (dashboard / spots).

---

## Organisation du code

```
src/
  app/           # routes App Router + API
  components/    # UI (kebab-case)
  lib/           # domaine, prisma, auth, weather…
  styles/        # CSS global / pages / components
  types/         # typings NextAuth, etc.
prisma/
  schema.prisma
  seed.ts
  sql/           # migrations SQL numérotées (001 → 014…)
scripts/         # tooling (import, keepalive, admin)
public/          # assets + artefacts PWA
```

Conventions :

- Composants fichiers en **kebab-case**
- Minimiser `"use client"`
- SQL Supabase **lancé à la main** (pas `prisma migrate` en prod côté Marin)

---

## Environnement local

Fichier `.env` (voir `.env.example`) :

```env
DATABASE_URL=postgresql://…
NEXTAUTH_SECRET=…
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://….supabase.co
SUPABASE_SERVICE_ROLE_KEY=…
```

Commandes usuelles :

```bash
npm install
npx prisma generate    # obligatoire après changement de schema
npm run dev            # http://localhost:3000
npm run lint
```

Après ajout d’un modèle Prisma : **régénérer le client** puis **redémarrer** Next (singleton Prisma en mémoire).

---

## Build & déploiement

| Étape | Commande / note |
|-------|-----------------|
| Build | `prisma generate && next build` (`npm run build`) |
| Start | `next start` |
| Lint | `eslint` + `eslint-config-next` |
| Hébergement typique | **Vercel** (Next.js) |
| DB / Storage | **Supabase** |

---

## Ce qui n’est pas dans la stack

- Pas de Tailwind / shadcn / Material
- Pas d’ORM autre que Prisma
- Pas d’auth OAuth (Google, etc.) pour l’instant
- Pas de Redis / queue
- Pas de tests automatisés E2E/unitaires formalisés dans le repo (à date)

---

## Documents liés

| Fichier | Contenu |
|---------|---------|
| `README.md` | Setup, features, SQL |
| `CHARTE-GRAPHIQUE.md` | Design system |
| `CHANGELOG.md` | Historique des changements |
| `prisma/sql/README.md` | Ordre / usage des SQL |
