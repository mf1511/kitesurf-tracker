import { prisma } from "@/lib/prisma";
import { riderLabel } from "@/lib/community";

/**
 * Défis entre amis : « premier à valider la figure avant la deadline ».
 * Le gagnant n'est pas stocké — il est dérivé de UserProgress.completedAt
 * (validation entre la création du défi et la deadline).
 */

export type ChallengeState =
  | "pending" // en attente d'acceptation par l'adversaire
  | "declined"
  | "live" // accepté, personne n'a encore validé, deadline pas passée
  | "won"
  | "expired"; // deadline passée sans vainqueur (ou invite non répondue)

export type ChallengeView = {
  id: string;
  figure: { id: string; slug: string; name: string };
  creator: { id: string; label: string };
  opponent: { id: string; label: string };
  deadline: string; // ISO
  createdAt: string; // ISO
  state: ChallengeState;
  winner: { id: string; label: string; at: string } | null;
  /** Vrai si l'utilisateur courant est l'adversaire d'un défi pending */
  awaitingMe: boolean;
};

/** Défis de l'utilisateur (créés ou reçus), état dérivé inclus */
export async function getChallengesForUser(userId: string): Promise<ChallengeView[]> {
  const challenges = await prisma.challenge.findMany({
    where: { OR: [{ creatorId: userId }, { opponentId: userId }] },
    include: {
      figure: { select: { id: true, slug: true, name: true } },
      creator: { select: { id: true, name: true, email: true } },
      opponent: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!challenges.length) return [];

  // Progrès pertinents en une requête (toutes paires user × figure des défis)
  const figureIds = Array.from(new Set(challenges.map((c) => c.figureId)));
  const userIds = Array.from(
    new Set(challenges.flatMap((c) => [c.creatorId, c.opponentId]))
  );
  const progress = await prisma.userProgress.findMany({
    where: {
      figureId: { in: figureIds },
      userId: { in: userIds },
      completed: true,
      completedAt: { not: null },
    },
    select: { userId: true, figureId: true, completedAt: true },
  });
  const doneAt = new Map(
    progress.map((p) => [`${p.userId}:${p.figureId}`, p.completedAt as Date])
  );

  const now = new Date();

  return challenges.map((c) => {
    const creator = { id: c.creator.id, label: riderLabel(c.creator) };
    const opponent = { id: c.opponent.id, label: riderLabel(c.opponent) };

    // Validation comptée seulement entre création et deadline
    const validAt = (uid: string): Date | null => {
      const at = doneAt.get(`${uid}:${c.figureId}`);
      return at && at >= c.createdAt && at <= c.deadline ? at : null;
    };

    let state: ChallengeState;
    let winner: ChallengeView["winner"] = null;

    if (c.status === "declined") {
      state = "declined";
    } else if (c.status === "pending") {
      state = now > c.deadline ? "expired" : "pending";
    } else {
      const creatorAt = validAt(c.creatorId);
      const opponentAt = validAt(c.opponentId);
      const best = [
        creatorAt && { ...creator, at: creatorAt },
        opponentAt && { ...opponent, at: opponentAt },
      ]
        .filter(Boolean)
        .sort((a, b) => (a as { at: Date }).at.getTime() - (b as { at: Date }).at.getTime())[0] as
        | { id: string; label: string; at: Date }
        | undefined;

      if (best) {
        state = "won";
        winner = { id: best.id, label: best.label, at: best.at.toISOString() };
      } else {
        state = now > c.deadline ? "expired" : "live";
      }
    }

    return {
      id: c.id,
      figure: c.figure,
      creator,
      opponent,
      deadline: c.deadline.toISOString(),
      createdAt: c.createdAt.toISOString(),
      state,
      winner,
      awaitingMe: c.status === "pending" && c.opponentId === userId && now <= c.deadline,
    };
  });
}
