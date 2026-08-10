import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwner(tripId: string, userId: string) {
  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  return member?.role === "owner";
}

/** Liste des places du séjour (membres) */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
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
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const seats = await prisma.tripSeat.findMany({
    where: { tripId: params.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ seats });
}

/** Ajoute une place (créateur) */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!(await requireOwner(params.id, session.user.id))) {
    return NextResponse.json({ error: "Réservé au créateur" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName || displayName.length > 80) {
    return NextResponse.json({ error: "Prénom requis" }, { status: 400 });
  }

  let email: string | null = null;
  if (typeof body?.email === "string" && body.email.trim()) {
    const normalized = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    email = normalized;
  }

  const max = await prisma.tripSeat.aggregate({
    where: { tripId: params.id },
    _max: { order: true },
  });

  const seat = await prisma.tripSeat.create({
    data: {
      tripId: params.id,
      displayName,
      email,
      order: (max._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ seat });
}
