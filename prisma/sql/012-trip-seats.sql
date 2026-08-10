-- =============================================================================
-- 012 · trip-seats — Places séjour (prénom + photo) pour invite façon Tricount
-- Ordre : après 011-pre-invites (+ bucket avatars)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "TripSeat" (
  "id"          TEXT PRIMARY KEY,
  "tripId"      TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "displayName" TEXT NOT NULL,
  "image"       TEXT,
  "imagePath"   TEXT,
  "order"       INTEGER NOT NULL DEFAULT 0,
  "claimedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "TripSeat_tripId_idx" ON "TripSeat"("tripId");
-- Un user = une place par séjour (plusieurs NULL ok en Postgres)
CREATE UNIQUE INDEX IF NOT EXISTS "TripSeat_tripId_claimedById_key"
  ON "TripSeat"("tripId", "claimedById");

-- Backfill : une place claimée pour chaque créateur de séjour existant
INSERT INTO "TripSeat" ("id", "tripId", "displayName", "image", "imagePath", "order", "claimedById", "createdAt")
SELECT
  'seat_' || t."id",
  t."id",
  COALESCE(NULLIF(TRIM(u."name"), ''), split_part(u."email", '@', 1)),
  u."image",
  u."imagePath",
  0,
  t."creatorId",
  CURRENT_TIMESTAMP
FROM "Trip" t
JOIN "User" u ON u."id" = t."creatorId"
WHERE NOT EXISTS (
  SELECT 1 FROM "TripSeat" s
  WHERE s."tripId" = t."id" AND s."claimedById" = t."creatorId"
);
