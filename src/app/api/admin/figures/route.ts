import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, slugify } from "@/lib/admin";
import { invalidateFiguresCatalog } from "@/lib/figures-catalog-cache";

// Création d'une nouvelle figure
export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const body = await req.json();
  const { name, category, description, steps, order, prerequisiteSlugs, slug: providedSlug } = body;

  if (!name || !category || !description) {
    return NextResponse.json({ error: "Nom, catégorie et description requis" }, { status: 400 });
  }

  const slug = slugify(providedSlug || name);
  if (!slug) {
    return NextResponse.json({ error: "Slug invalide" }, { status: 400 });
  }

  const existing = await prisma.figure.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Une figure avec ce slug existe déjà" }, { status: 409 });
  }

  const figure = await prisma.figure.create({
    data: {
      slug,
      name,
      category,
      description,
      steps: JSON.stringify(
        Array.isArray(steps) ? steps.filter(Boolean) : String(steps || "").split("\n").filter(Boolean)
      ),
      order: typeof order === "number" ? order : 0,
      prerequisites: prerequisiteSlugs?.length
        ? { connect: prerequisiteSlugs.map((s: string) => ({ slug: s })) }
        : undefined,
    },
  });

  await invalidateFiguresCatalog();
  return NextResponse.json(figure, { status: 201 });
}
