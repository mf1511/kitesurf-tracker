-- =============================================================================
-- 004 · figure-active — Colonne Figure.active
-- Ordre : après 003-trip-objectives
-- =============================================================================

ALTER TABLE "Figure" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
