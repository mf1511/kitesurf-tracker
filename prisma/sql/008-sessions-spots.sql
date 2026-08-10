-- =============================================================================
-- 008 · sessions & spots — Journal de sessions, spots météo, poids rider
-- Ordre : après 007-gear
-- =============================================================================

-- Poids du rider (kg) pour l'assistant taille d'aile
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weightKg" DOUBLE PRECISION;

-- Spot de kite perso (coordonnées utilisées pour la météo Open-Meteo)
CREATE TABLE IF NOT EXISTS "Spot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "windOrientation" TEXT,
  "waterType" TEXT,
  "favorite" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Spot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Spot_userId_favorite_idx" ON "Spot"("userId", "favorite");

-- Session kite loggée (journal)
CREATE TABLE IF NOT EXISTS "KiteSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "spotId" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "durationMin" INTEGER,
  "windKnots" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KiteSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "KiteSession_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "KiteSession_userId_date_idx" ON "KiteSession"("userId", "date");

-- Matériel utilisé pendant une session (compteur de sorties automatique)
CREATE TABLE IF NOT EXISTS "SessionGear" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "gearId" TEXT NOT NULL,
  CONSTRAINT "SessionGear_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "KiteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionGear_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "Gear"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SessionGear_sessionId_gearId_key" ON "SessionGear"("sessionId", "gearId");
CREATE INDEX IF NOT EXISTS "SessionGear_gearId_idx" ON "SessionGear"("gearId");
