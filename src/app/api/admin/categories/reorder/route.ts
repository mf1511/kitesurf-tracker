import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { setCategoryOrder } from "@/lib/category-order";
import { sortCategories } from "@/lib/gamification";
import { invalidateFiguresCatalog } from "@/lib/figures-catalog-cache";

/**
 * Body: { orderedCategories: string[] }
 * Doit couvrir exactement l’ensemble des catégories présentes en base.
 */
export async function PUT(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  let body: { orderedCategories?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const ordered = Array.isArray(body.orderedCategories)
    ? body.orderedCategories.filter((c): c is string => typeof c === "string")
    : [];
  if (ordered.length === 0) {
    return NextResponse.json(
      { error: "orderedCategories requis" },
      { status: 400 }
    );
  }

  const existing = await prisma.figure.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const existingSet = new Set(existing.map((e) => e.category));
  const orderedSet = new Set(ordered);

  if (
    orderedSet.size !== ordered.length ||
    orderedSet.size !== existingSet.size ||
    [...existingSet].some((c) => !orderedSet.has(c))
  ) {
    return NextResponse.json(
      { error: "orderedCategories doit lister exactement toutes les catégories" },
      { status: 400 }
    );
  }

  // Complète avec un ordre stable pour les futures cats hors liste (déjà couvert)
  await setCategoryOrder(ordered);
  await invalidateFiguresCatalog();

  return NextResponse.json({
    orderedCategories: sortCategories([...existingSet], ordered),
  });
}
