import { PrismaService } from '../../prisma.service';
export declare class EquipmentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForTenant(slug: string, userId: string): Promise<{
        status: string;
        imageUrl: string | null;
        id: string;
        name: string;
        category: import(".prisma/client").$Enums.EquipmentCategory;
        assetTag: string;
        imagePath: string | null;
    }[]>;
}
