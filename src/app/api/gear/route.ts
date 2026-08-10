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

/** Liste du matériel de l'utilisateur (sans blob facture) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const items = await prisma.gear.findMany({
    where: { userId: session.user.id },
    select: {
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
    },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    gear: items.map((g) => serializeGear(g)),
  });
}

/** Créer une pièce de matériel (multipart : champs + facture optionnelle) */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }

  const parsed = parseGearFields({
    category: form.get("category") ?? "",
    brand: form.get("brand"),
    model: form.get("model") ?? "",
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

  // Facture optionnelle (PDF / image)
  let invoiceName: string | null = null;
  let invoiceMime: string | null = null;
  let invoiceData: Buffer | null = null;
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
    invoiceName = file.name.slice(0, 180) || "facture";
    invoiceMime = mime;
    invoiceData = Buffer.from(await file.arrayBuffer());
  }

  const gear = await prisma.gear.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
      sessionCount: parsed.data.sessionCount ?? 0,
      invoiceName,
      invoiceMime,
      invoiceData,
    },
    select: {
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
    },
  });

  return NextResponse.json({ gear: serializeGear(gear) });
}
