-- =============================================================================
-- 017 · figure Backroll to Toeside
-- Ordre : après 016-figure-surface-backroll-360
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
  'cmlbrtoetoeside0001bigair',
  'backroll-to-toeside',
  'Backroll to Toeside',
  'Sauts & Big Air',
  'Backroll heel-side réceptionné en toeside.',
  '["Initier un backroll heel-side classique","Orienter hanches et regard pour atterrir toeside","Stabiliser la glisse toeside à la réception"]',
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
WHERE f.slug = 'backroll-to-toeside'
  AND p.slug IN ('backroll-simple', 'toe-side-riding')
ON CONFLICT DO NOTHING;
