import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  findUserSpotByName,
  getKnownSpotNames,
  getUserSpots,
  normalizeSpotName,
  parseSpotFields,
  suggestSpotNames,
} from "@/lib/spots";

/** Liste des spots de l'utilisateur (favori + usage) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const spots = await getUserSpots(session.user.id);
  return NextResponse.json({ spots });
}

/** Créer un spot (JSON, sans lat/lng requis). Bloque les doublons de nom. */
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

  const dup = await findUserSpotByName(session.user.id, parsed.data.name);
  if (dup) {
    return NextResponse.json(
      { error: `Tu as déjà « ${dup.name} » dans tes spots`, spotId: dup.id },
      { status: 409 }
    );
  }

  // Suggestions si très proche d’un spot connu et pas forcé
  const force = raw.force === true;
  if (!force) {
    const known = await getKnownSpotNames();
    const similar = suggestSpotNames(parsed.data.name, known, 3).filter(
      (s) => normalizeSpotName(s.name) !== normalizeSpotName(parsed.data.name)
    );
    if (similar.length && similar[0].score >= 0.72) {
      return NextResponse.json(
        {
          error: "Un spot similaire existe déjà",
          similar: similar.map((s) => s.name),
        },
        { status: 409 }
      );
    }
  }

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
