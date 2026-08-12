/** Fallback global discret (pages sans loading dédié) */
export default function RootLoading() {
  return (
    <div className="nav-loading-bar" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
