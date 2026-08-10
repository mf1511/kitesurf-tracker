/** Pseudo public pour retrouver ses amis (stocké en minuscules) */

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@+/, "");
}

/** Retourne un message d’erreur, ou null si OK */
export function usernameError(raw: string): string | null {
  const u = normalizeUsername(raw);
  if (!u) return "Pseudo requis";
  if (u.length < 3) return "Pseudo trop court (3 car. min)";
  if (u.length > 20) return "Pseudo trop long (20 car. max)";
  if (!USERNAME_RE.test(u)) {
    return "Lettres, chiffres et _ uniquement (sans espace)";
  }
  return null;
}

export function looksLikeEmail(raw: string): boolean {
  return raw.includes("@") && !raw.trim().startsWith("@");
}
