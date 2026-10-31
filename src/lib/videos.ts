/** Nom logique legacy bucket Supabase (imports / docs) */
export const FIGURE_VIDEOS_BUCKET = "figure-videos";

/** Taille max Storage (100 Mo) */
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** Au-dessus, l’admin recompresse tout seul (sous la limite Storage 100 Mo) */
export const VIDEO_COMPRESS_TARGET_BYTES = 80 * 1024 * 1024;

/** MIME autorisés */
export const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function extensionForMime(mime: string): string {
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  return "mp4";
}

/** True si l’URL publique R2 est configurée (sans importer le SDK AWS) */
export function isR2PublicConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim());
}

/** URL publique d’un objet vidéo (R2 si base publique set, sinon Supabase Storage) */
export function publicVideoUrl(storagePath: string): string {
  const r2 = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (r2) return `${r2}/${storagePath}`;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquant");
  return `${base}/storage/v1/object/public/${FIGURE_VIDEOS_BUCKET}/${storagePath}`;
}

/** Affiche o / Ko / Mo / Go */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
