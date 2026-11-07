import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

const OPEN_LOAN_LIMIT = 5;
const BUSINESS_DAYS = 14;

@Injectable()
export class LoanService {
  constructor(private readonly prisma: PrismaService) {}

  async listOpenForUser(tenantSlug: string, userId: string) {
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

  async create(tenantSlug: string, userId: string, equipmentId?: string) {
    if (!equipmentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(equipmentId)) {
      throw new BadRequestException('Equipamento obrigatório.');
    }

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
        const tenant = await transaction.tenant.findFirst({
          where: { slug: tenantSlug, memberships: { some: { userId } } },
          select: { id: true },
        });
        if (!tenant) {
          throw new ForbiddenException('Colaborador não pertence ao tenant.');
        }

        const locked = await transaction.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`SELECT id FROM equipment WHERE id = ${equipmentId}::uuid AND tenant_id = ${tenant.id}::uuid FOR UPDATE`,
        );
        if (!locked.length) {
          throw new ConflictException('Equipamento indisponível.');
        }

        const equipment = await transaction.equipment.findUnique({
          where: { id: equipmentId },
          select: { id: true, status: true },
        });
        if (!equipment || equipment.status !== 'available') {
          throw new ConflictException('Equipamento indisponível.');
        }

        const openLoans = await transaction.loan.findMany({
          where: { tenantId: tenant.id, borrowerId: userId, returnedAt: null },
          select: { dueAt: true },
        });
        if (openLoans.length >= OPEN_LOAN_LIMIT) {
          throw new ConflictException('Limite de 5 empréstimos em aberto atingido.');
        }
        if (openLoans.some(({ dueAt }) => dueAt.getTime() < Date.now())) {
          throw new ConflictException(
            'Não é possível solicitar enquanto houver empréstimo em atraso.',
          );
        }

        const activeEquipmentLoan = await transaction.loan.findFirst({
          where: { equipmentId, returnedAt: null },
          select: { id: true },
        });
        if (activeEquipmentLoan) {
          throw new ConflictException('Equipamento indisponível.');
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
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException('Equipamento indisponível neste momento.');
      }
      throw error;
    }
  }
}

function addBusinessDays(start: Date, days: number): Date {
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
