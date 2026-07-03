// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/types/auth';
import { homeByRole } from '@/router/homeByRole';
import { prefetchHome } from '@/router/prefetch.ts';


export function useLogin() {
    const login = useAuthStore((s) => s.login);
    const loadProfile = useAuthStore((s) => s.loadProfile);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    return useMutation({

        mutationFn: (credentials: LoginRequest) => authService.login(credentials),

        onSuccess: async (tokens) => {
            // 1. Tokens + status 'loading' de forma atómica (no estado intermedio).
            login(tokens.access, tokens.refresh);


            await loadProfile();


            const { status, rol } = useAuthStore.getState();
            if (status !== 'authenticated') return;


            prefetchHome(rol);
            navigate(homeByRole(rol), { replace: true });
        },

        onError: () => {

            logout();
        },
    });
}
