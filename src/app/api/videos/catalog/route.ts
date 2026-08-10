import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Catalogue des vidéos Storage — pack offline.
 * Query:
 *  - ?figureId=
 *  - ?tripId= (& scope=trip|objectives — objectives = mes objectifs perso)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");
  const figureId = searchParams.get("figureId");
  const scope = searchParams.get("scope") ?? "trip";

  let figureIds: string[] | undefined;

  if (figureId) {
    figureIds = [figureId];
  } else if (tripId) {
    if (scope === "objectives") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      }
      const objs = await prisma.tripMemberObjective.findMany({
        where: { tripId, userId: session.user.id },
        select: { figureId: true },
      });
      figureIds = objs.map((o) => o.figureId);
    } else {
      const tripFigures = await prisma.tripFigure.findMany({
        where: { tripId },
        select: { figureId: true },
      });
      figureIds = tripFigures.map((t) => t.figureId);
    }
    if (figureIds.length === 0) {
      return NextResponse.json({ videos: [], totalBytes: 0, count: 0 });
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
    count: videos.length,
  });
}
