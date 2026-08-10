import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Met à jour le profil (nom d’affichage) */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const nameRaw = body?.name;
  if (typeof nameRaw !== "string") {
    return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
  }

  const name = nameRaw.trim();
  if (name.length > 80) {
    return NextResponse.json({ error: "Nom trop long (80 car. max)" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ user });
}
