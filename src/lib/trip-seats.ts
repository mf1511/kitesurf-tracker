import { prisma } from "@/lib/prisma";
import { getFriendIds, riderLabel } from "@/lib/community";

/** Place créateur claimée à la création du séjour */
export async function createOwnerSeat(tripId: string, creatorId: string) {
  const user = await prisma.user.findUnique({
    where: { id: creatorId },
    select: { name: true, email: true, image: true, imagePath: true },
  });
  if (!user) return null;

  return prisma.tripSeat.create({
    data: {
      tripId,
      displayName: riderLabel(user),
      image: user.image,
      imagePath: user.imagePath,
      order: 0,
      claimedById: creatorId,
    },
  });
}

/**
 * Claim une place + membership.
 * Applique name/image de la seat au User s’il n’en a pas encore.
 */
export async function claimTripSeat(opts: {
  tripId: string;
  userId: string;
  seatId: string;
  asOwner?: boolean;
}) {
  const seat = await prisma.tripSeat.findFirst({
    where: { id: opts.seatId, tripId: opts.tripId },
  });
  if (!seat) {
    return { error: "Place introuvable", status: 404 as const };
  }
  if (seat.claimedById && seat.claimedById !== opts.userId) {
    return { error: "Cette place est déjà prise", status: 409 as const };
  }

  // Un user ne peut claim qu’une place sur le trip
  const already = await prisma.tripSeat.findFirst({
    where: { tripId: opts.tripId, claimedById: opts.userId },
  });
  if (already && already.id !== seat.id) {
    return { error: "Tu as déjà choisi une place sur ce séjour", status: 409 as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.tripSeat.update({
      where: { id: seat.id },
      data: { claimedById: opts.userId },
    });
    await tx.tripMember.upsert({
      where: {
        tripId_userId: { tripId: opts.tripId, userId: opts.userId },
      },
      update: {},
      create: {
        tripId: opts.tripId,
        userId: opts.userId,
        role: opts.asOwner ? "owner" : "member",
      },
    });

    const user = await tx.user.findUnique({
      where: { id: opts.userId },
      select: { name: true, image: true, imagePath: true },
    });
    if (!user) return;

    const data: { name?: string; image?: string; imagePath?: string | null } = {};
    if (!user.name?.trim() && seat.displayName.trim()) {
      data.name = seat.displayName.trim();
    }
    if (!user.image && seat.image) {
      data.image = seat.image;
      data.imagePath = seat.imagePath;
    }
    if (Object.keys(data).length) {
      await tx.user.update({ where: { id: opts.userId }, data });
    }
  });

  return { ok: true as const };
}

/**
 * Ajoute un ami déjà sur KiteQuest au séjour (membre + place claimée).
 * Réservé au créateur — amitié acceptée requise.
 */
export async function inviteFriendToTrip(opts: {
  tripId: string;
  ownerId: string;
  friendId: string;
}) {
  if (opts.friendId === opts.ownerId) {
    return { error: "Tu es déjà sur le séjour", status: 400 as const };
  }

  const member = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId: opts.tripId, userId: opts.ownerId },
    },
  });
  if (member?.role !== "owner") {
    return { error: "Réservé au créateur", status: 403 as const };
  }

  const friendIds = await getFriendIds(opts.ownerId);
  if (!friendIds.includes(opts.friendId)) {
    return { error: "Ce rider n’est pas dans tes amis", status: 400 as const };
  }

  const existing = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId: opts.tripId, userId: opts.friendId },
    },
  });
  if (existing) {
    return { error: "Déjà sur le séjour", status: 409 as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: opts.friendId },
    select: { name: true, email: true, image: true, imagePath: true },
  });
  if (!user) {
    return { error: "Utilisateur introuvable", status: 404 as const };
  }

  const max = await prisma.tripSeat.aggregate({
    where: { tripId: opts.tripId },
    _max: { order: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.tripMember.create({
      data: {
        tripId: opts.tripId,
        userId: opts.friendId,
        role: "member",
      },
    });
    // Place déjà claimée — pas besoin de « Qui es-tu ? »
    await tx.tripSeat.create({
      data: {
        tripId: opts.tripId,
        displayName: riderLabel(user),
        image: user.image,
        imagePath: user.imagePath,
        order: (max._max.order ?? 0) + 1,
        claimedById: opts.friendId,
      },
    });
  });

  return { ok: true as const, label: riderLabel(user) };
}

/**
 * Retire un membre du séjour (créateur) ou départ volontaire.
 * Impossible de retirer le owner. Nettoie objectifs + claim de place.
 */
export async function removeTripMember(opts: {
  tripId: string;
  actorId: string;
  targetUserId: string;
}) {
  const [actor, target] = await Promise.all([
    prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId: opts.tripId, userId: opts.actorId },
      },
    }),
    prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId: opts.tripId, userId: opts.targetUserId },
      },
    }),
  ]);

  if (!actor) {
    return { error: "Pas membre", status: 403 as const };
  }
  if (!target) {
    return { error: "Rider introuvable sur ce séjour", status: 404 as const };
  }
  if (target.role === "owner") {
    return { error: "Impossible de retirer le créateur", status: 400 as const };
  }

  const isSelf = opts.actorId === opts.targetUserId;
  if (!isSelf && actor.role !== "owner") {
    return { error: "Réservé au créateur", status: 403 as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.tripMemberObjective.deleteMany({
      where: { tripId: opts.tripId, userId: opts.targetUserId },
    });
    // Libère la place (réutilisable via le lien d’invite)
    await tx.tripSeat.updateMany({
      where: { tripId: opts.tripId, claimedById: opts.targetUserId },
      data: { claimedById: null },
    });
    await tx.tripMember.delete({ where: { id: target.id } });
  });

  return { ok: true as const };
}
