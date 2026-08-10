import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import GearForm from "@/components/gear-form";

export default async function NewMaterielPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Link href="/materiel" className="back-link">
          ← Matériel
        </Link>
        <GearForm mode="create" />
      </div>
    </div>
  );
}
