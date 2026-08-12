-- =============================================================================
-- Kitesurf Tracker — schéma COMPLET pour Supabase (PostgreSQL)
-- Greenfield uniquement : colle TOUT ce fichier d'un coup → Run
-- Si la base existe déjà : utilise les migrations numérotées 001…009
-- (voir prisma/sql/README.md)
-- Projet : https://psumzbomklrflallniuy.supabase.co
-- =============================================================================

-- User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "weightKg" DOUBLE PRECISION,
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
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "adminDone" BOOLEAN NOT NULL DEFAULT false
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

-- Video (fichiers Supabase Storage — bucket figure-videos)
CREATE TABLE IF NOT EXISTS "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "figureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "title" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Video_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Video_figureId_order_idx" ON "Video"("figureId", "order");

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

-- TripFigure (liste partagée du séjour)
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

-- TripMemberObjective (objectifs perso sur la liste)
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

-- Gear (matériel kite perso)
CREATE TABLE IF NOT EXISTS "Gear" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "brand" TEXT,
  "model" TEXT NOT NULL,
  "name" TEXT,
  "size" TEXT,
  "year" INTEGER,
  "purchaseDate" TIMESTAMP(3),
  "purchasePrice" DOUBLE PRECISION,
  "sessionCount" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "invoiceName" TEXT,
  "invoiceMime" TEXT,
  "invoiceData" BYTEA,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Gear_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Gear_userId_category_idx" ON "Gear"("userId", "category");
CREATE INDEX IF NOT EXISTS "Gear_userId_idx" ON "Gear"("userId");

-- Spot (coordonnées pour la météo Open-Meteo)
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

-- KiteSession (journal de sessions)
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

-- SessionGear (matériel utilisé par session)
CREATE TABLE IF NOT EXISTS "SessionGear" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "gearId" TEXT NOT NULL,
  CONSTRAINT "SessionGear_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "KiteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionGear_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "Gear"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SessionGear_sessionId_gearId_key" ON "SessionGear"("sessionId", "gearId");
CREATE INDEX IF NOT EXISTS "SessionGear_gearId_idx" ON "SessionGear"("gearId");

-- FigureNote (carnet de progression perso)
CREATE TABLE IF NOT EXISTS "FigureNote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FigureNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FigureNote_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "FigureNote_userId_figureId_key" ON "FigureNote"("userId", "figureId");

-- FigureFavorite (favoris perso)
CREATE TABLE IF NOT EXISTS "FigureFavorite" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FigureFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FigureFavorite_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "FigureFavorite_userId_figureId_key" ON "FigureFavorite"("userId", "figureId");
CREATE INDEX IF NOT EXISTS "FigureFavorite_userId_idx" ON "FigureFavorite"("userId");

-- Challenge (défis entre amis, gagnant dérivé de UserProgress)
CREATE TABLE IF NOT EXISTS "Challenge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "creatorId" TEXT NOT NULL,
  "opponentId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "deadline" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Challenge_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Challenge_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Challenge_creatorId_idx" ON "Challenge"("creatorId");
CREATE INDEX IF NOT EXISTS "Challenge_opponentId_idx" ON "Challenge"("opponentId");
