-- =============================================================================
-- 023 · figure-videos : limite bucket 100 Mo (alignée sur MAX_VIDEO_BYTES)
-- L’upgrade Pro n’élève pas file_size_limit du bucket (souvent resté à 50 Mo).
-- Ensuite : Dashboard → Storage → Settings → Global file size limit ≥ 100 MB
-- (la limite globale prime ; SQL seul ne suffit pas).
-- =============================================================================

UPDATE storage.buckets
SET file_size_limit = 104857600
WHERE id = 'figure-videos';
