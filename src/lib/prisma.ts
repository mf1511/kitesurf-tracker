import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function isFreshClient(client: PrismaClient) {
  // Après `prisma generate`, l’ancien singleton global peut manquer de modèles
  return typeof (client as { tripSeat?: { findMany?: unknown } }).tripSeat
    ?.findMany === "function";
}

function getPrisma() {
  const existing = globalForPrisma.prisma;
  if (existing && isFreshClient(existing)) return existing;

  if (existing) {
    void existing.$disconnect().catch(() => {});
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrisma();
