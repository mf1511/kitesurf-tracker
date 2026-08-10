import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSessionFields, syncGearSessionCounts } from "@/lib/sessions";

type Ctx = { params: { id: string } };

async function ownedSession(userId: string, id: string) {
  return prisma.kiteSession.findFirst({
    where: { id, userId },
    include: { gearUsed: { select: { gearId: true } } },
  });
}

/** Mise à jour complète d'une session (mêmes champs que la création) */
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const existing = await ownedSession(userId, params.id);
  if (!existing) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

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

  if (parsed.data.spotId) {
    const spot = await prisma.spot.findFirst({
      where: { id: parsed.data.spotId, userId },
      select: { id: true },
    });
    if (!spot) return NextResponse.json({ error: "Spot introuvable" }, { status: 400 });
  }

  const ownedGear = parsed.gearIds.length
    ? await prisma.gear.findMany({
        where: { id: { in: parsed.gearIds }, userId },
        select: { id: true },
      })
    : [];

  const updated = await prisma.kiteSession.update({
    where: { id: existing.id },
    data: {
      ...parsed.data,
      // Remplace la liste de matériel liée
      gearUsed: {
        deleteMany: {},
        create: ownedGear.map((g) => ({ gearId: g.id })),
      },
    },
    include: {
      spot: { select: { id: true, name: true } },
      gearUsed: { include: { gear: { select: { id: true, category: true, brand: true, model: true, name: true, size: true } } } },
    },
  });

  // Resynchronise les compteurs de l'ancien ET du nouveau matériel
  const touched = new Set([
    ...existing.gearUsed.map((g) => g.gearId),
    ...ownedGear.map((g) => g.id),
  ]);
  await syncGearSessionCounts([...touched]);

  return NextResponse.json({ session: updated });
}

/** Supprimer une session (décrémente les compteurs matériel) */
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await ownedSession(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  await prisma.kiteSession.delete({ where: { id: existing.id } });
  await syncGearSessionCounts(existing.gearUsed.map((g) => g.gearId));

  return NextResponse.json({ ok: true });
}
