-- =============================================================================
-- 022 · app-settings — clé/valeur (ordre catégories catalogue)
-- Ordre : après 021-figure-favorites
-- =============================================================================

CREATE TABLE IF NOT EXISTS "AppSetting" (
  "key"   TEXT NOT NULL PRIMARY KEY,
  "value" TEXT NOT NULL
);

-- Ordre initial des mondes (aligné sur CATEGORY_ORDER historique)
INSERT INTO "AppSetting" ("key", "value")
VALUES (
  'category_order',
  '["Débuter","Bonus","Sécurité","Tutoriels","Kitefoil","Wingfoil","Strapless"]'
)
ON CONFLICT ("key") DO NOTHING;
