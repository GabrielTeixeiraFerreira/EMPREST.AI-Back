import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async listForTenant(slug: string, userId: string) {
    const equipment = await this.prisma.equipment.findMany({
      where: {
        tenant: {
          slug,
          memberships: { some: { userId } },
        },
      },
      orderBy: { assetTag: 'asc' },
      select: {
        id: true,
        assetTag: true,
        name: true,
        category: true,
        status: true,
        imagePath: true,
        loans: {
          where: { returnedAt: null },
          select: { id: true },
          take: 1,
        },
      },
    });

    const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');

    return equipment.map(({ loans, ...item }) => ({
      ...item,
      status: item.status === 'maintenance'
        ? 'maintenance'
        : loans.length > 0
          ? 'loaned'
          : 'available',
      imageUrl:
        baseUrl && item.imagePath
          ? `${baseUrl}/storage/v1/object/public/equipamentos/images/equipamentos/${item.imagePath}`
          : null,
    }));
  }
}
