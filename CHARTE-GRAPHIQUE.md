# Charte graphique — KiteQuest

Source de vérité : `src/styles/tokens.css`, `src/app/layout.tsx`, `src/components/brand-mark.tsx`.

## Positionnement

**Ambiance** : soft coastal — ciel, écume, sable, corail. Ludique et lisible, sans mode « SaaS violet » ni dark-first.

**Promesse visuelle** : progression kitesurf (XP, quêtes, crew) dans une UI claire, ronde, marine.

**Domaine** : kitequest.fr · PWA theme color `#d4eef8`

---

## Marque

| Élément | Valeur |
|--------|--------|
| Nom | **KiteQuest** |
| Picto | Aile aqua + flèche corail sur disque ciel (`brand-mark` / `/brand-mark.svg`) |
| Couleurs picto | Ciel `#d4eef8` · Aile `#2a9bb0` · Flèche `#ff7a6e` · Pivot `#0f2740` |

Usage : wordmark + picto en nav ; le brand mark reste le signal hero sur les surfaces marketing / splash.

---

## Typographie

| Rôle | Police | Weights | Usage |
|------|--------|---------|--------|
| Display | **Fredoka** | 500 · 600 · 700 | `h1`–`h3`, `.brand`, titres expressifs |
| Body | **Nunito** | 500 · 600 · 700 · 800 | UI, paragraphes, boutons |

Variables CSS : `--font-display`, `--font-body` (injectées via `next/font`).

---

## Couleurs — thème clair (défaut)

### Primaires & surfaces

| Token | Hex / valeur | Rôle |
|-------|----------------|------|
| `--sky` | `#e8f4fc` | Fond de base |
| `--sky-mid` | `#d4eef8` | Fond milieu / themeColor PWA |
| `--foam` | `#f7fbfc` | Surface claire |
| `--aqua` | `#7ec8d8` | Accent doux, bordures interactives |
| `--aqua-deep` | `#2a9bb0` | CTA, liens forts, marque |
| `--navy` | `#1a3a52` | Texte principal |
| `--navy-soft` | `#2d5470` | Texte secondaire fort |
| `--mist` | `#5a7a90` | Métadonnées, labels |
| `--surface` | `#ffffff` | Surfaces opaques |
| `--card` | `rgba(255,255,255,0.72)` | Cartes glass |
| `--card-solid` | `#ffffff` | Cartes opaques |

### Accents

| Token | Hex | Rôle |
|-------|-----|------|
| `--coral` | `#ff7a6e` | Accent énergie / hover fort |
| `--coral-soft` | `#ffb4ad` | Glow / accents légers |
| `--sand` | `#f2e6c9` | Chaleur fond |
| `--sand-warm` | `#e8c97a` | Highlight sable |

### Sémantiques & médailles

| Token | Hex | Rôle |
|-------|-----|------|
| `--success` | `#3cb88a` | Validé / acquis |
| `--danger` | `#e05555` | Erreur / danger |
| `--gold` | `#e8b84b` | Rang or |
| `--silver` | `#a8b8c4` | Rang argent / neutre |
| `--bronze` | `#c4895a` | Rang bronze |

### Traits & ombre

| Token | Valeur |
|-------|--------|
| `--line` | `rgba(26, 58, 82, 0.1)` |
| `--line-strong` | `rgba(26, 58, 82, 0.18)` |
| `--shadow` | `0 8px 28px rgba(42, 155, 176, 0.12)` |

### Fond page (`--bg-layers`)

Empilement (du dessus vers le dessous) :

1. Radial aqua ~45 % opacité (coin haut gauche)
2. Radial coral-soft ~28 % (haut droite)
3. Radial sand-warm ~22 % (bas centre)
4. Dégradé vertical `sky → sky-mid → #eef6f0`

Texture optionnelle : vagues SVG aqua en overlay (`body::before`, opacity ~0.35).

---

## Couleurs — thème sombre « nuit sur le spot »

Activé via `[data-theme="dark"]` (toggle ou préférence système).

| Token | Hex (approx.) | Note |
|-------|----------------|------|
| `--sky` / `--sky-mid` | `#0d2233` / `#10293d` | Nuit |
| `--aqua` / `--aqua-deep` | `#5cb9cc` / `#3fb5ca` | Accents plus lumineux |
| `--navy` | `#e8f2f9` | Texte clair (inversé sémantiquement) |
| `--mist` | `#93aebf` | Secondaire |
| `--surface` / `--card-solid` | `#16324a` | Panneaux |
| `--coral` | `#ff8a7f` | Accent |
| `--success` / `--danger` | `#4ecf9d` / `#f07575` | Sémantique |

Les tokens `--sand` / `--sand-warm` / médailles restent ceux du clair sauf overrides listés dans `tokens.css`.

---

## Formes & rayons

| Usage | Rayon |
|-------|--------|
| Boutons, pills XP, chips | `999px` (full) |
| Cartes, tableaux wrap | `16px`–`18px` |
| Inputs / blocs moyens | `12px`–`14px` |
| Checkboxes | `8px` (`sm` : `6px`) |
| Avatars | `50%` |

---

## Composants UI (règles)

### Boutons

- **Primary** : dégradé `aqua-deep → #3db8c9`, texte blanc, ombre aqua
- **Secondary** : surface blanche, bordure `line-strong`, hover aqua
- **Ghost** : fond card, bordure légère
- **Danger** : texte / hover danger soft
- Hover commun : `translateY(-1px)` léger
- Padding type : `12px 24px`, weight `700`

### Cartes

Fond `--card` ou `--card-solid`, ombre `--shadow`, pas de multi-ombres lourdes.

### Liens / focus

Accent hover → `--aqua-deep` (parfois `--coral` pour actions fortes).

### Contenu page

`.page` : max-width **960px**, padding `24px 16px`, bas réservé bottom-nav + safe-area.

---

## Voix visuelle (do / don’t)

**Do**

- Palette côtière aqua / navy / coral / sand
- Fredoka pour les titres, Nunito pour le corps
- Boutons pills, coins généreux
- Glass léger (`--card`) sur fonds dégradés

**Don’t**

- Violet / indigo « AI default »
- Fond crème + serif terracotta générique
- Dark mode forcé sans toggle
- Glow néon, ombres empilées, emojis comme identité marque

---

## Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `src/styles/tokens.css` | Palette light / dark |
| `src/styles/base.css` | Body, titres, page |
| `src/styles/components.css` | Boutons, nav, checkbox… |
| `src/styles/pages.css` | Écrans |
| `src/app/layout.tsx` | Fonts + metadata |
| `src/components/brand-mark.tsx` | Picto marque |
