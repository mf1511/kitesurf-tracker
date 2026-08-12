-- =============================================================================
-- 021 · favoris figures — FigureFavorite (Mes Favoris)
-- Ordre : après 020-figure-admin-done
-- =============================================================================

CREATE TABLE IF NOT EXISTS "FigureFavorite" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FigureFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FigureFavorite_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "FigureFavorite_userId_figureId_key"
  ON "FigureFavorite"("userId", "figureId");

CREATE INDEX IF NOT EXISTS "FigureFavorite_userId_idx"
  ON "FigureFavorite"("userId");
