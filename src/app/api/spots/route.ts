import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSpots, parseSpotFields } from "@/lib/spots";

/** Liste des spots de l'utilisateur (favoris d'abord) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const spots = await getUserSpots(session.user.id);
  return NextResponse.json({ spots });
}

/** Créer un spot (JSON). Le premier spot devient favori automatiquement. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = parseSpotFields(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Premier spot du user → favori d'office (widget dashboard)
  const count = await prisma.spot.count({ where: { userId: session.user.id } });

  const spot = await prisma.spot.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
      favorite: count === 0,
    },
  });

  return NextResponse.json({ spot });
}
