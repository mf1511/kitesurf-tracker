import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GearForm from "@/components/gear-form";

type Props = { params: { id: string } };

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditMaterielPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const gear = await prisma.gear.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: {
      id: true,
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
    },
  });

  if (!gear) notFound();

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Link href={`/materiel/${gear.id}`} className="back-link">
          ← Retour
        </Link>
        <GearForm
          mode="edit"
          initial={{
            id: gear.id,
            category: gear.category,
            brand: gear.brand ?? "",
            model: gear.model,
            name: gear.name ?? "",
            size: gear.size ?? "",
            year: gear.year != null ? String(gear.year) : "",
            purchaseDate: toDateInput(gear.purchaseDate),
            purchasePrice:
              gear.purchasePrice != null ? String(gear.purchasePrice) : "",
            sessionCount: String(gear.sessionCount),
            notes: gear.notes ?? "",
            invoiceName: gear.invoiceName,
          }}
        />
      </div>
    </div>
  );
}
