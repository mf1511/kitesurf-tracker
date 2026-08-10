import Link from "next/link";
import OfflineManager from "@/components/offline-manager";

/**
 * Fallback document PWA (next-pwa) quand une navigation échoue hors-ligne.
 * Pas d’auth serveur : doit marcher sans réseau.
 */
export default function OfflineFallbackPage() {
  return (
    <div className="figures-page">
      <Link href="/offline" className="back-link">
        ← Hors-ligne
      </Link>
      <h1>Mode hors-ligne</h1>
      <p className="figures-lead">
        Pas de réseau pour cette page. Regarde tes vidéos déjà téléchargées
        ci-dessous.
      </p>
      <section className="figure-block">
        <h2>Sur cet appareil</h2>
        <OfflineManager />
      </section>
    </div>
  );
}
