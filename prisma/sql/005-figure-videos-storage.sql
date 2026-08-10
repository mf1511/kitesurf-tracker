-- =============================================================================
-- 005 · figure-videos-storage — Colonnes Video (Storage, multi-vidéos)
-- Ordre : après 004-figure-active
-- ATTENTION : DELETE FROM "Video" (anciens liens YouTube/Vimeo)
-- =============================================================================

-- Les anciennes rows étaient des liens YouTube/Vimeo — on repart propre
DELETE FROM "Video";

ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "storagePath" TEXT;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

-- storagePath obligatoire pour les nouvelles vidéos Storage
UPDATE "Video" SET "storagePath" = '' WHERE "storagePath" IS NULL;
ALTER TABLE "Video" ALTER COLUMN "storagePath" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Video_figureId_order_idx" ON "Video"("figureId", "order");
