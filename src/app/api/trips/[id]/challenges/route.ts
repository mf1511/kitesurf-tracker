import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const figureId = body.figureId ? String(body.figureId) : null;
  let title = body.title ? String(body.title).trim() : "";
  const description = body.description ? String(body.description).trim() : null;
  const xpBonus = Number.isFinite(body.xpBonus) ? Math.max(0, Math.min(200, Number(body.xpBonus))) : 25;

  if (figureId) {
    const figure = await prisma.figure.findUnique({ where: { id: figureId } });
    if (!figure) {
      return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
    }
    if (!title) title = `Défi : ${figure.name}`;
  }

  if (!title) {
    return NextResponse.json({ error: "Titre ou figure requis" }, { status: 400 });
  }

  const challenge = await prisma.tripChallenge.create({
    data: {
      tripId: params.id,
      figureId,
      title,
      description,
      createdById: session.user.id,
      xpBonus,
    },
  });

  return NextResponse.json({ challenge });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { challengeId } = await req.json();
  const challenge = await prisma.tripChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.tripId !== params.id) {
    return NextResponse.json({ error: "Défi introuvable" }, { status: 404 });
  }

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId: session.user.id } },
  });
  if (!member || (member.role !== "owner" && challenge.createdById !== session.user.id)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  await prisma.tripChallenge.delete({ where: { id: challengeId } });
  return NextResponse.json({ ok: true });
}
