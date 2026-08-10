import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import {
  AVATARS_BUCKET,
  MAX_AVATAR_BYTES,
  avatarExt,
  isAllowedAvatarMime,
  publicAvatarUrl,
} from "@/lib/avatars";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** Photo de profil préparée pour une pré-invitation */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  const invite = await prisma.preInvite.findUnique({
    where: { id: params.id },
  });
  if (!invite) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (invite.usedAt) {
    return NextResponse.json(
      { error: "Invitation déjà utilisée" },
      { status: 400 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("avatar");
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Image trop lourde (max 2 Mo)" }, { status: 400 });
  }
  const mime = file.type || "application/octet-stream";
  if (!isAllowedAvatarMime(mime)) {
    return NextResponse.json(
      { error: "JPEG, PNG ou WebP uniquement" },
      { status: 400 }
    );
  }

  const ext = avatarExt(mime);
  const storagePath = `preinvites/${invite.id}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const supabase = getSupabaseAdmin();
    if (invite.imagePath && invite.imagePath !== storagePath) {
      await supabase.storage.from(AVATARS_BUCKET).remove([invite.imagePath]);
    }
    const { error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(storagePath, buffer, { contentType: mime, upsert: true });
    if (error) {
      console.error("[admin preinvite avatar]", error);
      return NextResponse.json(
        { error: error.message || "Upload impossible" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[admin preinvite avatar] supabase", err);
    return NextResponse.json({ error: "Storage indisponible" }, { status: 500 });
  }

  const image = `${publicAvatarUrl(storagePath)}?v=${Date.now()}`;
  const updated = await prisma.preInvite.update({
    where: { id: invite.id },
    data: { image, imagePath: storagePath },
  });

  return NextResponse.json({
    invite: {
      id: updated.id,
      image: updated.image,
      imagePath: updated.imagePath,
    },
  });
}
