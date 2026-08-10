-- =============================================================================
-- 001 · community — Invites + amitiés
-- Ordre : après User / Figure (schéma de base)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "Invite" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" DATETIME,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "maxUses" INTEGER NOT NULL DEFAULT 50,
  CONSTRAINT "Invite_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invite_code_key" ON "Invite"("code");
CREATE INDEX IF NOT EXISTS "Invite_creatorId_idx" ON "Invite"("creatorId");

CREATE TABLE IF NOT EXISTS "Friendship" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "requesterId" TEXT NOT NULL,
  "addresseeId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");
CREATE INDEX IF NOT EXISTS "Friendship_addresseeId_status_idx" ON "Friendship"("addresseeId", "status");
CREATE INDEX IF NOT EXISTS "Friendship_requesterId_status_idx" ON "Friendship"("requesterId", "status");
