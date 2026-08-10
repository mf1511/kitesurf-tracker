import { prisma } from "@/lib/prisma";

/** Types de plan d'eau proposés à la création d'un spot */
export const WATER_TYPES = [
  { id: "flat", label: "Flat" },
  { id: "chop", label: "Clapot" },
  { id: "vagues", label: "Vagues" },
  { id: "mixte", label: "Mixte" },
] as const;

export type WaterTypeId = (typeof WATER_TYPES)[number]["id"];

export function isWaterType(value: string): value is WaterTypeId {
  return WATER_TYPES.some((w) => w.id === value);
}

export function waterTypeLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return WATER_TYPES.find((w) => w.id === id)?.label ?? id;
}

/** Champs spot depuis JSON — retourne data ou error */
export function parseSpotFields(raw: Record<string, unknown>) {
  const name = String(raw.name ?? "").trim();
  if (!name) return { error: "Nom du spot requis" as const };

  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { error: "Latitude invalide (entre -90 et 90)" as const };
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { error: "Longitude invalide (entre -180 et 180)" as const };
  }

  const windOrientation =
    raw.windOrientation != null && String(raw.windOrientation).trim()
      ? String(raw.windOrientation).trim()
      : null;

  let waterType: string | null = null;
  if (raw.waterType != null && String(raw.waterType).trim()) {
    const w = String(raw.waterType).trim();
    if (!isWaterType(w)) return { error: "Type de plan d'eau invalide" as const };
    waterType = w;
  }

  return { data: { name, latitude, longitude, windOrientation, waterType } };
}

/** Spots de l'utilisateur, favoris d'abord */
export async function getUserSpots(userId: string) {
  return prisma.spot.findMany({
    where: { userId },
    orderBy: [{ favorite: "desc" }, { createdAt: "asc" }],
  });
}

/** Spot favori (widget météo dashboard) — null si aucun */
export async function getFavoriteSpot(userId: string) {
  return prisma.spot.findFirst({
    where: { userId, favorite: true },
  });
}
