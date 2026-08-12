/** Chemins internes sûrs pour le retour mobile (?from=) */

export function safeReturnPath(from: string | null | undefined): string | null {
  if (!from) return null;
  let decoded = from;
  try {
    decoded = decodeURIComponent(from);
  } catch {
    return null;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("://")) {
    return null;
  }
  // Pas de navigation hors app
  if (decoded.includes("\n") || decoded.includes("\r")) return null;
  return decoded;
}

/** Ajoute ?from= (ou &from=) à un href interne */
export function withReturnTo(href: string, from: string): string {
  const ret = safeReturnPath(from);
  if (!ret) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}from=${encodeURIComponent(ret)}`;
}

/** Lien fiche figure en préservant le retour */
export function figureHref(slug: string, from?: string | null): string {
  return withReturnTo(`/figures/${slug}`, from ?? "");
}

/** Libellé du bouton précédent selon la provenance */
export function returnLabel(path: string | null | undefined, fallback = "← Retour"): string {
  if (!path) return fallback;
  const p = path.split("?")[0] || path;
  if (p.startsWith("/figures/arbre")) return "← Arbre de progression";
  if (p === "/figures") return "← Toutes les figures";
  if (p === "/favoris") return "← Mes favoris";
  if (p.startsWith("/trips/")) return "← Séjour";
  if (p === "/trips") return "← Séjours";
  if (p.startsWith("/community/")) return "← Profil ami";
  if (p === "/community") return "← Amis";
  if (p === "/dashboard") return "← Accueil";
  if (p === "/stats") return "← Stats";
  if (p === "/sessions") return "← Sessions";
  if (p === "/offline") return "← Hors-ligne";
  return fallback;
}
