import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ensureAcceptedFriendship } from "@/lib/community";

export async function POST(req: Request) {
  const { email, password, name, inviteCode } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email et mot de passe requis" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit faire au moins 6 caractères" },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    );
  }

  // Valider l'invite avant de créer le compte
  let invite = null;
  if (inviteCode && typeof inviteCode === "string") {
    invite = await prisma.invite.findUnique({
      where: { code: inviteCode.trim().toLowerCase() },
    });
    if (!invite) {
      return NextResponse.json({ error: "Lien d'invitation invalide" }, { status: 400 });
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Cette invitation a expiré" }, { status: 400 });
    }
    if (invite.usedCount >= invite.maxUses) {
      return NextResponse.json({ error: "Cette invitation a atteint sa limite" }, { status: 400 });
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
      name: name || null,
    },
  });

  // Auto-ami avec le créateur de l'invite
  if (invite) {
    await ensureAcceptedFriendship(invite.creatorId, user.id);
    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    invited: !!invite,
  });
}
