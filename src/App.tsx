import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '@/components/ui/index.ts';
import { RouterProvider } from 'react-router';
import { router } from '@/router';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui';

export const App = () => {
    // Solo nos suscribimos a 'status' a nivel de componente para re-renderizar la UI (Spinner vs Router)
    const status = useAuthStore((s) => s.status);

    useEffect(() => {

        const { status: initialStatus, accessToken, loadProfile } = useAuthStore.getState();

        if (initialStatus !== 'idle') return; // Ya en progreso o resuelta por otra vía

        if (accessToken) {
            // Hay token en localStorage: validar con el servidor
            loadProfile();
        } else {
            // No hay token: ir directo a guest de manera limpia
            useAuthStore.setState({ status: 'guest' });
        }
    }, []); // Array de dependencias vacío: se ejecuta estrictamente UNA VEZ al montar


    if (status === 'idle' || status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Spinner size="xl" label="Validando sesión..." />
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </QueryClientProvider>
    );
};