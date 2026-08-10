import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isAllowedInvoiceMime,
  MAX_INVOICE_BYTES,
  parseGearFields,
  serializeGear,
} from "@/lib/gear";

type Ctx = { params: { id: string } };

const gearSelect = {
  id: true,
  userId: true,
  category: true,
  brand: true,
  model: true,
  name: true,
  size: true,
  year: true,
  purchaseDate: true,
  purchasePrice: true,
  sessionCount: true,
  notes: true,
  invoiceName: true,
  invoiceMime: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function ownedGear(userId: string, id: string) {
  return prisma.gear.findFirst({
    where: { id, userId },
    select: gearSelect,
  });
}

/** Détail d'une pièce (sans blob) */
export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const gear = await ownedGear(session.user.id, params.id);
  if (!gear) {
    return NextResponse.json({ error: "Matériel introuvable" }, { status: 404 });
  }

  return NextResponse.json({ gear: serializeGear(gear) });
}

/**
 * Mise à jour : multipart (champs + facture) OU JSON
 * JSON spécial : { action: "session", delta: 1 | -1 } pour +/- sorties
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await ownedGear(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ error: "Matériel introuvable" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") || "";

  // Compteur de sorties (JSON léger)
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    if (body?.action === "session") {
      const delta = Number(body.delta);
      if (delta !== 1 && delta !== -1) {
        return NextResponse.json({ error: "delta doit être 1 ou -1" }, { status: 400 });
      }
      const next = Math.max(0, existing.sessionCount + delta);
      const gear = await prisma.gear.update({
        where: { id: existing.id },
        data: { sessionCount: next },
        select: gearSelect,
      });
      return NextResponse.json({ gear: serializeGear(gear) });
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }

  const parsed = parseGearFields({
    category: form.get("category") ?? existing.category,
    brand: form.get("brand"),
    model: form.get("model") ?? existing.model,
    name: form.get("name"),
    size: form.get("size"),
    year: form.get("year"),
    purchaseDate: form.get("purchaseDate"),
    purchasePrice: form.get("purchasePrice"),
    notes: form.get("notes"),
    sessionCount: form.get("sessionCount"),
  });
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };

  // Remplacer / supprimer la facture
  const removeInvoice = form.get("removeInvoice") === "1";
  if (removeInvoice) {
    data.invoiceName = null;
    data.invoiceMime = null;
    data.invoiceData = null;
  }

  const file = form.get("invoice");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_INVOICE_BYTES) {
      return NextResponse.json({ error: "Facture trop lourde (max 4 Mo)" }, { status: 400 });
    }
    const mime = file.type || "application/octet-stream";
    if (!isAllowedInvoiceMime(mime)) {
      return NextResponse.json(
        { error: "Facture : PDF ou image (JPEG, PNG, WebP) uniquement" },
        { status: 400 }
      );
    }
    data.invoiceName = file.name.slice(0, 180) || "facture";
    data.invoiceMime = mime;
    data.invoiceData = Buffer.from(await file.arrayBuffer());
  }

  const gear = await prisma.gear.update({
    where: { id: existing.id },
    data,
    select: gearSelect,
  });

  return NextResponse.json({ gear: serializeGear(gear) });
}

/** Supprimer une pièce */
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await ownedGear(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ error: "Matériel introuvable" }, { status: 404 });
  }

  await prisma.gear.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
