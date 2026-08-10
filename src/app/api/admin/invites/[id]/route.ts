import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { AVATARS_BUCKET } from "@/lib/avatars";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** Supprime une pré-invitation (non utilisée) */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  const invite = await prisma.preInvite.findUnique({
    where: { id: params.id },
  });
  if (!invite) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (invite.usedAt) {
    return NextResponse.json(
      { error: "Invitation déjà utilisée — impossible de supprimer" },
      { status: 400 }
    );
  }

  if (invite.imagePath) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from(AVATARS_BUCKET).remove([invite.imagePath]);
    } catch (err) {
      console.error("[admin invite DELETE] storage", err);
    }
  }

  await prisma.preInvite.delete({ where: { id: invite.id } });
  return NextResponse.json({ ok: true });
}
