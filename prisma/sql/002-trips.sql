-- =============================================================================
-- 002 · trips — Séjours kite (+ ancien modèle défis)
-- Ordre : après 001-community
-- =============================================================================

CREATE TABLE IF NOT EXISTS "Trip" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "description" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "inviteCode" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Trip_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Trip_inviteCode_key" ON "Trip"("inviteCode");
CREATE INDEX IF NOT EXISTS "Trip_startDate_endDate_idx" ON "Trip"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "Trip_creatorId_idx" ON "Trip"("creatorId");

CREATE TABLE IF NOT EXISTS "TripMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tripId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TripMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TripMember_tripId_userId_key" ON "TripMember"("tripId", "userId");
CREATE INDEX IF NOT EXISTS "TripMember_userId_idx" ON "TripMember"("userId");

CREATE TABLE IF NOT EXISTS "TripChallenge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tripId" TEXT NOT NULL,
  "figureId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "createdById" TEXT NOT NULL,
  "xpBonus" INTEGER NOT NULL DEFAULT 25,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TripChallenge_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TripChallenge_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TripChallenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TripChallenge_tripId_idx" ON "TripChallenge"("tripId");
