import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  AVATARS_BUCKET,
  MAX_AVATAR_BYTES,
  avatarExt,
  isAllowedAvatarMime,
  publicAvatarUrl,
} from "@/lib/avatars";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** Upload photo de profil (multipart field « avatar ») */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
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

  const userId = session.user.id;
  const ext = avatarExt(mime);
  const storagePath = `${userId}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { imagePath: true },
  });

  try {
    const supabase = getSupabaseAdmin();
    // Ancien fichier (autre extension) à nettoyer
    if (existing?.imagePath && existing.imagePath !== storagePath) {
      await supabase.storage.from(AVATARS_BUCKET).remove([existing.imagePath]);
    }
    const { error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(storagePath, buffer, { contentType: mime, upsert: true });
    if (error) {
      console.error("[avatar POST] storage", error);
      return NextResponse.json(
        { error: error.message || "Upload Storage impossible" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[avatar POST] supabase", err);
    return NextResponse.json({ error: "Storage indisponible" }, { status: 500 });
  }

  // Cache-bust navigateur après upsert
  const image = `${publicAvatarUrl(storagePath)}?v=${Date.now()}`;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { image, imagePath: storagePath },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  return NextResponse.json({ user });
}

/** Supprime la photo de profil */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { imagePath: true },
  });

  if (existing?.imagePath) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from(AVATARS_BUCKET).remove([existing.imagePath]);
    } catch (err) {
      console.error("[avatar DELETE] storage", err);
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null, imagePath: null },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  return NextResponse.json({ user });
}
