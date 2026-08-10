import { prisma } from "@/lib/prisma";
import { getFriendIds, riderLabel } from "@/lib/community";
import {
  computeGameStats,
  sortCategories,
  xpForCategory,
} from "@/lib/gamification";
import { getUserSessions, getSessionStats } from "@/lib/sessions";

/** Amis acceptés uniquement (pas soi-même) */
export async function isAcceptedFriend(meId: string, otherId: string) {
  if (meId === otherId) return false;
  const ids = await getFriendIds(meId);
  return ids.includes(otherId);
}

/** Profil ami visible : progression, figures, sessions, objectifs séjour */
export async function getFriendProfile(meId: string, friendId: string) {
  if (!(await isAcceptedFriend(meId, friendId))) return null;

  const now = new Date();
  const [user, figures, sessions, sessionStats, objectives, recentProgress] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: friendId },
        select: { id: true, name: true, email: true, image: true },
      }),
      prisma.figure.findMany({
        where: { active: true },
        include: {
          prerequisites: { select: { id: true } },
          progress: { where: { userId: friendId, completed: true } },
        },
        orderBy: [{ category: "asc" }, { order: "asc" }],
      }),
      getUserSessions(friendId, 8),
      getSessionStats(friendId),
      prisma.tripMemberObjective.findMany({
        where: {
          userId: friendId,
          trip: { endDate: { gte: now } },
        },
        include: {
          figure: {
            select: { id: true, slug: true, name: true, category: true },
          },
          trip: {
            select: { id: true, name: true, startDate: true, endDate: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.userProgress.findMany({
        where: {
          userId: friendId,
          completed: true,
          completedAt: { not: null },
        },
        include: {
          figure: {
            select: { name: true, slug: true, category: true },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 12,
      }),
    ]);

  if (!user) return null;

  const stats = computeGameStats(figures);
  const doneIds = new Set(
    figures.filter((f) => f.progress.length > 0).map((f) => f.id)
  );

  const categories = sortCategories(
    Array.from(new Set(figures.map((f) => f.category)))
  );
  const byCategory = categories.map((cat) => {
    const inCat = figures.filter((f) => f.category === cat);
    const done = inCat.filter((f) => doneIds.has(f.id)).length;
    return {
      category: cat,
      done,
      total: inCat.length,
      pct: inCat.length ? Math.round((done / inCat.length) * 100) : 0,
    };
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      label: riderLabel(user),
    },
    stats,
    byCategory,
    recentProgress: recentProgress.map((p) => ({
      id: p.id,
      at: p.completedAt!,
      name: p.figure.name,
      slug: p.figure.slug,
      category: p.figure.category,
      xp: xpForCategory(p.figure.category),
    })),
    objectives: objectives.map((o) => ({
      id: o.id,
      figureSlug: o.figure.slug,
      figureName: o.figure.name,
      category: o.figure.category,
      tripId: o.trip.id,
      tripName: o.trip.name,
      done: doneIds.has(o.figure.id),
    })),
    sessions,
    sessionStats,
  };
}

/** Stats légères pour les cartes de la liste amis */
export async function getFriendsTeasers(friendIds: string[]) {
  if (!friendIds.length) return new Map<string, { xp: number; done: number }>();

  const progress = await prisma.userProgress.findMany({
    where: { userId: { in: friendIds }, completed: true },
    select: {
      userId: true,
      figure: { select: { category: true } },
    },
  });

  const map = new Map<string, { xp: number; done: number }>();
  for (const id of friendIds) map.set(id, { xp: 0, done: 0 });
  for (const p of progress) {
    const row = map.get(p.userId);
    if (!row) continue;
    row.done += 1;
    row.xp += xpForCategory(p.figure.category);
  }
  return map;
}
