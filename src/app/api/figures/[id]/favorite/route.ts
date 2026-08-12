import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

/** Toggle favori figure pour le rider connecté */
export async function POST(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const figure = await prisma.figure.findUnique({
    where: { id: params.id },
    select: { id: true, active: true },
  });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }
  if (!figure.active && session.user.role !== "admin") {
    return NextResponse.json({ error: "Figure indisponible" }, { status: 403 });
  }

  const existing = await prisma.figureFavorite.findUnique({
    where: { userId_figureId: { userId, figureId: figure.id } },
  });

  if (existing) {
    await prisma.figureFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorite: false });
  }

  await prisma.figureFavorite.create({
    data: { userId, figureId: figure.id },
  });
  return NextResponse.json({ favorite: true });
}
