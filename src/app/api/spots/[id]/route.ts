import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSpotFields, setFavoriteSpot } from "@/lib/spots";

type Ctx = { params: { id: string } };

async function ownedSpot(userId: string, id: string) {
  return prisma.spot.findFirst({ where: { id, userId } });
}

/**
 * Mise à jour d'un spot (JSON).
 * { action: "favorite" } → devient LE spot favori (exclusif).
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

  if (raw.action === "favorite") {
    const spot = await setFavoriteSpot(session.user.id, existing.id);
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

/** Supprimer un spot (sessions conservées, spotId → null) */
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
