import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AVATARS_BUCKET } from "@/lib/avatars";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function requireOwner(tripId: string, userId: string) {
  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  return member?.role === "owner";
}

/** Renomme une place (libre uniquement, sauf si claimée par le créateur on peut renommer?) */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; seatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!(await requireOwner(params.id, session.user.id))) {
    return NextResponse.json({ error: "Réservé au créateur" }, { status: 403 });
  }

  const seat = await prisma.tripSeat.findFirst({
    where: { id: params.seatId, tripId: params.id },
  });
  if (!seat) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  // Place claimée par quelqu’un d’autre : pas de rename
  if (seat.claimedById && seat.claimedById !== session.user.id) {
    return NextResponse.json(
      { error: "Place déjà prise — impossible de modifier" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName || displayName.length > 80) {
    return NextResponse.json({ error: "Prénom requis" }, { status: 400 });
  }

  const updated = await prisma.tripSeat.update({
    where: { id: seat.id },
    data: { displayName },
  });
  return NextResponse.json({ seat: updated });
}

/** Supprime une place non claimée (pas la place du créateur) */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; seatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!(await requireOwner(params.id, session.user.id))) {
    return NextResponse.json({ error: "Réservé au créateur" }, { status: 403 });
  }

  const seat = await prisma.tripSeat.findFirst({
    where: { id: params.seatId, tripId: params.id },
  });
  if (!seat) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (seat.claimedById) {
    return NextResponse.json(
      { error: "Place déjà prise — impossible de supprimer" },
      { status: 400 }
    );
  }

  if (seat.imagePath) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from(AVATARS_BUCKET).remove([seat.imagePath]);
    } catch (err) {
      console.error("[trip seat DELETE] storage", err);
    }
  }

  await prisma.tripSeat.delete({ where: { id: seat.id } });
  return NextResponse.json({ ok: true });
}
