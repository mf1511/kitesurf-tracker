-- Figure.active : visible ou non sur la page Figures des users
-- À exécuter toi-même dans Supabase SQL Editor.

ALTER TABLE "Figure" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
