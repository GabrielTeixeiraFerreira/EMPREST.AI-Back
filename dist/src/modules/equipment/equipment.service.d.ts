import { PrismaService } from '../../prisma.service';
export declare class EquipmentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForTenant(slug: string, userId: string): Promise<{
        imageUrl: string | null;
        name: string;
        category: import(".prisma/client").$Enums.EquipmentCategory;
        assetTag: string;
        status: import(".prisma/client").$Enums.EquipmentStatus;
        imagePath: string | null;
    }[]>;
}
