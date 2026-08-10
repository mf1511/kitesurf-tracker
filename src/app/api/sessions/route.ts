import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSessions, parseSessionFields, syncGearSessionCounts } from "@/lib/sessions";

/** Journal des sessions (récentes d'abord, avec spot + matériel) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const sessions = await getUserSessions(session.user.id);
  return NextResponse.json({ sessions });
}

/** Logger une session (JSON : date, spotId?, durationMin?, windKnots?, notes?, gearIds?) */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = parseSessionFields(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Le spot doit appartenir au user
  if (parsed.data.spotId) {
    const spot = await prisma.spot.findFirst({
      where: { id: parsed.data.spotId, userId },
      select: { id: true },
    });
    if (!spot) return NextResponse.json({ error: "Spot introuvable" }, { status: 400 });
  }

  // Ne relier que du matériel appartenant au user
  const ownedGear = parsed.gearIds.length
    ? await prisma.gear.findMany({
        where: { id: { in: parsed.gearIds }, userId },
        select: { id: true },
      })
    : [];

  const created = await prisma.kiteSession.create({
    data: {
      userId,
      ...parsed.data,
      gearUsed: { create: ownedGear.map((g) => ({ gearId: g.id })) },
    },
    include: {
      spot: { select: { id: true, name: true } },
      gearUsed: { include: { gear: { select: { id: true, category: true, brand: true, model: true, name: true, size: true } } } },
    },
  });

  // Compteur de sorties auto sur le matériel lié
  await syncGearSessionCounts(ownedGear.map((g) => g.id));

  return NextResponse.json({ session: created });
}
