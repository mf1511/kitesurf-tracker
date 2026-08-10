import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTripCode } from "@/lib/trips";

/** Liste des séjours de l'utilisateur */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const trips = await prisma.trip.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { members: true, figures: true } },
      creator: { select: { name: true, email: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ trips });
}

/** Créer un séjour */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  const location = body.location ? String(body.location).trim() : null;
  const description = body.description ? String(body.description).trim() : null;
  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;

  if (!name || !startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Nom, date début et date fin requis" }, { status: 400 });
  }
  if (endDate < startDate) {
    return NextResponse.json({ error: "La date de fin doit être après le début" }, { status: 400 });
  }

  let trip = null;
  for (let i = 0; i < 5; i++) {
    try {
      trip = await prisma.trip.create({
        data: {
          name,
          location,
          description,
          startDate,
          endDate,
          inviteCode: generateTripCode(),
          creatorId: session.user.id,
          members: {
            create: { userId: session.user.id, role: "owner" },
          },
        },
      });
      break;
    } catch {
      /* collision code */
    }
  }

  if (!trip) {
    return NextResponse.json({ error: "Impossible de créer le séjour" }, { status: 500 });
  }

  return NextResponse.json({ trip });
}
