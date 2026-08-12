/** Indicateur discret — évite de tout remplacer par un gros skeleton */
export default function DashboardLoading() {
  return (
    <div className="nav-loading-bar" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
