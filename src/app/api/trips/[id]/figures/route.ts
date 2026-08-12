import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Ajoute une figure à la liste partagée du séjour */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId } },
  });
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  // Accepte une ou plusieurs figures
  const ids: string[] = Array.isArray(body.figureIds)
    ? body.figureIds.map(String)
    : body.figureId
      ? [String(body.figureId)]
      : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "Figure requise" }, { status: 400 });
  }

  const figures = await prisma.figure.findMany({
    where: { id: { in: ids }, active: true },
    select: { id: true, _count: { select: { videos: true } } },
  });
  if (figures.length === 0) {
    return NextResponse.json({ error: "Figure introuvable ou inactive" }, { status: 404 });
  }
  // Séjour : uniquement des figures avec au moins une vidéo
  const withVideo = figures.filter((f) => f._count.videos > 0);
  if (withVideo.length === 0) {
    return NextResponse.json(
      { error: "Figure sans vidéo — impossible de l’ajouter au séjour" },
      { status: 400 }
    );
  }

  // Ignore celles déjà présentes (createMany skipDuplicates)
  const result = await prisma.tripFigure.createMany({
    data: withVideo.map((f) => ({
      tripId: params.id,
      figureId: f.id,
      addedById: userId,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ added: result.count });
}

/** Retire une figure de la liste (+ objectifs liés) */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { figureId } = await req.json();
  const tripFigure = await prisma.tripFigure.findUnique({
    where: {
      tripId_figureId: { tripId: params.id, figureId: String(figureId) },
    },
  });
  if (!tripFigure) {
    return NextResponse.json({ error: "Figure absente de la liste" }, { status: 404 });
  }

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId: session.user.id } },
  });
  if (
    !member ||
    (member.role !== "owner" && tripFigure.addedById !== session.user.id)
  ) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  // Nettoie les objectifs perso sur cette figure pour le séjour
  await prisma.tripMemberObjective.deleteMany({
    where: { tripId: params.id, figureId: tripFigure.figureId },
  });
  await prisma.tripFigure.delete({ where: { id: tripFigure.id } });

  return NextResponse.json({ ok: true });
}
