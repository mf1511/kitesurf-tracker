import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { riderLabel } from "@/lib/community";

/** Liste amis + demandes en attente */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const me = session.user.id;

  const [accepted, incoming, outgoing] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: me }, { addresseeId: me }],
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        addressee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: me, status: "pending" },
      include: { requester: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { requesterId: me, status: "pending" },
      include: { addressee: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends = accepted.map((f) => {
    const other = f.requesterId === me ? f.addressee : f.requester;
    return { friendshipId: f.id, ...other, label: riderLabel(other) };
  });

  return NextResponse.json({
    friends,
    incoming: incoming.map((f) => ({
      friendshipId: f.id,
      ...f.requester,
      label: riderLabel(f.requester),
    })),
    outgoing: outgoing.map((f) => ({
      friendshipId: f.id,
      ...f.addressee,
      label: riderLabel(f.addressee),
    })),
  });
}

/** Envoyer une demande d'ami par email */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const me = session.user.id;
  const target = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!target) {
    return NextResponse.json(
      {
        error: "Aucun compte avec cet email. Partage ton lien d'invitation à la place.",
        code: "NOT_FOUND",
      },
      { status: 404 }
    );
  }

  if (target.id === me) {
    return NextResponse.json({ error: "Tu ne peux pas t'ajouter toi-même" }, { status: 400 });
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: me, addresseeId: target.id },
        { requesterId: target.id, addresseeId: me },
      ],
    },
  });

  if (existing?.status === "accepted") {
    return NextResponse.json({ error: "Vous êtes déjà amis" }, { status: 409 });
  }
  if (existing?.status === "pending") {
    // Si l'autre m'avait déjà demandé → accepter
    if (existing.addresseeId === me) {
      const updated = await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted" },
      });
      return NextResponse.json({ friendship: updated, autoAccepted: true });
    }
    return NextResponse.json({ error: "Demande déjà envoyée" }, { status: 409 });
  }

  if (existing?.status === "declined") {
    const updated = await prisma.friendship.update({
      where: { id: existing.id },
      data: { requesterId: me, addresseeId: target.id, status: "pending" },
    });
    return NextResponse.json({ friendship: updated });
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: me, addresseeId: target.id, status: "pending" },
  });

  return NextResponse.json({ friendship });
}

/** Accepter / refuser / supprimer une amitié */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { friendshipId, action } = await req.json();
  if (!friendshipId || !["accept", "decline", "remove"].includes(action)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const me = session.user.id;
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const involved = friendship.requesterId === me || friendship.addresseeId === me;
  if (!involved) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  if (action === "accept") {
    if (friendship.addresseeId !== me) {
      return NextResponse.json({ error: "Seul le destinataire peut accepter" }, { status: 403 });
    }
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "accepted" },
    });
    return NextResponse.json({ friendship: updated });
  }

  if (action === "decline") {
    if (friendship.addresseeId !== me) {
      return NextResponse.json({ error: "Seul le destinataire peut refuser" }, { status: 403 });
    }
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "declined" },
    });
    return NextResponse.json({ ok: true });
  }

  // remove
  await prisma.friendship.delete({ where: { id: friendshipId } });
  return NextResponse.json({ ok: true });
}
