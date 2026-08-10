-- Remplace les défis par : liste de figures du séjour + objectifs perso
-- À exécuter toi-même dans Supabase SQL Editor.

-- Ancien système défis
DROP TABLE IF EXISTS "TripChallenge";

-- Figures partagées du séjour
CREATE TABLE IF NOT EXISTS "TripFigure" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tripId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "addedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TripFigure_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TripFigure_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TripFigure_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TripFigure_tripId_figureId_key" ON "TripFigure"("tripId", "figureId");
CREATE INDEX IF NOT EXISTS "TripFigure_tripId_idx" ON "TripFigure"("tripId");

-- Objectifs personnels (subset de la liste, par rider)
CREATE TABLE IF NOT EXISTS "TripMemberObjective" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tripId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TripMemberObjective_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TripMemberObjective_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TripMemberObjective_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TripMemberObjective_tripId_userId_figureId_key" ON "TripMemberObjective"("tripId", "userId", "figureId");
CREATE INDEX IF NOT EXISTS "TripMemberObjective_tripId_userId_idx" ON "TripMemberObjective"("tripId", "userId");
CREATE INDEX IF NOT EXISTS "TripMemberObjective_tripId_figureId_idx" ON "TripMemberObjective"("tripId", "figureId");
