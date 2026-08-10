# Charte graphique — Kitesurf Tracker

Document de référence extrait de l’UI actuelle (`src/app/globals.css`, `src/app/layout.tsx`).  
À utiliser pour écrans, docs, posts, stickers crew, etc.

---

## 1. Positionnement

| | |
|---|---|
| **Nom** | Kitesurf Tracker |
| **Univers** | Côtier soft, ludique, “aventure entre potes” |
| **Ton** | Fun, clair, motivant — pas dark, pas corporate |
| **Promesse visuelle** | Ciel + lagune + sable + énergie coral |

**À éviter :** dark mode, purple gradients, crème + terracotta, Inter/Roboto/Arial, cartes lourdes partout, glow néon.

---

## 2. Logo / marque

- **Nom affiché :** `Kitesurf Tracker` (pas d’acronyme)
- **Police :** Fredoka Bold (700)
- **Couleur défaut :** Aqua deep `#2a9bb0`
- **Hover / accent :** Coral `#ff7a6e`
- **Cas :** Title Case (pas FULL CAPS)
- **Letter-spacing :** léger `0.01em`

Pas de logo image officiel pour l’instant — le wordmark typographique fait office de marque.

---

## 3. Palette

### Primaires

| Token | Hex | Usage |
|---|---|---|
| Sky | `#e8f4fc` | Fond principal |
| Sky mid | `#d4eef8` | Dégradé fond / theme-color navigateur |
| Aqua | `#7ec8d8` | Accents soft, chips, barres |
| Aqua deep | `#2a9bb0` | Marque, liens, CTA secondaires, focus |
| Coral | `#ff7a6e` | CTA forts, streak, hover marque |
| Coral soft | `#ffb4ad` | Dégradés, highlights |

### Neutres / texte

| Token | Hex | Usage |
|---|---|---|
| Navy | `#1a3a52` | Texte principal |
| Navy soft | `#2d5470` | Texte secondaire / nav |
| Mist | `#5a7a90` | Meta, labels, hints |
| Foam | `#f7fbfc` | Surfaces claires, nav blur |
| White | `#ffffff` | Cards solides, inputs |

### Ambiance (fonds / accents)

| Token | Hex | Usage |
|---|---|---|
| Sand | `#f2e6c9` | Warmth de fond |
| Sand warm | `#e8c97a` | Glow bas de page / XP soft |

### Sémantiques

| Token | Hex | Usage |
|---|---|---|
| Success | `#3cb88a` | Figure acquise, check |
| Danger | `#e05555` | Erreurs, suppression |
| Gold | `#e8b84b` | Médailles / badges earned |
| Silver | `#a8b8c4` | États locked |
| Bronze | `#c4895a` | Progression partielle |

### Transparences utiles

```css
--line: rgba(26, 58, 82, 0.1);
--line-strong: rgba(26, 58, 82, 0.18);
--card: rgba(255, 255, 255, 0.72);
--shadow: 0 8px 28px rgba(42, 155, 176, 0.12);
```

### Nuancier rapide (copie)

```
#e8f4fc  #d4eef8  #7ec8d8  #2a9bb0
#ff7a6e  #ffb4ad  #1a3a52  #5a7a90
#f2e6c9  #e8c97a  #3cb88a  #e05555
```

---

## 4. Dégradés & fond

### Fond page (atmosphère côtière)

1. Radial aqua haut-gauche  
2. Radial coral soft haut-droit  
3. Radial sand bas-centre  
4. Linear vertical : `#e8f4fc` → `#d4eef8` → `#eef6f0`

### Motif vague

Trait SVG répété, stroke aqua deep à ~25 % d’opacité, tile `120×40`.

### CTA

- **Primary :** `linear-gradient(135deg, #2a9bb0, #3db8c9)`
- **Coral / CTA nav :** `linear-gradient(135deg, #ff7a6e, #ff9488)`
- **XP bar :** `linear-gradient(90deg, #7ec8d8, #2a9bb0, #ffb4ad)`

---

## 5. Typographie

| Rôle | Police | Weights | Usage |
|---|---|---|---|
| Display / titres | **Fredoka** | 500–700 | H1–H3, brand, chiffres XP, ranks |
| Body / UI | **Nunito** | 500–800 | Texte, boutons, labels, meta |

**Google Fonts :**
```
Fredoka: wght@500;600;700
Nunito: wght@500;600;700;800
```

### Échelle indicative

