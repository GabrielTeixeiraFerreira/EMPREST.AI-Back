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
        assetTag: true,
        name: true,
        category: true,
        status: true,
        imagePath: true,
      },
    });

    const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;

    return equipment.map((item) => ({
      ...item,
      imageUrl:
        baseUrl && bucket && item.imagePath
          ? `${baseUrl}/storage/v1/object/public/${bucket}/${item.imagePath}`
          : null,
    }));
  }
}
