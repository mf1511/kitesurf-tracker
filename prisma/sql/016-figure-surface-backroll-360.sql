-- =============================================================================
-- 016 · figure Surface Backroll 360
-- Ordre : après 015-figure-surface-backroll-transition
-- =============================================================================

INSERT INTO "Figure" (
  "id",
  "slug",
  "name",
  "category",
  "description",
  "steps",
  "order",
  "active"
)
VALUES (
  'cmlsurfbk3600001surfacebr',
  'surface-backroll-360',
  'Surface Backroll 360',
  'Surface tricks & drags',
  'Backroll 360° plat / bas, proche de l''eau — rotation complète sans gros airtime.',
  '["Pop bas avec vitesse","Engager un backroll plat et compléter les 360°","Repérer l''eau tôt et réceptionner proprement"]',
  (SELECT COALESCE(MAX("order"), 0) + 1 FROM "Figure"),
  true
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "category" = EXCLUDED."category",
  "description" = EXCLUDED."description",
  "steps" = EXCLUDED."steps",
  "active" = EXCLUDED."active";

-- _Prerequisites : A = figure, B = prérequis (convention Prisma)
INSERT INTO "_Prerequisites" ("A", "B")
SELECT f.id, p.id
FROM "Figure" f
CROSS JOIN "Figure" p
WHERE f.slug = 'surface-backroll-360'
  AND p.slug IN ('backroll-simple', 'surface-backroll-transition')
ON CONFLICT DO NOTHING;
