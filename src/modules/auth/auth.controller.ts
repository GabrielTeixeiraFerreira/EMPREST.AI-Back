import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

interface LoginBody {
  username?: string;
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginBody) {
    if (!body.username?.trim() || !body.password) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }
    return this.authService.login(body.username.trim(), body.password);
  }

  async authenticate(@Headers('authorization') authorization?: string) {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
      throw new UnauthorizedException('Token de autenticação obrigatório.');
    }
    return this.authService.getUser(token);
  }
}
