import Link from "next/link";

export default function NotFound() {
  return (
    <div className="route-error">
      <h1>404 — Hors zone de nav&apos;</h1>
      <p>Cette page n&apos;existe pas (ou plus). Reviens sur le spot.</p>
      <div className="route-error-actions">
        <Link href="/dashboard" className="btn btn-primary">
          Retour au dashboard
        </Link>
        <Link href="/figures" className="btn btn-secondary">
          Voir les figures
        </Link>
      </div>
    </div>
  );
}
