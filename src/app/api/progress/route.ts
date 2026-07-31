import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { figureId, completed } = await req.json();
  if (!figureId || typeof completed !== "boolean") {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const userId = session.user.id;

  const progress = await prisma.userProgress.upsert({
    where: { userId_figureId: { userId, figureId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: {
      userId,
      figureId,
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  return NextResponse.json(progress);
}
