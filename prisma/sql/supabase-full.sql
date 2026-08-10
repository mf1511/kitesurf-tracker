-- =============================================================================
-- Kitesurf Tracker — schéma COMPLET pour Supabase (PostgreSQL)
-- Colle TOUT ce fichier d'un coup dans SQL Editor → Run
-- Projet : https://psumzbomklrflallniuy.supabase.co
-- =============================================================================

-- User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Figure
CREATE TABLE IF NOT EXISTS "Figure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS "Figure_slug_key" ON "Figure"("slug");

-- UserProgress
CREATE TABLE IF NOT EXISTS "UserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "figureId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserProgress_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserProgress_userId_figureId_key" ON "UserProgress"("userId", "figureId");

-- Video
CREATE TABLE IF NOT EXISTS "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "figureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Video_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Prérequis figures (many-to-many Prisma)
CREATE TABLE IF NOT EXISTS "_Prerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Prerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Prerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "_Prerequisites_AB_unique" ON "_Prerequisites"("A", "B");
CREATE INDEX IF NOT EXISTS "_Prerequisites_B_index" ON "_Prerequisites"("B");

-- Friendship
CREATE TABLE IF NOT EXISTS "Friendship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Friendship_addresseeId_status_idx" ON "Friendship"("addresseeId", "status");
CREATE INDEX IF NOT EXISTS "Friendship_requesterId_status_idx" ON "Friendship"("requesterId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");

-- Invite
CREATE TABLE IF NOT EXISTS "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER NOT NULL DEFAULT 50,
    CONSTRAINT "Invite_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Invite_code_key" ON "Invite"("code");
CREATE INDEX IF NOT EXISTS "Invite_creatorId_idx" ON "Invite"("creatorId");

-- Trip
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
    CONSTRAINT "Trip_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Trip_inviteCode_key" ON "Trip"("inviteCode");
CREATE INDEX IF NOT EXISTS "Trip_startDate_endDate_idx" ON "Trip"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "Trip_creatorId_idx" ON "Trip"("creatorId");

-- TripMember
CREATE TABLE IF NOT EXISTS "TripMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TripMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "TripMember_userId_idx" ON "TripMember"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TripMember_tripId_userId_key" ON "TripMember"("tripId", "userId");

-- TripChallenge
CREATE TABLE IF NOT EXISTS "TripChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "figureId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "xpBonus" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripChallenge_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TripChallenge_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TripChallenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "TripChallenge_tripId_idx" ON "TripChallenge"("tripId");
