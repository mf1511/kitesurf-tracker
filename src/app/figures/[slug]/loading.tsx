/** Skeleton léger fiche figure seulement (pas la liste) */
export default function FigureDetailLoading() {
  return (
    <div className="page-skeleton figure-detail-skeleton" aria-hidden>
      <span className="skeleton skeleton-line w-40" />
      <span className="skeleton skeleton-title" />
      <span className="skeleton skeleton-line w-60" />
      <span className="sr-only">Chargement de la figure…</span>
    </div>
  );
}
