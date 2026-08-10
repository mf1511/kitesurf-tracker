import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { generateInviteCode } from "@/lib/community";
import { prisma } from "@/lib/prisma";

/** Liste des pré-invitations */
export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  const invites = await prisma.preInvite.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    invites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      name: i.name,
      image: i.image,
      code: i.code,
      path: `/register?invite=${i.code}`,
      createdAt: i.createdAt.toISOString(),
      usedAt: i.usedAt?.toISOString() ?? null,
      usedBy: i.usedBy,
    })),
  });
}

/** Crée une pré-invitation (email + nom optionnel) */
export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name =
    typeof body?.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 80)
      : null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    );
  }

  const existingPre = await prisma.preInvite.findUnique({ where: { email } });
  if (existingPre && !existingPre.usedAt) {
    return NextResponse.json(
      { error: "Une invitation est déjà en attente pour cet email" },
      { status: 409 }
    );
  }
  // Ancienne invite déjà utilisée : on libère l’email pour une nouvelle
  if (existingPre?.usedAt) {
    await prisma.preInvite.delete({ where: { id: existingPre.id } });
  }

  for (let i = 0; i < 5; i++) {
    const code = generateInviteCode();
    try {
      const invite = await prisma.preInvite.create({
        data: {
          email,
          name,
          code,
          creatorId: session.user.id,
        },
      });
      return NextResponse.json({
        invite: {
          id: invite.id,
          email: invite.email,
          name: invite.name,
          image: invite.image,
          code: invite.code,
          path: `/register?invite=${invite.code}`,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Unique") && msg.includes("email")) {
        return NextResponse.json(
          { error: "Une invitation existe déjà pour cet email" },
          { status: 409 }
        );
      }
    }
  }

  return NextResponse.json(
    { error: "Impossible de créer l’invitation" },
    { status: 500 }
  );
}
