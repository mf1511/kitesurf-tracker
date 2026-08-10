import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

/** Enregistre la note perso du rider sur une figure (contenu vide = suppression) */
export async function PUT(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const figure = await prisma.figure.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (typeof body?.content !== "string") {
    return NextResponse.json({ error: "Contenu invalide" }, { status: 400 });
  }
  const content = body.content.trim().slice(0, 4000);

  if (!content) {
    // Note vidée → suppression du carnet
    await prisma.figureNote.deleteMany({ where: { userId, figureId: figure.id } });
    return NextResponse.json({ note: null });
  }

  const note = await prisma.figureNote.upsert({
    where: { userId_figureId: { userId, figureId: figure.id } },
    create: { userId, figureId: figure.id, content },
    update: { content },
  });

  return NextResponse.json({ note: { content: note.content, updatedAt: note.updatedAt } });
}
