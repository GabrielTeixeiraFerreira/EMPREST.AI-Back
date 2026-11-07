import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoanService } from './loan.service';

@Controller('loans')
export class LoanController {
  constructor(
    private readonly authService: AuthService,
    private readonly loanService: LoanService,
  ) {}

  @Get('me')
  async listMine(@Headers('authorization') authorization?: string) {
    const user = await this.authenticatedUser(authorization);
    return this.loanService.listOpenForUser('suporte_ti', user.id);
  }

  @Post()
  async create(
    @Headers('authorization') authorization?: string,
    @Body() body?: { equipmentId?: string },
  ) {
    const user = await this.authenticatedUser(authorization);
    return this.loanService.create('suporte_ti', user.id, body?.equipmentId);
  }

  private async authenticatedUser(authorization?: string) {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
      throw new UnauthorizedException('Token de autenticação obrigatório.');
    }
    return this.authService.getUser(token);
  }
}
