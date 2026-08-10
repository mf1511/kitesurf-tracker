-- =============================================================================
-- 011 · pre-invites — Pré-invitations admin (email, nom, photo) + inscription fermée
-- Ordre : après 010-user-avatar (bucket avatars déjà créé)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "PreInvite" (
  "id"         TEXT PRIMARY KEY,
  "email"      TEXT NOT NULL,
  "name"       TEXT,
  "image"      TEXT,
  "imagePath"  TEXT,
  "code"       TEXT NOT NULL,
  "creatorId"  TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usedAt"     TIMESTAMP(3),
  "usedById"   TEXT REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "PreInvite_email_key" ON "PreInvite"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "PreInvite_code_key" ON "PreInvite"("code");
CREATE INDEX IF NOT EXISTS "PreInvite_creatorId_idx" ON "PreInvite"("creatorId");
CREATE INDEX IF NOT EXISTS "PreInvite_usedAt_idx" ON "PreInvite"("usedAt");
