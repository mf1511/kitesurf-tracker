import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { claimTripSeat } from "@/lib/trip-seats";

/** Rejoindre un séjour via code (+ claim place Tricount) */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().toLowerCase() : "";
  const seatId = typeof body.seatId === "string" ? body.seatId : "";

  if (!code) {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }
  if (!seatId) {
    return NextResponse.json(
      { error: "Choisis qui tu es dans la liste" },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.findUnique({
    where: { inviteCode: code },
  });
  if (!trip) {
    return NextResponse.json({ error: "Séjour introuvable" }, { status: 404 });
  }

  const result = await claimTripSeat({
    tripId: trip.id,
    userId: session.user.id,
    seatId,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ tripId: trip.id, inviteCode: trip.inviteCode });
}
