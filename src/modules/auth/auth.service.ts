import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

export interface SupabaseSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
  };
}

export interface SupabaseUser {
  id: string;
  email?: string;
}

@Injectable()
export class AuthService {
  async login(username: string, password: string): Promise<SupabaseSession> {
    const baseUrl = this.requiredEnvironment('SUPABASE_URL');
    const apiKey = this.requiredEnvironment('SUPABASE_SECRET_KEY');
    const email = username.includes('@')
      ? username
      : `${username}@emprest.ai`;
    const response = await fetch(
      `${baseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    return (await response.json()) as SupabaseSession;
  }

  async getUser(accessToken: string): Promise<SupabaseUser> {
    const baseUrl = this.requiredEnvironment('SUPABASE_URL');
    const apiKey = this.requiredEnvironment('SUPABASE_SECRET_KEY');
    const response = await fetch(`${baseUrl}/auth/v1/user`, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }

    return (await response.json()) as SupabaseUser;
  }

  private requiredEnvironment(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value.replace(/\/$/, '');
  }
}
