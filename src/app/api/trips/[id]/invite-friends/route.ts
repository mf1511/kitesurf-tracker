import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { inviteFriendToTrip } from "@/lib/trip-seats";

/** Ajoute un ami existant au séjour (créateur) */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const friendId = typeof body?.userId === "string" ? body.userId : "";
  if (!friendId) {
    return NextResponse.json({ error: "Ami requis" }, { status: 400 });
  }

  const result = await inviteFriendToTrip({
    tripId: params.id,
    ownerId: session.user.id,
    friendId,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, label: result.label });
}
