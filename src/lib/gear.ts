/** Catégories matériel kite + helpers d’affichage / parsing */

export const GEAR_CATEGORIES = [
  { id: "aile", label: "Aile" },
  { id: "barre", label: "Barre" },
  { id: "harnais", label: "Harnais" },
  { id: "planche", label: "Planche" },
  { id: "straps", label: "Straps" },
  { id: "pads", label: "Pads" },
  { id: "foil", label: "Foil" },
  { id: "casque", label: "Casque" },
  { id: "combinaison", label: "Combinaison" },
  { id: "leash", label: "Leash" },
  { id: "pompe", label: "Pompe" },
  { id: "ailerons", label: "Ailerons" },
  { id: "wing", label: "Wing" },
  { id: "accessoire", label: "Accessoire" },
  { id: "autre", label: "Autre" },
] as const;

export type GearCategoryId = (typeof GEAR_CATEGORIES)[number]["id"];

/** Facture max ~4 Mo (limite body serverless) */
export const MAX_INVOICE_BYTES = 4 * 1024 * 1024;

const ALLOWED_INVOICE_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function isGearCategory(value: string): value is GearCategoryId {
  return GEAR_CATEGORIES.some((c) => c.id === value);
}

export function gearCategoryLabel(id: string): string {
  return GEAR_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Titre d’affichage : surnom ou marque + modèle */
export function gearDisplayName(g: {
  name?: string | null;
  brand?: string | null;
  model: string;
}): string {
  if (g.name?.trim()) return g.name.trim();
  const brand = g.brand?.trim();
  return brand ? `${brand} ${g.model}` : g.model;
}

export function isAllowedInvoiceMime(mime: string): boolean {
  return ALLOWED_INVOICE_MIME.has(mime);
}

/** Champs texte / nombres depuis FormData ou JSON */
export function parseGearFields(raw: Record<string, FormDataEntryValue | string | number | null | undefined>) {
  const category = String(raw.category ?? "").trim();
  const model = String(raw.model ?? "").trim();
  const brand = raw.brand != null && String(raw.brand).trim() ? String(raw.brand).trim() : null;
  const name = raw.name != null && String(raw.name).trim() ? String(raw.name).trim() : null;
  const size = raw.size != null && String(raw.size).trim() ? String(raw.size).trim() : null;
  const notes = raw.notes != null && String(raw.notes).trim() ? String(raw.notes).trim() : null;

  let year: number | null = null;
  if (raw.year != null && String(raw.year).trim() !== "") {
    const y = Number(raw.year);
    if (!Number.isInteger(y) || y < 1980 || y > 2100) {
      return { error: "Année invalide" as const };
    }
    year = y;
  }

  let purchaseDate: Date | null = null;
  if (raw.purchaseDate != null && String(raw.purchaseDate).trim() !== "") {
    const d = new Date(String(raw.purchaseDate));
    if (Number.isNaN(d.getTime())) {
      return { error: "Date d'achat invalide" as const };
    }
    purchaseDate = d;
  }

  let purchasePrice: number | null = null;
  if (raw.purchasePrice != null && String(raw.purchasePrice).trim() !== "") {
    const p = Number(raw.purchasePrice);
    if (!Number.isFinite(p) || p < 0) {
      return { error: "Prix d'achat invalide" as const };
    }
    purchasePrice = p;
  }

  let sessionCount: number | undefined;
  if (raw.sessionCount != null && String(raw.sessionCount).trim() !== "") {
    const s = Number(raw.sessionCount);
    if (!Number.isInteger(s) || s < 0) {
      return { error: "Nombre de sorties invalide" as const };
    }
    sessionCount = s;
  }

  if (!isGearCategory(category)) {
    return { error: "Catégorie invalide" as const };
  }
  if (!model) {
    return { error: "Modèle requis" as const };
  }

  return {
    data: {
      category,
      brand,
      model,
      name,
      size,
      year,
      purchaseDate,
      purchasePrice,
      notes,
      ...(sessionCount !== undefined ? { sessionCount } : {}),
    },
  };
}

/** Sérialise un Gear sans le blob facture */
export function serializeGear<T extends { invoiceName?: string | null; invoiceData?: Buffer | Uint8Array | null }>(
  gear: T
) {
  const { invoiceData: _omit, ...rest } = gear;
  return {
    ...rest,
    hasInvoice: Boolean(gear.invoiceName),
  };
}
