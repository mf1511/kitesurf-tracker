import { prisma } from "@/lib/prisma";
import { isWaterType, normalizeSpotName } from "@/lib/spot-names";

export {
  WATER_TYPES,
  isWaterType,
  waterTypeLabel,
  normalizeSpotName,
  spotNameSimilarity,
  suggestSpotNames,
  type WaterTypeId,
  type SpotSuggestion,
} from "@/lib/spot-names";

/** Champs spot depuis JSON — lat/lng optionnels */
export function parseSpotFields(raw: Record<string, unknown>) {
  const name = String(raw.name ?? "").trim();
  if (!name) return { error: "Nom du spot requis" as const };
  if (name.length > 80) return { error: "Nom trop long" as const };

  let latitude: number | null = null;
  let longitude: number | null = null;
  if (raw.latitude != null && String(raw.latitude).trim() !== "") {
    latitude = Number(raw.latitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return { error: "Latitude invalide (entre -90 et 90)" as const };
    }
  }
  if (raw.longitude != null && String(raw.longitude).trim() !== "") {
    longitude = Number(raw.longitude);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return { error: "Longitude invalide (entre -180 et 180)" as const };
    }
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

/** Spots user : favori puis plus utilisés (sessions) */
export async function getUserSpots(userId: string) {
  return prisma.spot.findMany({
    where: { userId },
    include: { _count: { select: { sessions: true } } },
    orderBy: [
      { favorite: "desc" },
      { sessions: { _count: "desc" } },
      { createdAt: "asc" },
    ],
  });
}

/** Spot favori (widget météo) — null si aucun */
export async function getFavoriteSpot(userId: string) {
  return prisma.spot.findFirst({
    where: { userId, favorite: true },
  });
}

export type PopularSpot = {
  name: string;
  favoriteCount: number;
  sessionCount: number;
  waterType: string | null;
  windOrientation: string | null;
  latitude: number | null;
  longitude: number | null;
};

/** Top spots les plus mis en favori (agrégés par nom normalisé) */
export async function getPopularSpots(limit = 3): Promise<PopularSpot[]> {
  const rows = await prisma.spot.findMany({
    select: {
      name: true,
      favorite: true,
      waterType: true,
      windOrientation: true,
      latitude: true,
      longitude: true,
      _count: { select: { sessions: true } },
    },
  });

  type Agg = PopularSpot & { key: string };
  const map = new Map<string, Agg>();

  for (const r of rows) {
    const key = normalizeSpotName(r.name);
    if (!key) continue;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        key,
        name: r.name,
        favoriteCount: r.favorite ? 1 : 0,
        sessionCount: r._count.sessions,
        waterType: r.waterType,
        windOrientation: r.windOrientation,
        latitude: r.latitude,
        longitude: r.longitude,
      });
      continue;
    }
    prev.favoriteCount += r.favorite ? 1 : 0;
    prev.sessionCount += r._count.sessions;
    if (prev.latitude == null && r.latitude != null) {
      prev.latitude = r.latitude;
      prev.longitude = r.longitude;
      prev.name = r.name;
    }
    if (!prev.waterType && r.waterType) prev.waterType = r.waterType;
    if (!prev.windOrientation && r.windOrientation) {
      prev.windOrientation = r.windOrientation;
    }
  }

  return [...map.values()]
    .sort(
      (a, b) =>
        b.favoriteCount - a.favoriteCount ||
        b.sessionCount - a.sessionCount ||
        a.name.localeCompare(b.name, "fr")
    )
    .slice(0, limit)
    .map(({ key: _k, ...rest }) => rest);
}

/** Tous les noms de spots connus (suggestions à la création) */
export async function getKnownSpotNames(): Promise<string[]> {
  const rows = await prisma.spot.findMany({
    select: { name: true },
    distinct: ["name"],
    orderBy: { name: "asc" },
  });
  return rows.map((r) => r.name);
}

/** Trouve le spot du user avec le même nom normalisé */
export async function findUserSpotByName(userId: string, name: string) {
  const key = normalizeSpotName(name);
  if (!key) return null;
  const spots = await prisma.spot.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      favorite: true,
      waterType: true,
      windOrientation: true,
      latitude: true,
      longitude: true,
    },
  });
  return spots.find((s) => normalizeSpotName(s.name) === key) ?? null;
}

/** Définit le favori exclusif d’un user */
export async function setFavoriteSpot(userId: string, spotId: string) {
  const [, spot] = await prisma.$transaction([
    prisma.spot.updateMany({
      where: { userId, favorite: true },
      data: { favorite: false },
    }),
    prisma.spot.update({
      where: { id: spotId },
      data: { favorite: true },
    }),
  ]);
  return spot;
}
