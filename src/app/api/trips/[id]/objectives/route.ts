import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Ajoute une figure de la liste comme objectif perso */
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

  const { figureId } = await req.json();
  if (!figureId) {
    return NextResponse.json({ error: "Figure requise" }, { status: 400 });
  }

  // L’objectif doit venir de la liste partagée du séjour
  const onList = await prisma.tripFigure.findUnique({
    where: {
      tripId_figureId: { tripId: params.id, figureId: String(figureId) },
    },
  });
  if (!onList) {
    return NextResponse.json(
      { error: "Ajoute d’abord la figure à la liste du séjour" },
      { status: 400 }
    );
  }

  try {
    const objective = await prisma.tripMemberObjective.create({
      data: {
        tripId: params.id,
        userId: session.user.id,
        figureId: String(figureId),
      },
    });
    return NextResponse.json({ objective });
  } catch {
    return NextResponse.json({ error: "Déjà en objectif" }, { status: 409 });
  }
}

/** Retire un objectif perso */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { figureId } = await req.json();
  const existing = await prisma.tripMemberObjective.findUnique({
    where: {
      tripId_userId_figureId: {
        tripId: params.id,
        userId: session.user.id,
        figureId: String(figureId),
      },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Objectif introuvable" }, { status: 404 });
  }

  await prisma.tripMemberObjective.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
