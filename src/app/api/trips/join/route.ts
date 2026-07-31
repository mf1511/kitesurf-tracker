import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Rejoindre un séjour via code d'invitation */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({
    where: { inviteCode: code.trim().toLowerCase() },
  });
  if (!trip) {
    return NextResponse.json({ error: "Séjour introuvable" }, { status: 404 });
  }

  await prisma.tripMember.upsert({
    where: {
      tripId_userId: { tripId: trip.id, userId: session.user.id },
    },
    update: {},
    create: { tripId: trip.id, userId: session.user.id, role: "member" },
  });

  return NextResponse.json({ tripId: trip.id, inviteCode: trip.inviteCode });
}