| Élément | Taille | Weight |
|---|---|---|
| Hero H1 | `clamp(2.1rem, 6vw, 3.4rem)` | 700 Fredoka |
| Page H1 | `1.6–1.8rem` | 700 Fredoka |
| Section H2 | `1.1–1.15rem` | 700 Fredoka |
| Body | `0.92–1.05rem` | 600 Nunito |
| Meta / pills | `0.7–0.8rem` | 700–800 Nunito |
| Inputs mobile | `16px` min | (évite zoom iOS) |

---

## 6. Formes & composants

| Élément | Règle |
|---|---|
| Rayons cards | `16–22px` |
| Boutons / pills | `999px` (pill) |
| Inputs | `12px` |
| Checkbox | `8px` (carré soft) |
| Ombres | soft aqua (`--shadow`), jamais multi-layer noir |
| Borders | `1px` line / line-strong |
| Cards | verre clair (`rgba(255,255,255,0.72)` + blur léger) |
| Contenu max | `960px` centré |

### Boutons

- **Primary :** pill, dégradé aqua, texte blanc, ombre aqua
- **Ghost :** fond card, border line-strong, texte navy
- **Danger :** outline `#e05555`
- **Touch target mobile :** min ~`44–48px` hauteur

### États

- **Hover liens marque :** coral  
- **Focus input :** border aqua deep + ring `rgba(42,155,176,0.15)`  
- **Locked :** opacity ~0.45 + grayscale léger  
- **Done / success :** fond vert soft + check

---

## 7. Iconographie & gamification

- Style : emoji OK dans l’UI jeu (badges, streak 🔥, quêtes) — pas d’emoji décoratifs sur le hero marketing
- Médailles mondes : 🥉 / 🥈 / 🥇 selon % catégorie
- XP : pastilles aqua `+XX XP`
- Statuts séjour : pills `live` (vert) / `upcoming` (aqua) / `past` (silver)

---

## 8. Motion

| Animation | Durée / easing | Usage |
|---|---|---|
| Check pop | `0.35s` cubic-bezier(0.22, 1, 0.36, 1) | Checkbox validée |
| XP bar fill | `0.6s` même easing | Jauge niveau |
| Badge pop | `0.4s` ease | Badge débloqué |
| Floaty | `3s` ease-in-out infinite | Kicker hero |
| Confetti | `0.9s` ease-out | Acquisition figure |
| Hover lift | `translateY(-1/-2px)` ~`0.15s` | Cards / boutons |

Peu de motion, intentionnelle — pas de parallaxe lourde ni glow pulsé.

---

## 9. Layout & responsive

- **Mobile-first** : menu burger + drawer, grilles → 1 colonne sous `768px`
- Safe-area iOS respectée (`env(safe-area-inset-*)`)
- Filtres catégories : scroll horizontal, chips nowrap
- Theme color PWA / navigateur : `#d4eef8`

---

## 10. Voix & microcopy

- Tutoiement, énergie positive
- Verbes d’action : « Commencer l’aventure », « Inviter le crew », « Lancer un défi »
- Vocabulaire mixte FR + kite (XP, trip, crew, spot, straps)
- Pas de jargon admin côté user

---

## 11. Do / Don’t

### Do
- Fonds clairs côtiers avec dégradés doux  
- Fredoka pour la hiérarchie, Nunito pour le corps  
- CTA coral ou aqua selon priorité  
- Cards translucides, coins généreux, pills  

### Don’t
- Fond noir / navy profond  
- Purple UI, glassmorphism excessif, néons  
- Polices système par défaut  
- Trop de cards dans un hero  
- UPPERCASE agressif sur les titres longs  

---

## 12. Tokens CSS (source de vérité)

Fichier : [`src/app/globals.css`](src/app/globals.css) — bloc `:root`.

```css
:root {
  --sky: #e8f4fc;
  --sky-mid: #d4eef8;
  --aqua: #7ec8d8;
  --aqua-deep: #2a9bb0;
  --foam: #f7fbfc;
  --sand: #f2e6c9;
  --sand-warm: #e8c97a;
  --coral: #ff7a6e;
  --coral-soft: #ffb4ad;
  --navy: #1a3a52;
  --navy-soft: #2d5470;
  --mist: #5a7a90;
  --success: #3cb88a;
  --danger: #e05555;
  --font-display: "Fredoka", system-ui, sans-serif;
  --font-body: "Nunito", system-ui, sans-serif;
}
```

Toute évolution de marque passe d’abord par ces variables, puis cette charte.
