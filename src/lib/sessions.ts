import { prisma } from "@/lib/prisma";

/** Champs session depuis JSON — retourne data (sans gearIds) + gearIds ou error */
export function parseSessionFields(raw: Record<string, unknown>) {
  const date = new Date(String(raw.date ?? ""));
  if (Number.isNaN(date.getTime())) return { error: "Date de session invalide" as const };

  let durationMin: number | null = null;
  if (raw.durationMin != null && String(raw.durationMin).trim() !== "") {
    const d = Number(raw.durationMin);
    if (!Number.isInteger(d) || d <= 0 || d > 24 * 60) {
      return { error: "Durée invalide (minutes)" as const };
    }
    durationMin = d;
  }

  let windKnots: number | null = null;
  if (raw.windKnots != null && String(raw.windKnots).trim() !== "") {
    const w = Number(raw.windKnots);
    if (!Number.isFinite(w) || w < 0 || w > 100) {
      return { error: "Vent invalide (nœuds)" as const };
    }
    windKnots = w;
  }

  const notes =
    raw.notes != null && String(raw.notes).trim() ? String(raw.notes).trim() : null;

  const spotId =
    raw.spotId != null && String(raw.spotId).trim() ? String(raw.spotId).trim() : null;

  // IDs de matériel utilisé (vérifiés côté API contre le matos du user)
  const gearIds = Array.isArray(raw.gearIds)
    ? raw.gearIds.map((g) => String(g)).filter(Boolean)
    : [];

  return { data: { date, durationMin, windKnots, notes, spotId }, gearIds };
}

/** Sessions du user, plus récentes d'abord, avec spot + matériel */
export async function getUserSessions(userId: string, limit?: number) {
  return prisma.kiteSession.findMany({
    where: { userId },
    include: {
      spot: { select: { id: true, name: true } },
      gearUsed: {
        include: {
          gear: { select: { id: true, category: true, brand: true, model: true, name: true, size: true } },
        },
      },
    },
    orderBy: { date: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export type UserSession = Awaited<ReturnType<typeof getUserSessions>>[number];

/** Stats globales du journal (total sessions, heures, vent moyen) */
export async function getSessionStats(userId: string) {
  const agg = await prisma.kiteSession.aggregate({
    where: { userId },
    _count: { id: true },
    _sum: { durationMin: true },
    _avg: { windKnots: true },
  });
  return {
    count: agg._count.id,
    totalMin: agg._sum.durationMin ?? 0,
    avgWind: agg._avg.windKnots,
  };
}

/** Recalcule Gear.sessionCount depuis les sessions liées (source de vérité) */
export async function syncGearSessionCounts(gearIds: string[]) {
  if (!gearIds.length) return;
  const counts = await prisma.sessionGear.groupBy({
    by: ["gearId"],
    where: { gearId: { in: gearIds } },
    _count: { gearId: true },
  });
  const byId = new Map(counts.map((c) => [c.gearId, c._count.gearId]));
  await Promise.all(
    gearIds.map((id) =>
      prisma.gear.update({
        where: { id },
        data: { sessionCount: byId.get(id) ?? 0 },
      })
    )
  );
}

/** "2h30" / "45min" depuis des minutes */
export function formatDuration(min: number | null | undefined): string | null {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}min`;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
