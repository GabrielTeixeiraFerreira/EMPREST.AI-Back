import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(
    private readonly authService: AuthService,
    private readonly equipmentService: EquipmentService,
  ) {}

  @Get()
  async list(@Headers('authorization') authorization?: string) {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
      throw new UnauthorizedException('Token de autenticação obrigatório.');
    }
    const user = await this.authService.getUser(token);
    return this.equipmentService.listForTenant('suporte_ti', user.id);
  }
}
