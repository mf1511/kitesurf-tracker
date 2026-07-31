import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { url, title } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL de vidéo requise" }, { status: 400 });
  }

  const figure = await prisma.figure.findUnique({ where: { slug: params.slug } });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  const video = await prisma.video.create({
    data: {
      figureId: figure.id,
      userId: session.user.id,
      url,
      title: title || null,
    },
  });

  return NextResponse.json(video);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { videoId } = await req.json();
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.userId !== session.user.id) {
    return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
  }
  await prisma.video.delete({ where: { id: videoId } });
  return NextResponse.json({ ok: true });
}
