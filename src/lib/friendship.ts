import { prisma } from "@/lib/prisma";

/** Crée / accepte / réactive une demande d’ami entre moi et target */
export async function requestFriendship(meId: string, targetId: string) {
  if (targetId === meId) {
    return { error: "Tu ne peux pas t'ajouter toi-même", status: 400 as const };
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: meId, addresseeId: targetId },
        { requesterId: targetId, addresseeId: meId },
      ],
    },
  });

  if (existing?.status === "accepted") {
    return { error: "Vous êtes déjà amis", status: 409 as const };
  }
  if (existing?.status === "pending") {
    if (existing.addresseeId === meId) {
      const updated = await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted" },
      });
      return { friendship: updated, autoAccepted: true as const };
    }
    return { error: "Demande déjà envoyée", status: 409 as const };
  }

  if (existing?.status === "declined") {
    const updated = await prisma.friendship.update({
      where: { id: existing.id },
      data: { requesterId: meId, addresseeId: targetId, status: "pending" },
    });
    return { friendship: updated };
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: meId, addresseeId: targetId, status: "pending" },
  });
  return { friendship };
}
