import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Met à jour le profil (nom d’affichage + poids rider) */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const data: { name?: string | null; weightKg?: number | null } = {};

  // Nom d'affichage (optionnel dans le payload)
  if (body?.name !== undefined) {
    if (typeof body.name !== "string") {
      return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
    }
    const name = body.name.trim();
    if (name.length > 80) {
      return NextResponse.json({ error: "Nom trop long (80 car. max)" }, { status: 400 });
    }
    data.name = name || null;
  }

  // Poids rider en kg (optionnel) — sert à l'assistant taille d'aile
  if (body?.weightKg !== undefined) {
    if (body.weightKg === null || body.weightKg === "") {
      data.weightKg = null;
    } else {
      const w = Number(body.weightKg);
      if (!Number.isFinite(w) || w < 20 || w > 200) {
        return NextResponse.json({ error: "Poids invalide (20–200 kg)" }, { status: 400 });
      }
      data.weightKg = w;
    }
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, email: true, name: true, role: true, weightKg: true },
  });

  return NextResponse.json({ user });
}
