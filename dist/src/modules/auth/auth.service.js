"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    async login(username, password) {
        const baseUrl = this.requiredEnvironment('SUPABASE_URL');
        const apiKey = this.requiredEnvironment('SUPABASE_SECRET_KEY');
        const email = username.includes('@')
            ? username
            : `${username}@emprest.ai`;
        const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                apikey: apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new common_1.UnauthorizedException('Usuário ou senha inválidos.');
        }
        return (await response.json());
    }
    async getUser(accessToken) {
        const baseUrl = this.requiredEnvironment('SUPABASE_URL');
        const apiKey = this.requiredEnvironment('SUPABASE_SECRET_KEY');
        const response = await fetch(`${baseUrl}/auth/v1/user`, {
            headers: {
                apikey: apiKey,
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new common_1.UnauthorizedException('Sessão inválida ou expirada.');
        }
        return (await response.json());
    }
    requiredEnvironment(name) {
        const value = process.env[name];
        if (!value) {
            throw new Error(`Missing required environment variable: ${name}`);
        }
        return value.replace(/\/$/, '');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map