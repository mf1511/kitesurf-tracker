-- =============================================================================
-- 007 · gear — Matériel kite perso (aile, barre, planche…)
-- Ordre : après 006-figure-videos-storage-policies
-- =============================================================================

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
