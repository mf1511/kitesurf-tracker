import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { FIGURE_VIDEOS_BUCKET } from "@/lib/videos";
import { invalidateFiguresCatalog } from "@/lib/figures-catalog-cache";

async function loadOwnedVideo(slug: string, videoId: string) {
  const figure = await prisma.figure.findUnique({ where: { slug } });
  if (!figure) return { error: "Figure introuvable" as const, status: 404 as const };
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.figureId !== figure.id) {
    return { error: "Vidéo introuvable" as const, status: 404 as const };
  }
  return { figure, video };
}

/** Met à jour titre et/ou order */
export async function PATCH(
  req: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const loaded = await loadOwnedVideo(params.slug, params.id);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  let body: { title?: string | null; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const data: { title?: string | null; order?: number } = {};
  if ("title" in body) {
    data.title =
      typeof body.title === "string" && body.title.trim() ? body.title.trim() : null;
  }
  if (typeof body.order === "number" && Number.isFinite(body.order)) {
    data.order = Math.max(0, Math.floor(body.order));
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const updated = await prisma.video.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

/** Supprime Storage + row DB */
export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const loaded = await loadOwnedVideo(params.slug, params.id);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from(FIGURE_VIDEOS_BUCKET)
      .remove([loaded.video.storagePath]);
    if (error) {
      console.error("[admin videos DELETE] storage", error);
      // On continue : la row DB doit partir même si le fichier est déjà absent
    }
  } catch (err) {
    console.error("[admin videos DELETE] supabase", err);
  }

  await prisma.video.delete({ where: { id: params.id } });
  await invalidateFiguresCatalog();
  return NextResponse.json({ ok: true });
}
