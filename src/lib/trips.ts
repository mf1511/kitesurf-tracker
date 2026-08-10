import { prisma } from "@/lib/prisma";
import { xpForCategory } from "@/lib/gamification";
import {
  riderAvatarHue,
  riderFirstName,
  riderInitials,
  riderLabel,
} from "@/lib/community";
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
  objectivesDone: number;
  objectivesTotal: number;
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

export type CrewRider = {
  userId: string;
  label: string;
  isMe: boolean;
  /** Photo profil (objectifs : affichée à la place du prénom) */
  image: string | null;
  initials: string;
  hue: number;
};

/** Avatar + prénom (acquis perso) */
export type CrewRiderChip = {
  userId: string;
  firstName: string;
  initials: string;
  hue: number;
  image: string | null;
  isMe: boolean;
};

export type TripFigureRow = {
  id: string;
  figureId: string;
  name: string;
  slug: string;
  category: string;
  /** false = pas encore publiée (visible, non cliquable) */
  active: boolean;
  /** Ordre pédagogique (arbre de progression) */
  order: number;
  addedById: string;
  addedByLabel: string;
  /** Riders qui l’ont en objectif perso */
  objectiveHolders: CrewRider[];
  /** Riders qui l’ont validée pendant les dates du séjour */
  completers: CrewRider[];
  /** Riders du trip qui l’ont déjà en acquis (espace perso) */
  knownBy: CrewRiderChip[];
  isMyObjective: boolean;
  /** Validée pendant les dates du séjour (moi) */
  iCompleted: boolean;
  /** Déjà en acquis perso (toutes dates) */
  alreadyDone: boolean;
};

export type MyObjectiveRow = {
  figureId: string;
  name: string;
  slug: string;
  category: string;
  active: boolean;
  done: boolean;
};

export async function computeTripStats(tripId: string, meId?: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      figures: {
        include: {
          figure: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              order: true,
              active: true,
            },
          },
          addedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      objectives: {
        include: {
          figure: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              order: true,
              active: true,
            },
          },
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });
  if (!trip) return null;

  const { start, end } = tripWindow(trip.startDate, trip.endDate);
  const memberIds = trip.members.map((m) => m.userId);

  const [progress, lifetimeProgress] = await Promise.all([
    prisma.userProgress.findMany({
      where: {
        userId: { in: memberIds },
        completed: true,
        completedAt: { gte: start, lte: end },
      },
      include: {
        figure: { select: { id: true, name: true, slug: true, category: true } },
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
    // Acquis perso (toutes dates) — pour afficher qui a déjà la figure
    prisma.userProgress.findMany({
      where: {
        userId: { in: memberIds },
        completed: true,
      },
      select: {
        userId: true,
        figureId: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
  ]);

  // figureId → riders du crew qui l’ont déjà cochée chez eux
  const knownByFigure = new Map<string, CrewRiderChip[]>();
  for (const p of lifetimeProgress) {
    const chip: CrewRiderChip = {
      userId: p.userId,
      firstName: riderFirstName(p.user),
      initials: riderInitials(p.user),
      hue: riderAvatarHue(p.userId),
      image: p.user.image,
      isMe: p.userId === meId,
    };
    const list = knownByFigure.get(p.figureId) ?? [];
    if (!list.some((c) => c.userId === chip.userId)) list.push(chip);
    knownByFigure.set(p.figureId, list);
  }

  // XP + tricks par rider + figures validées pendant le séjour
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

  const objectivesByUser = new Map<string, Set<string>>();
  for (const o of trip.objectives) {
    if (!objectivesByUser.has(o.userId)) objectivesByUser.set(o.userId, new Set());
    objectivesByUser.get(o.userId)!.add(o.figureId);
  }

  const leaderboard: TripBoardRow[] = [...byUser.entries()]
    .map(([userId, row]) => {
      const objSet = objectivesByUser.get(userId) ?? new Set();
      let objectivesDone = 0;
      for (const fid of objSet) {
        if (row.figureIds.has(fid)) objectivesDone += 1;
      }
      return {
        userId,
        label: row.label,
        email: row.email,
        xp: row.xp,
        tricks: row.tricks,
        objectivesDone,
        objectivesTotal: objSet.size,
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

  // Liste partagée + qui vise / qui a validé
  const tripFigures: TripFigureRow[] = trip.figures.map((tf) => {
    const holders = trip.objectives
      .filter((o) => o.figureId === tf.figureId)
      .map((o) => ({
        userId: o.userId,
        label: riderLabel(o.user),
        isMe: o.userId === meId,
        image: o.user.image,
        initials: riderInitials(o.user),
        hue: riderAvatarHue(o.userId),
      }));
    const completers: TripFigureRow["completers"] = [];
    for (const [userId, row] of byUser) {
      if (row.figureIds.has(tf.figureId)) {
        const member = trip.members.find((m) => m.userId === userId)?.user;
        completers.push({
          userId,
          label: row.label,
          isMe: userId === meId,
          image: member?.image ?? null,
          initials: member ? riderInitials(member) : "?",
          hue: riderAvatarHue(userId),
        });
      }
    }
    const known = knownByFigure.get(tf.figureId) ?? [];
    return {
      id: tf.id,
      figureId: tf.figureId,
      name: tf.figure.name,
      slug: tf.figure.slug,
      category: tf.figure.category,
      active: tf.figure.active,
      order: tf.figure.order,
      addedById: tf.addedById,
      addedByLabel: riderLabel(tf.addedBy),
      objectiveHolders: holders,
      completers,
      knownBy: known,
      isMyObjective: Boolean(meId && holders.some((h) => h.userId === meId)),
      iCompleted: Boolean(meId && byUser.get(meId)?.figureIds.has(tf.figureId)),
      alreadyDone: Boolean(meId && known.some((c) => c.isMe)),
    };
  });

  const myObjectives: MyObjectiveRow[] = meId
    ? trip.objectives
        .filter((o) => o.userId === meId)
        .map((o) => ({
          figureId: o.figureId,
          name: o.figure.name,
          slug: o.figure.slug,
          category: o.figure.category,
          active: o.figure.active,
          done: Boolean(byUser.get(meId)?.figureIds.has(o.figureId)),
        }))
    : [];

  // Map sérialisable pour la checklist créateur (toutes les figures)
  const crewKnownBy: Record<string, CrewRiderChip[]> = {};
  for (const [figureId, chips] of knownByFigure) {
    crewKnownBy[figureId] = chips;
  }

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
    tripFigures,
    myObjectives,
    crewKnownBy,
    totals: {
      totalXp,
      totalTricks,
      days,
      xpPerDay: Math.round(totalXp / days),
      members: trip.members.length,
      figures: trip.figures.length,
    },
  };
}

/** Classement des séjours les plus “skillants” (XP total du groupe) */
export async function rankSkillantTrips(limit = 12) {
  const trips = await prisma.trip.findMany({
    include: {
      members: { select: { userId: true } },
      _count: { select: { members: true, figures: true } },
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
        figures: trip._count.figures,
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

    const totalXp = progress.reduce((s, p) => s + xpForCategory(p.figure.category), 0);
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
      figures: trip._count.figures,
      totalXp,
      totalTricks: progress.length,
      xpPerDay: Math.round(totalXp / days),
      status: tripStatus(trip.startDate, trip.endDate),
    });
  }

  return ranked.sort((a, b) => b.totalXp - a.totalXp || b.xpPerDay - a.xpPerDay).slice(0, limit);
}
