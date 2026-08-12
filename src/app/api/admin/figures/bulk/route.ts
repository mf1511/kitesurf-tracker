import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { invalidateFiguresCatalog } from "@/lib/figures-catalog-cache";

/** Active / désactive toutes les figures d’une catégorie */
export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  if (!category || typeof body.active !== "boolean") {
    return NextResponse.json(
      { error: "category (string) et active (boolean) requis" },
      { status: 400 }
    );
  }

  const result = await prisma.figure.updateMany({
    where: { category },
    data: { active: body.active },
  });

  await invalidateFiguresCatalog();
  return NextResponse.json({ count: result.count, active: body.active });
}
