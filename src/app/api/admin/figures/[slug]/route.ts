import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, slugify } from "@/lib/admin";

/** Toggle rapide actif / inactif (colonne admin) */
export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const figure = await prisma.figure.findUnique({ where: { slug: params.slug } });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  const body = await req.json();
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active (boolean) requis" }, { status: 400 });
  }

  const updated = await prisma.figure.update({
    where: { slug: params.slug },
    data: { active: body.active },
  });

  return NextResponse.json(updated);
}

// Mise à jour d'une figure existante
export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const figure = await prisma.figure.findUnique({ where: { slug: params.slug } });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const { name, category, description, steps, order, prerequisiteSlugs, slug: newSlugRaw } = body;

  if (!name || !category || !description) {
    return NextResponse.json({ error: "Nom, catégorie et description requis" }, { status: 400 });
  }

  const newSlug = newSlugRaw ? slugify(newSlugRaw) : figure.slug;
  if (newSlug !== figure.slug) {
    const clash = await prisma.figure.findUnique({ where: { slug: newSlug } });
    if (clash) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé par une autre figure" }, { status: 409 });
    }
  }

  const updated = await prisma.figure.update({
    where: { slug: params.slug },
    data: {
      slug: newSlug,
      name,
      category,
      description,
      steps: JSON.stringify(
        Array.isArray(steps) ? steps.filter(Boolean) : String(steps || "").split("\n").filter(Boolean)
      ),
      order: typeof order === "number" ? order : figure.order,
      prerequisites: {
        set: [], // on repart de zéro puis on reconnecte la sélection courante
        connect: (prerequisiteSlugs || []).map((s: string) => ({ slug: s })),
      },
    },
  });

  return NextResponse.json(updated);
}

// Suppression d'une figure
export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const figure = await prisma.figure.findUnique({ where: { slug: params.slug } });
  if (!figure) {
    return NextResponse.json({ error: "Figure introuvable" }, { status: 404 });
  }

  await prisma.figure.delete({ where: { slug: params.slug } });
  return NextResponse.json({ ok: true });
}
