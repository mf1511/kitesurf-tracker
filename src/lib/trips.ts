import { prisma } from "@/lib/prisma";
import { xpForCategory } from "@/lib/gamification";
import { riderLabel } from "@/lib/community";
import { randomBytes } from "crypto";

export function generateTripCode(): string {
  return randomBytes(4).toString("hex");
}

/** Début du jour (UTC) / fin du jour pour inclure toute la dernière journée */
export function tripWindow(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

export function tripStatus(startDate: Date, endDate: Date, now = new Date()) {
  const { start, end } = tripWindow(startDate, endDate);
  if (now < start) return "upcoming" as const;
  if (now > end) return "past" as const;
  return "live" as const;
}

export type TripBoardRow = {
  userId: string;
  label: string;
  email: string;
  xp: number;
  tricks: number;
  challengeBonus: number;
  total: number;
  isMe: boolean;
};

export type TripFeedItem = {
  id: string;
  at: Date;
  userId: string;
  label: string;
  figureName: string;
  figureSlug: string;
  category: string;
  xp: number;
};

export async function computeTripStats(tripId: string, meId?: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      challenges: {
        include: { figure: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!trip) return null;

  const { start, end } = tripWindow(trip.startDate, trip.endDate);
  const memberIds = trip.members.map((m) => m.userId);

  const progress = await prisma.userProgress.findMany({
    where: {
      userId: { in: memberIds },
      completed: true,
      completedAt: { gte: start, lte: end },
    },
    include: {
      figure: { select: { id: true, name: true, slug: true, category: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  // XP + tricks par rider
  const byUser = new Map<
    string,
    { xp: number; tricks: number; figureIds: Set<string>; label: string; email: string }
  >();

  for (const m of trip.members) {
    byUser.set(m.userId, {
      xp: 0,
      tricks: 0,
      figureIds: new Set(),
      label: riderLabel(m.user),
      email: m.user.email,
    });
  }

  for (const p of progress) {
    const row = byUser.get(p.userId);
    if (!row) continue;
    row.xp += xpForCategory(p.figure.category);
    row.tricks += 1;
    row.figureIds.add(p.figureId);
  }

  // Bonus défis : figure liée validée pendant le séjour
  const challengeCompletions: Record<
    string,
    { challengeId: string; title: string; completers: { userId: string; label: string }[] }
  > = {};

  for (const ch of trip.challenges) {
    const completers: { userId: string; label: string }[] = [];
    if (ch.figureId) {
      for (const [userId, row] of byUser) {
        if (row.figureIds.has(ch.figureId)) {
          row.xp += ch.xpBonus; // bonus classement séjour
          completers.push({ userId, label: row.label });
        }
      }
    }
    challengeCompletions[ch.id] = {
      challengeId: ch.id,
      title: ch.title,
      completers,
    };
  }

  const leaderboard: TripBoardRow[] = [...byUser.entries()]
    .map(([userId, row]) => {
      const baseXp = progress
        .filter((p) => p.userId === userId)
        .reduce((s, p) => s + xpForCategory(p.figure.category), 0);
      const challengeBonus = row.xp - baseXp;
      return {
        userId,
        label: row.label,
        email: row.email,
        xp: baseXp,
        tricks: row.tricks,
        challengeBonus,
        total: row.xp,
        isMe: userId === meId,
      };
    })
    .sort((a, b) => b.total - a.total || b.tricks - a.tricks);

  const feed: TripFeedItem[] = progress.slice(0, 40).map((p) => ({
    id: p.id,
    at: p.completedAt!,
    userId: p.userId,
    label: riderLabel(p.user),
    figureName: p.figure.name,
    figureSlug: p.figure.slug,
    category: p.figure.category,
    xp: xpForCategory(p.figure.category),
  }));

  const totalXp = leaderboard.reduce((s, r) => s + r.total, 0);
  const totalTricks = leaderboard.reduce((s, r) => s + r.tricks, 0);
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    trip,
    status: tripStatus(trip.startDate, trip.endDate),
    leaderboard,
    feed,
    challengeCompletions,
    totals: {
      totalXp,
      totalTricks,
      days,
      xpPerDay: Math.round(totalXp / days),
      members: trip.members.length,
    },
  };
}

/** Classement des séjours les plus “skillants” (XP total du groupe) */
export async function rankSkillantTrips(limit = 12) {
  const trips = await prisma.trip.findMany({
    include: {
      members: { select: { userId: true } },
      _count: { select: { members: true, challenges: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const ranked = [];
  for (const trip of trips) {
    const { start, end } = tripWindow(trip.startDate, trip.endDate);
    const memberIds = trip.members.map((m) => m.userId);
    if (memberIds.length === 0) {
      ranked.push({
        id: trip.id,
        name: trip.name,
        location: trip.location,
        startDate: trip.startDate,
        endDate: trip.endDate,
        members: trip._count.members,
        challenges: trip._count.challenges,
        totalXp: 0,
        totalTricks: 0,
        xpPerDay: 0,
        status: tripStatus(trip.startDate, trip.endDate),
      });
      continue;
    }

    const progress = await prisma.userProgress.findMany({
      where: {
        userId: { in: memberIds },
        completed: true,
        completedAt: { gte: start, lte: end },
      },
      include: { figure: { select: { category: true, id: true } } },
    });

    let totalXp = progress.reduce((s, p) => s + xpForCategory(p.figure.category), 0);

    // bonus défis
    const challenges = await prisma.tripChallenge.findMany({
      where: { tripId: trip.id, figureId: { not: null } },
    });
    const doneByUser = new Map<string, Set<string>>();
    for (const p of progress) {
      if (!doneByUser.has(p.userId)) doneByUser.set(p.userId, new Set());
      doneByUser.get(p.userId)!.add(p.figureId);
    }
    for (const ch of challenges) {
      if (!ch.figureId) continue;
      for (const set of doneByUser.values()) {
        if (set.has(ch.figureId)) totalXp += ch.xpBonus;
      }
    }

    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    ranked.push({
      id: trip.id,
      name: trip.name,
      location: trip.location,
      startDate: trip.startDate,
      endDate: trip.endDate,
      members: trip._count.members,
      challenges: trip._count.challenges,
      totalXp,
      totalTricks: progress.length,
      xpPerDay: Math.round(totalXp / days),
      status: tripStatus(trip.startDate, trip.endDate),
    });
  }

  return ranked.sort((a, b) => b.totalXp - a.totalXp || b.xpPerDay - a.xpPerDay).slice(0, limit);
}
