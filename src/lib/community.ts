import { prisma } from "@/lib/prisma";
import { xpForCategory } from "@/lib/gamification";
import { randomBytes } from "crypto";

export type PublicRider = {
  id: string;
  name: string | null;
  email: string;
  label: string;
  image?: string | null;
};

export function riderLabel(user: { name?: string | null; email: string }): string {
  return user.name?.trim() || user.email.split("@")[0];
}

/** Prénom affiché (1er mot du name, sinon local-part email) */
export function riderFirstName(user: { name?: string | null; email: string }): string {
  return riderLabel(user).split(/\s+/)[0] || "?";
}

/** Initiales pour avatar (1–2 lettres) */
export function riderInitials(user: { name?: string | null; email: string }): string {
  const label = riderLabel(user);
  const parts = label.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return label.slice(0, 2).toUpperCase();
}

/** Couleur stable par userId (avatar) */
export function riderAvatarHue(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) % 360;
  return h;
}

/** Génère un code invite court lisible */
export function generateInviteCode(): string {
  return randomBytes(4).toString("hex"); // 8 chars
}

/** IDs des amis acceptés (dans les deux sens) */
export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

export async function ensureInviteForUser(userId: string) {
  const existing = await prisma.invite.findFirst({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  // Retry si collision de code (très rare)
  for (let i = 0; i < 5; i++) {
    const code = generateInviteCode();
    try {
      return await prisma.invite.create({
        data: { code, creatorId: userId },
      });
    } catch {
      /* unique collision — retry */
    }
  }
  throw new Error("Impossible de créer un code d'invitation");
}

/** Crée une amitié acceptée (ex: via invite) si elle n'existe pas déjà */
export async function ensureAcceptedFriendship(a: string, b: string) {
  if (a === b) return null;
  const [requesterId, addresseeId] = a < b ? [a, b] : [b, a];

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });

  if (existing) {
    if (existing.status !== "accepted") {
      return prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted" },
      });
    }
    return existing;
  }

  return prisma.friendship.create({
    data: { requesterId, addresseeId, status: "accepted" },
  });
}

export type FriendLeaderboardRow = {
  user: PublicRider;
  xp: number;
  done: number;
  isMe: boolean;
};

export async function buildFriendsLeaderboard(
  meId: string,
  friendIds: string[]
): Promise<FriendLeaderboardRow[]> {
  const ids = [meId, ...friendIds];
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      email: true,
      progress: {
        where: { completed: true },
        include: { figure: { select: { category: true } } },
      },
    },
  });

  return users
    .map((u) => {
      const done = u.progress.length;
      const xp = u.progress.reduce((sum, p) => sum + xpForCategory(p.figure.category), 0);
      return {
        user: { id: u.id, name: u.name, email: u.email, label: riderLabel(u) },
        xp,
        done,
        isMe: u.id === meId,
      };
    })
    .sort((a, b) => b.xp - a.xp || b.done - a.done);
}

export type FeedItem = {
  id: string;
  at: Date;
  rider: PublicRider;
  figureName: string;
  figureSlug: string;
  category: string;
  xp: number;
};

export async function buildFriendsFeed(
  meId: string,
  friendIds: string[],
  limit = 20
): Promise<FeedItem[]> {
  const ids = friendIds.length ? friendIds : [];
  // Inclure aussi mes propres validations pour un feed vivant
  const userIds = [...ids, meId];

  const rows = await prisma.userProgress.findMany({
    where: {
      userId: { in: userIds },
      completed: true,
      completedAt: { not: null },
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      figure: { select: { name: true, slug: true, category: true } },
    },
    orderBy: { completedAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    at: r.completedAt!,
    rider: {
      id: r.user.id,
      name: r.user.name,
      email: r.user.email,
      image: r.user.image,
      label: riderLabel(r.user),
    },
    figureName: r.figure.name,
    figureSlug: r.figure.slug,
    category: r.figure.category,
    xp: xpForCategory(r.figure.category),
  }));
}
