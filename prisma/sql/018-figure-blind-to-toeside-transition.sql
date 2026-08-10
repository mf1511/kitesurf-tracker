-- =============================================================================
-- 018 · figure Blind to Toeside Transition
-- Ordre : après 017-figure-backroll-to-toeside
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
  'cmlblind2toeside0001surf',
  'blind-to-toeside-transition',
  'Blind to Toeside Transition',
  'Surface tricks & drags',
  'Depuis le riding blind, pivoter pour repartir en toeside (transition de bord).',
  '["Stabiliser la glisse en blind","Pivoter hanches et regard vers le toeside","Repartir toeside dans le nouveau sens"]',
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
WHERE f.slug = 'blind-to-toeside-transition'
  AND p.slug IN ('riding-blind', 'toe-side-riding')
ON CONFLICT DO NOTHING;
