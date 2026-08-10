import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Validation en masse (onboarding) : marque une liste de figures comme acquises */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const ids: unknown = body?.figureIds;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  // On ne garde que des figures actives réelles
  const figures = await prisma.figure.findMany({
    where: { id: { in: ids as string[] }, active: true },
    select: { id: true },
  });

  const now = new Date();
  await prisma.$transaction(
    figures.map((f) =>
      prisma.userProgress.upsert({
        where: { userId_figureId: { userId, figureId: f.id } },
        update: { completed: true, completedAt: now },
        create: { userId, figureId: f.id, completed: true, completedAt: now },
      })
    )
  );

  return NextResponse.json({ count: figures.length });
}
