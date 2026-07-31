import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import TripCreateForm from "@/components/trip-create-form";

export default async function NewTripPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Link href="/trips" className="back-link">← Séjours</Link>
        <TripCreateForm />
      </div>
    </div>
  );
}
