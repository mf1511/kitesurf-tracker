import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import OfflineManager from "@/components/offline-manager";
import OfflinePackButton from "@/components/offline-pack-button";

export default async function OfflinePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="figures-page">
      <Link href="/figures" className="back-link">
        ← Figures
      </Link>
      <h1>Hors-ligne</h1>
      <p className="figures-lead">
        Télécharge les tutos sur cet appareil pour les regarder sans réseau (PWA).
      </p>

      <section className="figure-block">
        <h2>Packs</h2>
        <OfflinePackButton label="Télécharger tout le catalogue actif" />
      </section>

      <section className="figure-block">
        <h2>Sur cet appareil</h2>
        <OfflineManager />
      </section>
    </div>
  );
}
