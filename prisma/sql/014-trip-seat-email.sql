-- =============================================================================
-- 014 · trip-seats — email optionnel sur une place (invite prénom + email + photo)
-- Ordre : après 013-spot-coords-optional
-- =============================================================================

ALTER TABLE "TripSeat" ADD COLUMN IF NOT EXISTS "email" TEXT;
