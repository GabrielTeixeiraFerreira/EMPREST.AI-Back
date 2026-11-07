"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
const OPEN_LOAN_LIMIT = 5;
const BUSINESS_DAYS = 14;
let LoanService = class LoanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listOpenForUser(tenantSlug, userId) {
        const loans = await this.prisma.loan.findMany({
            where: {
                borrowerId: userId,
                returnedAt: null,
                tenant: {
                    slug: tenantSlug,
                    memberships: { some: { userId } },
                },
            },
            orderBy: { dueAt: 'asc' },
            select: {
                id: true,
                equipment: {
                    select: { id: true, assetTag: true, name: true, category: true, imagePath: true },
                },
                borrowedAt: true,
                dueAt: true,
            },
        });
        return loans;
    }
    async create(tenantSlug, userId, equipmentId) {
        if (!equipmentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(equipmentId)) {
            throw new common_1.BadRequestException('Equipamento obrigatório.');
        }
        try {
            return await this.prisma.$transaction(async (transaction) => {
                const tenant = await transaction.tenant.findFirst({
                    where: { slug: tenantSlug, memberships: { some: { userId } } },
                    select: { id: true },
                });
                if (!tenant) {
                    throw new common_1.ForbiddenException('Colaborador não pertence ao tenant.');
                }
                const locked = await transaction.$queryRaw(client_1.Prisma.sql `SELECT id FROM equipment WHERE id = ${equipmentId}::uuid AND tenant_id = ${tenant.id}::uuid FOR UPDATE`);
                if (!locked.length) {
                    throw new common_1.ConflictException('Equipamento indisponível.');
                }
                const equipment = await transaction.equipment.findUnique({
                    where: { id: equipmentId },
                    select: { id: true, status: true },
                });
                if (!equipment || equipment.status !== 'available') {
                    throw new common_1.ConflictException('Equipamento indisponível.');
                }
                const openLoans = await transaction.loan.findMany({
                    where: { tenantId: tenant.id, borrowerId: userId, returnedAt: null },
                    select: { dueAt: true },
                });
                if (openLoans.length >= OPEN_LOAN_LIMIT) {
                    throw new common_1.ConflictException('Limite de 5 empréstimos em aberto atingido.');
                }
                if (openLoans.some(({ dueAt }) => dueAt.getTime() < Date.now())) {
                    throw new common_1.ConflictException('Não é possível solicitar enquanto houver empréstimo em atraso.');
                }
                const activeEquipmentLoan = await transaction.loan.findFirst({
                    where: { equipmentId, returnedAt: null },
                    select: { id: true },
                });
                if (activeEquipmentLoan) {
                    throw new common_1.ConflictException('Equipamento indisponível.');
                }
                const borrowedAt = new Date();
                const dueAt = addBusinessDays(borrowedAt, BUSINESS_DAYS);
                return transaction.loan.create({
                    data: { tenantId: tenant.id, equipmentId, borrowerId: userId, borrowedAt, dueAt },
                    select: {
                        id: true,
                        equipmentId: true,
                        borrowedAt: true,
                        dueAt: true,
                    },
                });
            }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
                throw new common_1.ConflictException('Equipamento indisponível neste momento.');
            }
            throw error;
        }
    }
};
exports.LoanService = LoanService;
exports.LoanService = LoanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoanService);
function addBusinessDays(start, days) {
    const result = new Date(start);
    let remaining = days;
    while (remaining > 0) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) {
            remaining -= 1;
        }
    }
    return result;
}
//# sourceMappingURL=loan.service.js.map