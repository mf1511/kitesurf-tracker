import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

/** Body: { orderedIds: string[] } — réordonne les vidéos de la figure */
export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const figure = await prisma.figure.findUnique({ where: { slug: params.slug } });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  let body: { orderedIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds : [];
  if (orderedIds.length === 0) {
    return NextResponse.json({ error: "orderedIds requis" }, { status: 400 });
  }

  const existing = await prisma.video.findMany({
    where: { figureId: figure.id },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((v) => v.id));
  if (
    orderedIds.length !== existingIds.size ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json({ error: "Liste de vidéos incohérente" }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.video.update({ where: { id }, data: { order: index } })
    )
  );

  const videos = await prisma.video.findMany({
    where: { figureId: figure.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(videos);
}
