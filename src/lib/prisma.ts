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
  const c = client as {
    tripSeat?: { findMany?: unknown };
    appSetting?: { upsert?: unknown };
  };
  return (
    typeof c.tripSeat?.findMany === "function" &&
    typeof c.appSetting?.upsert === "function"
  );
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

/**
 * Proxy lazy : chaque accès re-vérifie la fraîcheur du client.
 * Évite les 500 après `prisma generate` quand HMR garde un vieux singleton.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
