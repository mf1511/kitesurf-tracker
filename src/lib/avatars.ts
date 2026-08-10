/** Bucket public photos de profil */
export const AVATARS_BUCKET = "avatars";

/** Max 2 Mo */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isAllowedAvatarMime(mime: string): boolean {
  return ALLOWED.has(mime);
}

export function avatarExt(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** URL publique d’un objet avatars */
export function publicAvatarUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquant");
  return `${base}/storage/v1/object/public/${AVATARS_BUCKET}/${storagePath}`;
}
