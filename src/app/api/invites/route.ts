import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureInviteForUser } from "@/lib/community";

/** Récupère (ou crée) le lien d'invitation de l'utilisateur */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const invite = await ensureInviteForUser(session.user.id);
  return NextResponse.json({
    code: invite.code,
    usedCount: invite.usedCount,
    maxUses: invite.maxUses,
    path: `/invite/${invite.code}`,
  });
}

/** Régénère un nouveau code d'invitation */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");
  const { generateInviteCode } = await import("@/lib/community");

  let invite = null;
  for (let i = 0; i < 5; i++) {
    try {
      invite = await prisma.invite.create({
        data: { code: generateInviteCode(), creatorId: session.user.id },
      });
      break;
    } catch {
      /* collision */
    }
  }
  if (!invite) {
    return NextResponse.json({ error: "Échec génération code" }, { status: 500 });
  }

  return NextResponse.json({
    code: invite.code,
    usedCount: invite.usedCount,
    maxUses: invite.maxUses,
    path: `/invite/${invite.code}`,
  });
}
