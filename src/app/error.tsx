"use client";

import { useEffect } from "react";

/** Error boundary global : log + relance sans perdre la session */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[KiteQuest] Erreur de rendu :", error);
  }, [error]);

  return (
    <div className="route-error">
      <h1>Oups, ça a déventé.</h1>
      <p>
        Une erreur est survenue pendant le chargement de cette page. Réessaie —
        si ça persiste, recharge l&apos;app.
      </p>
      <div className="route-error-actions">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Réessayer
        </button>
        <a href="/dashboard" className="btn btn-secondary">
          Retour au dashboard
        </a>
      </div>
    </div>
  );
}
