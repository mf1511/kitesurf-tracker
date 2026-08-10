import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  findUserSpotByName,
  getPopularSpots,
  normalizeSpotName,
  setFavoriteSpot,
} from "@/lib/spots";

/**
 * Ajoute (si besoin) un spot par nom puis le met en favori.
 * Sert les cartes « Spots populaires ».
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const userId = session.user.id;
  let existing = await findUserSpotByName(userId, name);

  if (!existing) {
    // Reprend meta/coords d’un spot populaire du même nom si dispo
    const popular = (await getPopularSpots(50)).find(
      (p) => normalizeSpotName(p.name) === normalizeSpotName(name)
    );
    const created = await prisma.spot.create({
      data: {
        userId,
        name: popular?.name || name,
        latitude: popular?.latitude ?? null,
        longitude: popular?.longitude ?? null,
        waterType: popular?.waterType ?? null,
        windOrientation: popular?.windOrientation ?? null,
        favorite: false,
      },
    });
    existing = created;
  }

  const spot = await setFavoriteSpot(userId, existing.id);
  return NextResponse.json({ spot });
}
