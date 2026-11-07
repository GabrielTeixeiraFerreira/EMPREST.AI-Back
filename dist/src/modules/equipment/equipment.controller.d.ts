import { AuthService } from '../auth/auth.service';
import { EquipmentService } from './equipment.service';
export declare class EquipmentController {
    private readonly authService;
    private readonly equipmentService;
    constructor(authService: AuthService, equipmentService: EquipmentService);
    list(authorization?: string): Promise<{
        status: string;
        imageUrl: string | null;
        id: string;
        name: string;
        category: import(".prisma/client").$Enums.EquipmentCategory;
        assetTag: string;
        imagePath: string | null;
    }[]>;
}
