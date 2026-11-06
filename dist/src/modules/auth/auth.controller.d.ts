import { AuthService } from './auth.service';
interface LoginBody {
    username?: string;
    password?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginBody): Promise<import("./auth.service").SupabaseSession>;
    authenticate(authorization?: string): Promise<import("./auth.service").SupabaseUser>;
}
export {};
