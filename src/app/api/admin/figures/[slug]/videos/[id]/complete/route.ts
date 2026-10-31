import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isR2Enabled, r2ObjectExists } from "@/lib/r2";
import { publicVideoUrl } from "@/lib/videos";
import { invalidateFiguresCatalog } from "@/lib/figures-catalog-cache";

/**
 * Confirme que l’upload a réussi — rafraîchit url / size si besoin.
 * Body optionnel: { sizeBytes?, mimeType? }
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  const figure = await prisma.figure.findUnique({
    where: { slug: params.slug },
  });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video || video.figureId !== figure.id) {
    return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });
  }

  let body: { sizeBytes?: number; mimeType?: string } = {};
  try {
    body = await req.json();
  } catch {
    // body optionnel
  }

  try {
    if (isR2Enabled()) {
      const ok = await r2ObjectExists(video.storagePath);
      if (!ok) {
        return NextResponse.json(
          { error: "Fichier introuvable dans R2 — upload incomplet ?" },
          { status: 400 }
        );
      }
    } else {
      const supabase = getSupabaseAdmin();
      const folder = video.storagePath.includes("/")
        ? video.storagePath.slice(0, video.storagePath.lastIndexOf("/"))
        : "";
      const fileName =
        video.storagePath.split("/").pop() || video.storagePath;
      const { data: listed, error } = await supabase.storage
        .from("figure-videos")
        .list(folder, { search: fileName });

      if (error) {
        console.error("[admin videos complete] list", error);
        return NextResponse.json(
          { error: "Impossible de vérifier le fichier Storage" },
          { status: 500 }
        );
      }

      const found = (listed || []).some((f) => f.name === fileName);
      if (!found) {
        return NextResponse.json(
          { error: "Fichier introuvable dans Storage — upload incomplet ?" },
          { status: 400 }
        );
      }
    }
  } catch (err) {
    console.error("[admin videos complete] storage", err);
    return NextResponse.json(
      { error: "Configuration Storage manquante" },
      { status: 500 }
    );
  }

  const updated = await prisma.video.update({
    where: { id: video.id },
    data: {
      url: publicVideoUrl(video.storagePath),
      sizeBytes:
        typeof body.sizeBytes === "number" && body.sizeBytes > 0
          ? body.sizeBytes
          : video.sizeBytes,
      mimeType:
        typeof body.mimeType === "string" && body.mimeType
          ? body.mimeType
          : video.mimeType,
    },
  });

  await invalidateFiguresCatalog();
  return NextResponse.json(updated);
}
