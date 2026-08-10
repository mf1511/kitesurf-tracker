-- =============================================================================
-- 006 · figure-videos-storage-policies — Policies bucket figure-videos
-- Ordre : après 005 + création manuelle du bucket PUBLIC « figure-videos »
-- Les uploads admin passent par la service role (bypass RLS) côté Next.js.
-- =============================================================================

-- Lecture publique des objets du bucket
DROP POLICY IF EXISTS "figure_videos_public_read" ON storage.objects;
CREATE POLICY "figure_videos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'figure-videos');

-- Note : INSERT/UPDATE/DELETE restent réservés à la service role
-- (pas de policy anon/authenticated d’écriture).
