-- =============================================================================
-- 015 · figure Surface Backroll Transition
-- Ordre : après 014 (données, pas de schema)
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
  'cmlsurfbktrn0001surfacebr',
  'surface-backroll-transition',
  'Surface Backroll Transition',
  'Surface tricks & drags',
  'Backroll bas / plat utilisé comme transition de bord, proche de l''eau (sans gros boost).',
  '["Vitesse et carre pour un pop bas","Initier un backroll plat sans chercher la hauteur","Réceptionner dans le nouveau sens et accélérer"]',
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
WHERE f.slug = 'surface-backroll-transition'
  AND p.slug IN ('backroll-simple', 'transition-simple')
ON CONFLICT DO NOTHING;
