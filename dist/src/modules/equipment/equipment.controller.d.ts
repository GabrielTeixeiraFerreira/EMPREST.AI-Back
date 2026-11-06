import { AuthService } from '../auth/auth.service';
import { EquipmentService } from './equipment.service';
export declare class EquipmentController {
    private readonly authService;
    private readonly equipmentService;
    constructor(authService: AuthService, equipmentService: EquipmentService);
    list(authorization?: string): Promise<{
        name: string;
        category: import(".prisma/client").$Enums.EquipmentCategory;
        assetTag: string;
        status: import(".prisma/client").$Enums.EquipmentStatus;
        imagePath: string | null;
    }[]>;
}
