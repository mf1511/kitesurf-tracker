import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { riderLabel } from "@/lib/community";
import { requestFriendship } from "@/lib/friendship";
import {
  looksLikeEmail,
  normalizeUsername,
  usernameError,
} from "@/lib/username";

const userSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
} as const;

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
        requester: { select: userSelect },
        addressee: { select: userSelect },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: me, status: "pending" },
      include: { requester: { select: userSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { requesterId: me, status: "pending" },
      include: { addressee: { select: userSelect } },
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

/** Demande d’ami : par username (prioritaire) ou email */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const rawUsername =
    typeof body?.username === "string" ? body.username : "";
  const rawEmail = typeof body?.email === "string" ? body.email : "";
  const query =
    typeof body?.query === "string" ? body.query.trim() : "";

  const me = session.user.id;
  let target: { id: string } | null = null;

  // Champ unique dialog : pseudo OU email
  if (query) {
    if (looksLikeEmail(query)) {
      target = await prisma.user.findUnique({
        where: { email: query.trim().toLowerCase() },
        select: { id: true },
      });
      if (!target) {
        return NextResponse.json(
          {
            error:
              "Aucun compte avec cet email. Partage ton lien d'invitation ci-dessus.",
            code: "EMAIL_NOT_FOUND",
          },
          { status: 404 }
        );
      }
    } else {
      const err = usernameError(query);
      if (err) {
        return NextResponse.json({ error: err }, { status: 400 });
      }
      target = await prisma.user.findUnique({
        where: { username: normalizeUsername(query) },
        select: { id: true },
      });
      if (!target) {
        return NextResponse.json(
          {
            error: "Ce pseudo n’existe pas. Invite-le par email.",
            code: "USERNAME_NOT_FOUND",
          },
          { status: 404 }
        );
      }
    }
  } else if (rawUsername) {
    const err = usernameError(rawUsername);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
    target = await prisma.user.findUnique({
      where: { username: normalizeUsername(rawUsername) },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json(
        {
          error: "Ce pseudo n’existe pas. Invite-le par email.",
          code: "USERNAME_NOT_FOUND",
        },
        { status: 404 }
      );
    }
  } else if (rawEmail) {
    target = await prisma.user.findUnique({
      where: { email: rawEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json(
        {
          error:
            "Aucun compte avec cet email. Partage ton lien d'invitation ci-dessus.",
          code: "EMAIL_NOT_FOUND",
        },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Pseudo ou email requis" },
      { status: 400 }
    );
  }

  const result = await requestFriendship(me, target.id);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(result);
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
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });
  if (!friendship) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const involved =
    friendship.requesterId === me || friendship.addresseeId === me;
  if (!involved) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  if (action === "accept") {
    if (friendship.addresseeId !== me) {
      return NextResponse.json(
        { error: "Seul le destinataire peut accepter" },
        { status: 403 }
      );
    }
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "accepted" },
    });
    return NextResponse.json({ friendship: updated });
  }

  if (action === "decline") {
    if (friendship.addresseeId !== me) {
      return NextResponse.json(
        { error: "Seul le destinataire peut refuser" },
        { status: 403 }
      );
    }
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "declined" },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });
  return NextResponse.json({ ok: true });
}
