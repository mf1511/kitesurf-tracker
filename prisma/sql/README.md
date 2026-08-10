# Migrations SQL Supabase

Exécute les fichiers **dans l’ordre numérique** (SQL Editor), sauf si tu
pars de zéro : dans ce cas utilise uniquement `supabase-full.sql`.

| # | Fichier | Contenu |
|---|---------|---------|
| 001 | `001-community.sql` | Invites + amitiés |
| 002 | `002-trips.sql` | Séjours (+ ancien défis) |
| 003 | `003-trip-objectives.sql` | Figures séjour + objectifs perso |
| 004 | `004-figure-active.sql` | `Figure.active` |
| 005 | `005-figure-videos-storage.sql` | Colonnes Video Storage |
| 006 | `006-figure-videos-storage-policies.sql` | Policies bucket `figure-videos` |
| 007 | `007-gear.sql` | Matériel (`Gear`) |
| 008 | `008-sessions-spots.sql` | Journal de sessions (`KiteSession`, `SessionGear`), spots météo (`Spot`), `User.weightKg` |
| 009 | `009-notes-challenges.sql` | Carnet de progression (`FigureNote`) + défis entre amis (`Challenge`) |

Avant **006** : crée le bucket Storage public `figure-videos` dans le dashboard.

Prochaine migration : `010-….sql`.
