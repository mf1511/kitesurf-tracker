# Cloudflare R2 — vidéos figures

Objectif : stocker les ~10 Go de tutos sur **R2 free** (10 Go, egress 0 €) et garder **Supabase free** pour la DB (+ avatars légers).

> Tu es à **~9,7 Go** de vidéos → pile sous le plafond free. Au-delà : **$0,015 / Go-mois**.

## 1. Créer le bucket

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**
2. Accepter le free tier R2 si demandé
3. **Create bucket** → nom ex. `kitequest-videos` (Standard storage)
4. Location : `Automatic` ou EU si proposé

## 2. Accès public

Deux options :

### A. URL de dev `r2.dev` (rapide, rate-limited)

Bucket → **Settings** → **Public Development URL** → Enable  
→ tu obtiens `https://pub-xxxxx.r2.dev`

### B. Domaine custom (prod recommandé)

Ex. `videos.ton-domaine.com` (zone Cloudflare du même compte)  
Bucket → **Settings** → **Custom Domains** → Add

`NEXT_PUBLIC_R2_PUBLIC_BASE_URL` = cette URL **sans** slash final  
ex. `https://pub-xxxxx.r2.dev` ou `https://videos.kitequest.app`

## 3. API token S3

R2 Overview → **Manage R2 API Tokens** → Create  
- Permission : **Object Read & Write**
- Scope : **ce bucket uniquement**
- Copier : **Access Key ID**, **Secret Access Key**, **Account ID**

Endpoint S3 : `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

## 4. CORS (upload navigateur admin)

Bucket → **Settings** → **CORS policy** :

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://TON_DOMAINE_PROD"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 5. Variables `.env` / Vercel

```bash
R2_ACCOUNT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="kitequest-videos"
NEXT_PUBLIC_R2_PUBLIC_BASE_URL="https://pub-xxxxx.r2.dev"
```

Dès que ces 5 vars sont présentes, l’app utilise **R2** pour les nouvelles vidéos (sinon fallback Supabase Storage).

Sur Vercel : mêmes vars (Production + Preview).  
`NEXT_PUBLIC_R2_PUBLIC_BASE_URL` doit être dispo **côté client** si besoin d’afficher des URLs construites — en pratique les URLs sont en DB.

## 6. Migrer les fichiers existants

```bash
# aperçu
npx tsx scripts/migrate-videos-to-r2.ts

# test 5 fichiers
npx tsx scripts/migrate-videos-to-r2.ts --apply --limit=5

# tout migrer (reprise OK si interrompu)
npx tsx scripts/migrate-videos-to-r2.ts --apply

# après vérif lecture OK → libérer Supabase Storage
npx tsx scripts/migrate-videos-to-r2.ts --apply --delete-supabase
```

Puis dans Supabase → Storage → bucket `figure-videos` : tu peux vider / supprimer une fois confiant (DB + R2 OK). Les **avatars** restent sur Supabase.

## 7. Checklist

- [ ] Bucket + public URL
- [ ] Token S3 + `.env`
- [ ] CORS localhost + prod
- [ ] `migrate --limit=5` puis lecture d’une figure
- [ ] `migrate --apply` complet
- [ ] Vars Vercel
- [ ] `--delete-supabase` + empty bucket Supabase
- [ ] Confirmer usage R2 < 10 Go dans le dashboard
