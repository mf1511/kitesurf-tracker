-- =============================================================================
-- 020 · figure-admin-done — Suivi avancement curation admin (hors progression rider)
-- Ordre : après 019-user-username
-- =============================================================================

ALTER TABLE "Figure" ADD COLUMN IF NOT EXISTS "adminDone" BOOLEAN NOT NULL DEFAULT false;
