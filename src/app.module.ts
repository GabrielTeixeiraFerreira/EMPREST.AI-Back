import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { SystemModule } from './modules/system/system.module';
import { LoanModule } from './modules/loan/loan.module';

@Module({
  imports: [SystemModule, AuthModule, EquipmentModule, LoanModule],
})
export class AppModule {}
