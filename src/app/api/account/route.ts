import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUsername, usernameError } from "@/lib/username";

/** Met à jour le profil (nom, username, poids) */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const data: {
    name?: string | null;
    username?: string;
    weightKg?: number | null;
  } = {};

  if (body?.name !== undefined) {
    if (typeof body.name !== "string") {
      return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
    }
    const name = body.name.trim();
    if (name.length > 80) {
      return NextResponse.json(
        { error: "Nom trop long (80 car. max)" },
        { status: 400 }
      );
    }
    data.name = name || null;
  }

  if (body?.username !== undefined) {
    if (typeof body.username !== "string") {
      return NextResponse.json({ error: "Pseudo invalide" }, { status: 400 });
    }
    const err = usernameError(body.username);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
    const username = normalizeUsername(body.username);
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Ce pseudo est déjà pris" },
        { status: 409 }
      );
    }
    data.username = username;
  }

  if (body?.weightKg !== undefined) {
    if (body.weightKg === null || body.weightKg === "") {
      data.weightKg = null;
    } else {
      const w = Number(body.weightKg);
      if (!Number.isFinite(w) || w < 20 || w > 200) {
        return NextResponse.json(
          { error: "Poids invalide (20–200 kg)" },
          { status: 400 }
        );
      }
      data.weightKg = w;
    }
  }

  if (!Object.keys(data).length) {
    return NextResponse.json(
      { error: "Aucun champ à mettre à jour" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        weightKg: true,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Ce pseudo est déjà pris" },
      { status: 409 }
    );
  }
}
