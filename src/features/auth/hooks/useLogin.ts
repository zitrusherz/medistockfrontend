// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/types/auth';
import { homeByRole } from '@/router/homeByRole';
import { prefetchHome } from '@/router/prefetch.ts';

// useMutation: hook de React Query para operaciones que modifican estado
// (login = POST). Para GET se usa useQuery.
export function useLogin() {
    const login = useAuthStore((s) => s.login);
    const loadProfile = useAuthStore((s) => s.loadProfile);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    return useMutation({
        // Solo pide los tokens. NO toca localStorage a mano: el store los
        // persiste vía zustand 'persist' bajo la clave 'medistock-auth'.
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),

        onSuccess: async (tokens) => {
            // 1. Tokens + status 'loading' de forma atómica (no estado intermedio).
            login(tokens.access, tokens.refresh);

            // 2. getMe() → user/rol/status 'authenticated'. loadProfile maneja
            //    su propio error: si el token resulta inválido, limpia a 'guest'.
            await loadProfile();

            // 3. Si getMe falló tras un login OK, loadProfile ya dejó status en
            //    'guest'. No navegamos; el form se queda mostrando el error.
            const { status, rol } = useAuthStore.getState();
            if (status !== 'authenticated') return;

            // 4. Redirección por rol.
            //    FIX: antes había un homeByRole LOCAL con claves de nombre de
            //    negocio ('Administrador', 'Ejecutivo de Cuentas'...) que no
            //    calzaban con el enum real de types/roles.ts ('ADMINISTRADOR',
            //    'EJECUTIVO'...). Eso hacía que HOME_BY_ROL[rol] diera undefined
            //    y todo el mundo cayera al fallback '/catalogo', sin importar
            //    su rol real. Se usa ahora la MISMA fuente de verdad que
            //    RoleRoute (src/router/homeByRole.ts) para no duplicar el mapeo.
            prefetchHome(rol);
            navigate(homeByRole(rol), { replace: true });
        },

        onError: () => {
            // login falló (ej. 401). No hay tokens guardados, pero logout es
            // idempotente y deja el store limpio por si quedó algo parcial.
            // El error queda en mutation.error para pintarlo inline en el form.
            logout();
        },
    });
}
