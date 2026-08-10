import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSpotFields } from "@/lib/spots";

type Ctx = { params: { id: string } };

async function ownedSpot(userId: string, id: string) {
  return prisma.spot.findFirst({ where: { id, userId } });
}

/**
 * Mise à jour d'un spot (JSON).
 * JSON spécial : { action: "favorite" } → devient LE spot favori (exclusif).
 * Sinon : mêmes champs que la création.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await ownedSpot(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ error: "Spot introuvable" }, { status: 404 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // Bascule de favori : un seul spot favori à la fois
  if (raw.action === "favorite") {
    const [, spot] = await prisma.$transaction([
      prisma.spot.updateMany({
        where: { userId: session.user.id, favorite: true },
        data: { favorite: false },
      }),
      prisma.spot.update({ where: { id: existing.id }, data: { favorite: true } }),
    ]);
    return NextResponse.json({ spot });
  }

  const parsed = parseSpotFields(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const spot = await prisma.spot.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  return NextResponse.json({ spot });
}

/** Supprimer un spot (les sessions gardent leur historique, spotId → null) */
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await ownedSpot(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ error: "Spot introuvable" }, { status: 404 });
  }

  await prisma.spot.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
