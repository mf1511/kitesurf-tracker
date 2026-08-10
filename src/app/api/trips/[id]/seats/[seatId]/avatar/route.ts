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

/** Photo d’une place (créateur) */
export async function POST(
  req: Request,
  { params }: { params: { id: string; seatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const member = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId: params.id, userId: session.user.id },
    },
  });
  if (member?.role !== "owner") {
    return NextResponse.json({ error: "Réservé au créateur" }, { status: 403 });
  }

  const seat = await prisma.tripSeat.findFirst({
    where: { id: params.seatId, tripId: params.id },
  });
  if (!seat) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (seat.claimedById && seat.claimedById !== session.user.id) {
    return NextResponse.json(
      { error: "Place déjà prise" },
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
  const storagePath = `trip-seats/${seat.id}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const supabase = getSupabaseAdmin();
    if (seat.imagePath && seat.imagePath !== storagePath) {
      await supabase.storage.from(AVATARS_BUCKET).remove([seat.imagePath]);
    }
    const { error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(storagePath, buffer, { contentType: mime, upsert: true });
    if (error) {
      console.error("[trip seat avatar]", error);
      return NextResponse.json(
        { error: error.message || "Upload impossible" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[trip seat avatar] supabase", err);
    return NextResponse.json({ error: "Storage indisponible" }, { status: 500 });
  }

  const image = `${publicAvatarUrl(storagePath)}?v=${Date.now()}`;
  const updated = await prisma.tripSeat.update({
    where: { id: seat.id },
    data: { image, imagePath: storagePath },
  });

  return NextResponse.json({ seat: updated });
}
