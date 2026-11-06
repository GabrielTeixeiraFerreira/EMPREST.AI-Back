import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async listForTenant(slug: string, userId: string) {
    return this.prisma.equipment.findMany({
      where: {
        tenant: {
          slug,
          memberships: { some: { userId } },
        },
      },
      orderBy: { assetTag: 'asc' },
      select: {
        assetTag: true,
        name: true,
        category: true,
        status: true,
        imagePath: true,
      },
    });
  }
}
