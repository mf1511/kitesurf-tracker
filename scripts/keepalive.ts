/**
 * Ping Postgres (Supabase) pour éviter la pause auto du free tier.
 * Usage : npm run db:keepalive
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe<Array<{ ok: number }>>("SELECT 1 AS ok");
  console.log(`[keepalive] ok @ ${new Date().toISOString()}`, rows);
}

main()
  .catch((err) => {
    console.error("[keepalive] failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
