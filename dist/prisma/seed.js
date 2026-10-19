"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=seed.js.map