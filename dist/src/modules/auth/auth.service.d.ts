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
export declare class AuthService {
    login(username: string, password: string): Promise<SupabaseSession>;
    getUser(accessToken: string): Promise<SupabaseUser>;
    private requiredEnvironment;
}
