import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run make-admin -- email@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Aucun compte trouvé pour ${email}. Crée d'abord le compte via /register.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`${email} est maintenant admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
