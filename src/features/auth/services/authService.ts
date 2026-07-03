import  api  from '@/lib/axios';
import type {
    LoginRequest,
    LoginResponse,
    PerfilMe,
    RefreshResponse,
} from '@/types/auth.ts';


export const authService = {
    /**
     * POST /accounts/login/
     * Devuelve access + refresh tokens.
     * Errores 401 los maneja el llamador (useLogin), no aquí.
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>('/accounts/login/', credentials);
        return data;
    },


    async refresh(refreshToken: string): Promise<RefreshResponse> {
        const { data } = await api.post<RefreshResponse>('/accounts/login/refresh/', {
            refresh: refreshToken,
        });
        return data;
    },

    /**
     * POST /accounts/logout/
     * Envía el refresh token para que el backend lo invalide (blacklist).
     * Sin esto, el refresh sigue funcionando aunque el usuario "cierre sesión".
     * try/catch: si el backend está caído, el front limpia la sesión igual.
     */
    async logout(refreshToken: string): Promise<void> {
        try {
            await api.post('/accounts/logout/', { refresh: refreshToken });
        } catch {
            // Silencioso: el front limpia la sesión local de todas formas.
        }
    },

    /**
     * GET /accounts/perfil/me/
     * Fuente de verdad del rol. Se llama:
     *  1) Después del login exitoso.
     *  2) Al recargar la página (validar token + recuperar rol).
     */
    async getMe(): Promise<PerfilMe> {
        const { data } = await api.get<PerfilMe>('/accounts/perfil/me/');
        return data;
    },
};