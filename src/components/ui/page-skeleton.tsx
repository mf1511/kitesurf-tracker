/** Skeleton de page brandé (shimmer CSS) pour les loading.tsx App Router */
export default function PageSkeleton({
  cards = 4,
  hero = true,
}: {
  /** Nombre de blocs "carte" simulés */
  cards?: number;
  /** Affiche un bloc titre + sous-titre en tête */
  hero?: boolean;
}) {
  return (
    <div className="page-skeleton" aria-hidden>
      {hero && (
        <div className="skeleton-hero">
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-line w-60" />
        </div>
      )}
      <div className="skeleton-cards">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="skeleton-card">
            <span className="skeleton skeleton-line w-40" />
            <span className="skeleton skeleton-line w-90" />
            <span className="skeleton skeleton-line w-70" />
          </div>
        ))}
      </div>
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
