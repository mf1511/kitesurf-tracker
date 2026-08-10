-- =============================================================================
-- 013 · spots — latitude / longitude optionnelles (plus saisies dans l’UI)
-- Ordre : après 012-trip-seats
-- =============================================================================

ALTER TABLE "Spot" ALTER COLUMN "latitude" DROP NOT NULL;
ALTER TABLE "Spot" ALTER COLUMN "longitude" DROP NOT NULL;
