/**
 * Copie User + UserProgress (+ vidéos) depuis prisma/dev.db (SQLite)
 * vers DATABASE_URL (Supabase Postgres).
 *
 * Usage: npx tsx scripts/migrate-sqlite-to-supabase.ts
 */
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";

const sqlitePath = path.join(process.cwd(), "prisma", "dev.db");
const prisma = new PrismaClient();

function sqliteJson<T>(sql: string): T[] {
  const out = execSync(
    `sqlite3 -json ${JSON.stringify(sqlitePath)} ${JSON.stringify(sql)}`,
    { encoding: "utf8" }
  ).trim();
  if (!out) return [];
  return JSON.parse(out) as T[];
}

async function main() {
  const users = sqliteJson<{
    id: string;
    email: string;
    password: string;
    name: string | null;
    role: string;
    createdAt: string;
  }>("SELECT id, email, password, name, role, createdAt FROM User");

  const sqliteFigures = sqliteJson<{ id: string; slug: string }>(
    "SELECT id, slug FROM Figure"
  );
  const progress = sqliteJson<{
    userId: string;
    figureId: string;
    completedAt: string | null;
  }>("SELECT userId, figureId, completedAt FROM UserProgress WHERE completed = 1");

  const videos = sqliteJson<{
    userId: string;
    figureId: string;
    url: string;
    title: string | null;
    createdAt: string;
  }>("SELECT userId, figureId, url, title, createdAt FROM Video");

  console.log(
    `SQLite → users=${users.length} progress=${progress.length} videos=${videos.length}`
  );

  const slugByOldId = new Map(sqliteFigures.map((f) => [f.id, f.slug]));
  const pgFigures = await prisma.figure.findMany({ select: { id: true, slug: true } });
  const newIdBySlug = new Map(pgFigures.map((f) => [f.slug, f.id]));

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: u.password, name: u.name, role: u.role },
      create: {
        id: u.id,
        email: u.email,
        password: u.password,
        name: u.name,
        role: u.role,
        createdAt: new Date(u.createdAt),
      },
    });
    console.log(`✓ user ${u.email}`);
  }

  const oldUserIdToNew = new Map<string, string>();
  for (const u of users) {
    const row = await prisma.user.findUnique({ where: { email: u.email } });
    if (row) oldUserIdToNew.set(u.id, row.id);
  }

  let migrated = 0;
  let skipped = 0;
  for (const p of progress) {
    const newUserId = oldUserIdToNew.get(p.userId);
    const slug = slugByOldId.get(p.figureId);
    const newFigureId = slug ? newIdBySlug.get(slug) : undefined;
    if (!newUserId || !newFigureId) {
      skipped++;
      continue;
    }
    await prisma.userProgress.upsert({
      where: { userId_figureId: { userId: newUserId, figureId: newFigureId } },
      update: {
        completed: true,
        completedAt: p.completedAt ? new Date(p.completedAt) : new Date(),
      },
      create: {
        userId: newUserId,
        figureId: newFigureId,
        completed: true,
        completedAt: p.completedAt ? new Date(p.completedAt) : new Date(),
      },
    });
    migrated++;
  }
  console.log(`✓ progress: ${migrated} (skipped ${skipped})`);

  let vOk = 0;
  for (const v of videos) {
    const newUserId = oldUserIdToNew.get(v.userId);
    const slug = slugByOldId.get(v.figureId);
    const newFigureId = slug ? newIdBySlug.get(slug) : undefined;
    if (!newUserId || !newFigureId) continue;
    const existing = await prisma.video.findFirst({
      where: { userId: newUserId, figureId: newFigureId, url: v.url },
    });
    if (existing) continue;
    await prisma.video.create({
      data: {
        userId: newUserId,
        figureId: newFigureId,
        url: v.url,
        title: v.title,
        createdAt: new Date(v.createdAt),
      },
    });
    vOk++;
  }
  console.log(`✓ videos: ${vOk}`);

  console.log("Supabase now:", {
    users: await prisma.user.count(),
    figures: await prisma.figure.count(),
    progress: await prisma.userProgress.count({ where: { completed: true } }),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
