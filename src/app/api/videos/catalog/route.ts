import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Catalogue public des vidéos Storage (figures actives) — pour pack offline.
 * Query: ?tripId=xxx pour limiter aux figures d’un séjour (membre requis non ici :
 * on filtre juste les figures du trip si le trip existe).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");
  const figureId = searchParams.get("figureId");

  let figureIds: string[] | undefined;

  if (figureId) {
    figureIds = [figureId];
  } else if (tripId) {
    const tripFigures = await prisma.tripFigure.findMany({
      where: { tripId },
      select: { figureId: true },
    });
    figureIds = tripFigures.map((t) => t.figureId);
    if (figureIds.length === 0) {
      return NextResponse.json({ videos: [], totalBytes: 0 });
    }
  }

  const videos = await prisma.video.findMany({
    where: {
      storagePath: { not: "" },
      figure: {
        active: true,
        ...(figureIds ? { id: { in: figureIds } } : {}),
      },
    },
    select: {
      id: true,
      figureId: true,
      url: true,
      storagePath: true,
      title: true,
      mimeType: true,
      sizeBytes: true,
      order: true,
      figure: { select: { slug: true, name: true } },
    },
    orderBy: [
      { figure: { order: "asc" } },
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  const totalBytes = videos.reduce((sum, v) => sum + (v.sizeBytes ?? 0), 0);

  return NextResponse.json({
    videos: videos.map((v) => ({
      id: v.id,
      figureId: v.figureId,
      figureSlug: v.figure.slug,
      figureName: v.figure.name,
      url: v.url,
      storagePath: v.storagePath,
      title: v.title,
      mimeType: v.mimeType,
      sizeBytes: v.sizeBytes,
      order: v.order,
    })),
    totalBytes,
  });
}
