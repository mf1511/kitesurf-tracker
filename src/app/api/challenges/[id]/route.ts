import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

/** Répondre à un défi (JSON : { action: "accept" | "decline" }) — adversaire uniquement */
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const challenge = await prisma.challenge.findFirst({
    where: { id: params.id, opponentId: session.user.id, status: "pending" },
  });
  if (!challenge) {
    return NextResponse.json({ error: "Défi introuvable" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const action = body?.action;
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const updated = await prisma.challenge.update({
    where: { id: challenge.id },
    data: { status: action === "accept" ? "accepted" : "declined" },
  });

  return NextResponse.json({ challenge: updated });
}

/** Supprimer / annuler un défi (créateur ou adversaire) */
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const challenge = await prisma.challenge.findFirst({
    where: {
      id: params.id,
      OR: [{ creatorId: session.user.id }, { opponentId: session.user.id }],
    },
  });
  if (!challenge) {
    return NextResponse.json({ error: "Défi introuvable" }, { status: 404 });
  }

  await prisma.challenge.delete({ where: { id: challenge.id } });
  return NextResponse.json({ ok: true });
}
