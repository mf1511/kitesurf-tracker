import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeTripMember } from "@/lib/trip-seats";
import { computeTripStats } from "@/lib/trips";

async function assertMember(tripId: string, userId: string) {
  return prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const member = await assertMember(params.id, session.user.id);
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const stats = await computeTripStats(params.id, session.user.id);
  if (!stats) {
    return NextResponse.json({ error: "Séjour introuvable" }, { status: 404 });
  }

  return NextResponse.json(stats);
}

/** Quitter / supprimer (owner) */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const member = await assertMember(params.id, session.user.id);
  if (!member) {
    return NextResponse.json({ error: "Pas membre" }, { status: 403 });
  }

  if (member.role === "owner") {
    await prisma.trip.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, deleted: true });
  }

  // Départ volontaire : libère aussi place + objectifs
  const left = await removeTripMember({
    tripId: params.id,
    actorId: session.user.id,
    targetUserId: session.user.id,
  });
  if ("error" in left) {
    return NextResponse.json({ error: left.error }, { status: left.status });
  }
  return NextResponse.json({ ok: true, left: true });
}
