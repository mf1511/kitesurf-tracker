import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFriendIds } from "@/lib/community";

/** Lancer un défi (JSON : opponentId, figureId, deadline YYYY-MM-DD) */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const opponentId = String(body?.opponentId ?? "");
  const figureId = String(body?.figureId ?? "");
  const deadlineRaw = String(body?.deadline ?? "");

  if (!opponentId || opponentId === userId) {
    return NextResponse.json({ error: "Adversaire invalide" }, { status: 400 });
  }

  // Seulement entre amis acceptés
  const friendIds = await getFriendIds(userId);
  if (!friendIds.includes(opponentId)) {
    return NextResponse.json(
      { error: "Tu ne peux défier que tes amis" },
      { status: 400 }
    );
  }

  const figure = await prisma.figure.findFirst({
    where: { id: figureId, active: true },
    select: { id: true },
  });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 400 });
  }

  // Deadline : fin de journée, entre demain et 1 an
  const deadline = new Date(`${deadlineRaw}T23:59:59`);
  const now = new Date();
  const oneYear = new Date(now.getTime() + 366 * 24 * 3600 * 1000);
  if (Number.isNaN(deadline.getTime()) || deadline <= now || deadline > oneYear) {
    return NextResponse.json(
      { error: "Deadline invalide (entre demain et 1 an)" },
      { status: 400 }
    );
  }

  // Pas de doublon actif sur la même figure avec le même pote
  const existing = await prisma.challenge.findFirst({
    where: {
      figureId,
      status: { in: ["pending", "accepted"] },
      deadline: { gte: now },
      OR: [
        { creatorId: userId, opponentId },
        { creatorId: opponentId, opponentId: userId },
      ],
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Un défi est déjà en cours sur cette figure avec ce rider" },
      { status: 400 }
    );
  }

  const challenge = await prisma.challenge.create({
    data: { creatorId: userId, opponentId, figureId, deadline },
  });

  return NextResponse.json({ challenge });
}
