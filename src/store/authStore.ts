// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // <-- 1. Agregado createJSONStorage
import { Roles, rolDesdeGrupos, type Rol } from '../types/roles';
import type { PerfilMe } from '../types/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

interface AuthState {
    // Datos persistidos en sessionStorage
    accessToken: string | null;
    refreshToken: string | null;
    // Datos en memoria (re-validados en cada recarga)
    user: PerfilMe | null;
    rol: Rol | null;
    status: AuthStatus;
}

interface AuthActions {
    login: (access: string, refresh: string) => void;
    setTokens: (access: string, refresh: string) => void;
    loadProfile: () => Promise<void>;
    logout: () => void;
    isAuthenticated: () => boolean;
    hasRole: (roles: Rol[]) => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            // Estado inicial
            accessToken: null,
            refreshToken: null,
            user: null,
            rol: null,
            status: 'idle',

            login: (access, refresh) => {
                set({ accessToken: access, refreshToken: refresh, status: 'loading' });
            },

            setTokens: (access, refresh) => {
                set({ accessToken: access, refreshToken: refresh });
            },

            loadProfile: async () => {
                set({ status: 'loading' });

                try {
                    const { authService } = await import('../features/auth/services/authService');
                    const user = await authService.getMe();

                    let rol: Rol | null = null;

                    if (user.rol === 'CLIENTE') {
                        rol = Roles.CLIENTE;
                    } else if ('usuario' in user.datos) {
                        rol = rolDesdeGrupos(user.datos.usuario.grupos);
                    } else {
                        console.warn(
                            '[authStore] Perfil TRABAJADOR sin datos.usuario:',
                            user.datos,
                        );
                    }

                    if (!rol) {
                        console.warn(
                            '[authStore] Perfil sin rol reconocido:',
                            user,
                        );
                    }

                    set({ user, rol, status: 'authenticated' });
                } catch {
                    set({
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                        rol: null,
                        status: 'guest',
                    });
                }
            },

            logout: () => {
                const refreshToken = get().refreshToken;
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    rol: null,
                    status: 'guest',
                });

                if (refreshToken) {
                    import('../features/auth/services/authService')
                        .then(({ authService }) => authService.logout(refreshToken))
                        .catch(() => { /* silencioso */ });
                }
            },

            isAuthenticated: () => get().status === 'authenticated',
            hasRole: (roles) => {
                const rol = get().rol;
                return rol !== null && roles.includes(rol);
            },
        }),
        {
            name: 'medistock-auth',
            storage: createJSONStorage(() => sessionStorage), // <-- 2. Forzar sessionStorage por seguridad
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

export const authStore = {
    getAccessToken: () => useAuthStore.getState().accessToken,
    getRefreshToken: () => useAuthStore.getState().refreshToken,
    logout: () => useAuthStore.getState().logout(),
};
