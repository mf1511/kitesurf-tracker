-- =============================================================================
-- 009 · notes & défis — Carnet de progression par figure + défis entre amis
-- Ordre : après 008-sessions-spots
-- =============================================================================

-- Note perso du rider sur une figure (carnet de progression)
CREATE TABLE IF NOT EXISTS "FigureNote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FigureNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FigureNote_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "FigureNote_userId_figureId_key" ON "FigureNote"("userId", "figureId");

-- Défi entre amis : premier à valider la figure avant la deadline
-- (le gagnant est dérivé de UserProgress.completedAt, pas stocké)
CREATE TABLE IF NOT EXISTS "Challenge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "creatorId" TEXT NOT NULL,
  "opponentId" TEXT NOT NULL,
  "figureId" TEXT NOT NULL,
  "deadline" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Challenge_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Challenge_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Challenge_creatorId_idx" ON "Challenge"("creatorId");
CREATE INDEX IF NOT EXISTS "Challenge_opponentId_idx" ON "Challenge"("opponentId");
