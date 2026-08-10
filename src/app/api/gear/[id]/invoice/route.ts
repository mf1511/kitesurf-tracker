import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

/** Télécharger / afficher la facture jointe */
export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const gear = await prisma.gear.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { invoiceName: true, invoiceMime: true, invoiceData: true },
  });

  if (!gear?.invoiceData || !gear.invoiceName) {
    return NextResponse.json({ error: "Aucune facture" }, { status: 404 });
  }

  const body = Buffer.from(gear.invoiceData);
  return new NextResponse(body, {
    headers: {
      "Content-Type": gear.invoiceMime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(gear.invoiceName)}"`,
      "Content-Length": String(body.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
