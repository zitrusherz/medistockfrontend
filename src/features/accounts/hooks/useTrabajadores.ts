

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services/accountsService';
import type { WorkerRol } from '../roles';
import { useToast } from '@/components/ui';
import { notifyApiError } from '@/utils/notifyApiError';
import type { ApiError } from '@/lib/axios';

const TRABAJADORES_KEY = ['trabajadores', 'lista'] as const;

interface UseTrabajadoresArgs {
    search?: string;
    rol?: WorkerRol | '';
}

export function useTrabajadores({ search, rol }: UseTrabajadoresArgs = {}) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const query = useQuery({
        queryKey: TRABAJADORES_KEY,
        queryFn: () => accountsService.trabajadores(),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const trabajadores = useMemo(() => {
        let todos = query.data ?? [];

        if (rol) todos = todos.filter((t) => t.rol === rol);

        const q = search?.trim().toLowerCase();
        if (!q) return todos;
        return todos.filter(
            (t) =>
                t.nombre.toLowerCase().includes(q) ||
                t.email.toLowerCase().includes(q) ||
                t.rut.toLowerCase().includes(q),
        );
    }, [query.data, search, rol]);

    /** Activa/desactiva un trabajador. PATCH { activo }. */
    const toggleActivo = useMutation({
        mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
            accountsService.actualizarTrabajador(id, { activo }),
        onSuccess: (t) => {
            queryClient.invalidateQueries({ queryKey: ['trabajadores'] });
            toast({
                title: t.activo ? 'Trabajador activado' : 'Trabajador desactivado',
                description: t.activo
                    ? `${t.nombre} ya puede iniciar sesión.`
                    : `${t.nombre} no podrá iniciar sesión.`,
            });
        },
        onError: (err) => notifyApiError(err as ApiError, toast),
    });

    return {
        trabajadores,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isEmpty: !query.isLoading && trabajadores.length === 0,
        isError: query.isError,
        error: query.error,
        toggleActivo,
    };
}
