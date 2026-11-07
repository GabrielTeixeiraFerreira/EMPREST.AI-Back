import { PrismaService } from '../../prisma.service';
export declare class LoanService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listOpenForUser(tenantSlug: string, userId: string): Promise<{
        id: string;
        borrowedAt: Date;
        dueAt: Date;
        equipment: {
            id: string;
            name: string;
            category: import(".prisma/client").$Enums.EquipmentCategory;
            assetTag: string;
            imagePath: string | null;
        };
    }[]>;
    create(tenantSlug: string, userId: string, equipmentId?: string): Promise<{
        id: string;
        equipmentId: string;
        borrowedAt: Date;
        dueAt: Date;
    }>;
}
