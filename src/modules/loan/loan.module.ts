import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';

@Module({
  imports: [AuthModule],
  controllers: [LoanController],
  providers: [LoanService, PrismaService],
})
export class LoanModule {}
