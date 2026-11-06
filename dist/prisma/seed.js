"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TEST_USER_EMAIL = "userTeste@emprest.ai";
const TEST_USER_PASSWORD = "123456";
function requiredEnvironment(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
async function supabaseAdminRequest(baseUrl, secretKey, path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Supabase Admin API request failed (${response.status}): ${body}`);
    }
    return (await response.json());
}
async function ensureTestUser() {
    const supabaseUrl = requiredEnvironment("SUPABASE_URL").replace(/\/$/, "");
    const secretKey = requiredEnvironment("SUPABASE_SECRET_KEY");
    const users = await supabaseAdminRequest(supabaseUrl, secretKey, "/auth/v1/admin/users?per_page=1000");
    const existingUser = users.users.find((user) => user.email?.toLowerCase() === TEST_USER_EMAIL);
    if (existingUser) {
        await supabaseAdminRequest(supabaseUrl, secretKey, `/auth/v1/admin/users/${existingUser.id}`, {
            method: "PUT",
            body: JSON.stringify({
                password: TEST_USER_PASSWORD,
                email_confirm: true,
            }),
        });
        return existingUser.id;
    }
    const createdUser = await supabaseAdminRequest(supabaseUrl, secretKey, "/auth/v1/admin/users", {
        method: "POST",
        body: JSON.stringify({
            email: TEST_USER_EMAIL,
            password: TEST_USER_PASSWORD,
            email_confirm: true,
        }),
    });
    return createdUser.id;
}
async function main() {
    const tenant = await prisma.tenant.upsert({
        where: { slug: "suporte_ti" },
        update: { name: "Suporte de TI" },
        create: { slug: "suporte_ti", name: "Suporte de TI" },
    });
    const equipment = [
        { assetTag: "TI-0001", name: "Notebook 14 polegadas", category: "notebook", status: "available", imagePath: "ti-0001.jpg" },
        { assetTag: "TI-0002", name: "Notebook 15 polegadas", category: "notebook", status: "available", imagePath: "ti-0002.jpg" },
        { assetTag: "TI-0003", name: "Notebook 13 polegadas", category: "notebook", status: "available", imagePath: "ti-0003.jpg" },
        { assetTag: "TI-0004", name: "Notebook 15 polegadas", category: "notebook", status: "maintenance", imagePath: "ti-0004.jpg" },
        { assetTag: "TI-0005", name: "Monitor 24 polegadas", category: "monitor", status: "available", imagePath: "ti-0005.jpg" },
        { assetTag: "TI-0006", name: "Monitor 27 polegadas", category: "monitor", status: "available", imagePath: "ti-0006.jpg" },
        { assetTag: "TI-0007", name: "Monitor 22 polegadas", category: "monitor", status: "maintenance", imagePath: "ti-0007.jpg" },
        { assetTag: "TI-0008", name: "Cabo HDMI 2 m", category: "cable", status: "available", imagePath: "ti-0008.jpg" },
        { assetTag: "TI-0009", name: "Cabo USB-C 1 m", category: "cable", status: "available", imagePath: "ti-0009.jpg" },
        { assetTag: "TI-0010", name: "Cabo de rede 3 m", category: "cable", status: "maintenance", imagePath: "ti-0010.jpg" },
        { assetTag: "TI-0011", name: "Webcam Full HD", category: "camera", status: "available", imagePath: "ti-0011.jpg" },
        { assetTag: "TI-0012", name: "Câmera compacta", category: "camera", status: "available", imagePath: "ti-0012.jpg" },
    ];
    for (const item of equipment) {
        await prisma.equipment.upsert({
            where: {
                tenantId_assetTag: {
                    tenantId: tenant.id,
                    assetTag: item.assetTag,
                },
            },
            update: {
                name: item.name,
                category: item.category,
                status: item.status,
                imagePath: item.imagePath,
            },
            create: {
                tenantId: tenant.id,
                assetTag: item.assetTag,
                name: item.name,
                category: item.category,
                status: item.status,
                imagePath: item.imagePath,
            },
        });
    }
    const testUserId = await ensureTestUser();
    await prisma.membership.upsert({
        where: {
            userId_tenantId: {
                userId: testUserId,
                tenantId: tenant.id,
            },
        },
        update: { role: "collaborator" },
        create: {
            userId: testUserId,
            tenantId: tenant.id,
            role: "collaborator",
        },
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