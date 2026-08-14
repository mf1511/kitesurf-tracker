import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { invalidateFiguresCatalog } from "@/lib/figures-catalog-cache";

/**
 * Body: { category: string, orderedIds: string[] }
 * Réordonne les figures d’une catégorie (order = index).
 */
export async function PUT(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  let body: { category?: string; orderedIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const category = typeof body.category === "string" ? body.category.trim() : "";
  const orderedIds = Array.isArray(body.orderedIds)
    ? body.orderedIds.filter((id): id is string => typeof id === "string")
    : [];

  if (!category || orderedIds.length === 0) {
    return NextResponse.json(
      { error: "category et orderedIds requis" },
      { status: 400 }
    );
  }

  const existing = await prisma.figure.findMany({
    where: { category },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((f) => f.id));

  if (
    orderedIds.length !== existingIds.size ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json(
      { error: "orderedIds doit lister exactement les figures de la catégorie" },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.figure.update({ where: { id }, data: { order: index } })
    )
  );

  await invalidateFiguresCatalog();
  return NextResponse.json({ category, count: orderedIds.length });
}
