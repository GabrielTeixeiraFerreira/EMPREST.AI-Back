import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.tenant.upsert({
    where: { slug: "suporte_ti" },
    update: { name: "Suporte de TI" },
    create: { slug: "suporte_ti", name: "Suporte de TI" },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
