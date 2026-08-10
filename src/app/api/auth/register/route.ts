import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ensureAcceptedFriendship } from "@/lib/community";
import { normalizeUsername, usernameError } from "@/lib/username";

/** Inscription fermée : pré-invite, lien ami, ou code séjour */
export async function POST(req: Request) {
  const { email, password, name, username, inviteCode, tripCode } =
    await req.json();

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

  const userErr = usernameError(
    typeof username === "string" ? username : ""
  );
  if (userErr) {
    return NextResponse.json({ error: userErr }, { status: 400 });
  }
  const normalizedUsername = normalizeUsername(String(username));

  const fromInvite =
    typeof inviteCode === "string" ? inviteCode.trim().toLowerCase() : "";
  const fromTrip =
    typeof tripCode === "string" ? tripCode.trim().toLowerCase() : "";
  const code = fromInvite || fromTrip;
  if (!code) {
    return NextResponse.json(
      { error: "Une invitation est obligatoire pour créer un compte" },
      { status: 403 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: normalizedEmail } }),
    prisma.user.findUnique({ where: { username: normalizedUsername } }),
  ]);
  if (existingEmail) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    );
  }
  if (existingUsername) {
    return NextResponse.json(
      { error: "Ce pseudo est déjà pris" },
      { status: 409 }
    );
  }

  const displayName =
    typeof name === "string" && name.trim() ? name.trim() : null;

  // 1) Pré-invite admin
  const pre = await prisma.preInvite.findUnique({ where: { code } });
  if (pre) {
    if (pre.usedAt) {
      return NextResponse.json(
        { error: "Cette invitation a déjà été utilisée" },
        { status: 400 }
      );
    }
    if (normalizedEmail !== pre.email.toLowerCase()) {
      return NextResponse.json(
        { error: `Cette invitation est réservée à ${pre.email}` },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        username: normalizedUsername,
        name: displayName || pre.name || null,
        image: pre.image,
        imagePath: pre.imagePath,
      },
    });

    await ensureAcceptedFriendship(pre.creatorId, user.id);
    await prisma.preInvite.update({
      where: { id: pre.id },
      data: { usedAt: new Date(), usedById: user.id },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      invited: true,
    });
  }

  // 2) Lien ami
  const invite = await prisma.invite.findUnique({ where: { code } });
  if (invite) {
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Cette invitation a expiré" },
        { status: 400 }
      );
    }
    if (invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { error: "Cette invitation a atteint sa limite" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        username: normalizedUsername,
        name: displayName,
      },
    });

    await ensureAcceptedFriendship(invite.creatorId, user.id);
    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      invited: true,
    });
  }

  // 3) Code séjour (invite Tricount)
  const trip = await prisma.trip.findUnique({ where: { inviteCode: code } });
  if (trip) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        username: normalizedUsername,
        name: displayName,
      },
    });
    await ensureAcceptedFriendship(trip.creatorId, user.id);
    return NextResponse.json({
      id: user.id,
      email: user.email,
      invited: true,
      tripCode: trip.inviteCode,
    });
  }

  return NextResponse.json(
    { error: "Lien d'invitation invalide" },
    { status: 400 }
  );
}
