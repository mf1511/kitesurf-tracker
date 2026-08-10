import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  ALLOWED_VIDEO_MIMES,
  FIGURE_VIDEOS_BUCKET,
  MAX_VIDEO_BYTES,
  extensionForMime,
  publicVideoUrl,
} from "@/lib/videos";

/** Liste les vidéos Storage d’une figure (admin) */
export async function GET(
  _req: Request,
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

  const videos = await prisma.video.findMany({
    where: { figureId: figure.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(videos);
}

/**
 * Prépare un upload : crée la row + signed upload URL Storage.
 * Body: { title?, mimeType, sizeBytes, fileName? }
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await requireAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const figure = await prisma.figure.findUnique({ where: { slug: params.slug } });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  let body: {
    title?: string;
    mimeType?: string;
    sizeBytes?: number;
    fileName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const sizeBytes = typeof body.sizeBytes === "number" ? body.sizeBytes : 0;

  if (!ALLOWED_VIDEO_MIMES.has(mimeType)) {
    return NextResponse.json(
      { error: "Format non supporté (mp4, webm, mov)" },
      { status: 400 }
    );
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_VIDEO_BYTES) {
    return NextResponse.json(
      { error: `Fichier trop volumineux (max ${MAX_VIDEO_BYTES / (1024 * 1024)} Mo)` },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.video.aggregate({
    where: { figureId: figure.id },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  // Id + path avant insert pour signer l’upload
  const id = `vid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  const ext = extensionForMime(mimeType);
  const storagePath = `${figure.id}/${id}.${ext}`;
  const url = publicVideoUrl(storagePath);

  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : typeof body.fileName === "string" && body.fileName.trim()
      ? body.fileName.replace(/\.[^.]+$/, "")
      : null;

  let video;
  try {
    video = await prisma.video.create({
      data: {
        id,
        figureId: figure.id,
        userId: session.user.id,
        url,
        storagePath,
        title,
        mimeType,
        sizeBytes,
        order: nextOrder,
      },
    });
  } catch (err) {
    console.error("[admin videos POST] prisma", err);
    return NextResponse.json({ error: "Impossible de créer la vidéo" }, { status: 500 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(FIGURE_VIDEOS_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("[admin videos POST] signed url", error);
      await prisma.video.delete({ where: { id } }).catch(() => {});
      return NextResponse.json(
        { error: error?.message || "Impossible de préparer l’upload Storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      video,
      upload: {
        signedUrl: data.signedUrl,
        token: data.token,
        path: data.path,
      },
    });
  } catch (err) {
    console.error("[admin videos POST] supabase", err);
    await prisma.video.delete({ where: { id } }).catch(() => {});
    return NextResponse.json(
      { error: "Configuration Supabase Storage manquante ou invalide" },
      { status: 500 }
    );
  }
}
