import { AuthService } from '../auth/auth.service';
import { LoanService } from './loan.service';
export declare class LoanController {
    private readonly authService;
    private readonly loanService;
    constructor(authService: AuthService, loanService: LoanService);
    listMine(authorization?: string): Promise<{
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
    create(authorization?: string, body?: {
        equipmentId?: string;
    }): Promise<{
        id: string;
        equipmentId: string;
        borrowedAt: Date;
        dueAt: Date;
    }>;
    private authenticatedUser;
}
