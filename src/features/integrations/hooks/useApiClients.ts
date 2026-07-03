

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsService } from '../services/integrationsService';
import { useToast } from '@/components/ui';
import { notifyApiError } from '@/utils/notifyApiError';
import type { ApiError } from '@/lib/axios';

const API_CLIENTS_KEY = ['apiClients', 'lista'] as const;

export function useApiClients(search?: string) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const query = useQuery({
        queryKey: API_CLIENTS_KEY,
        queryFn: () => integrationsService.apiClients(),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const apiClients = useMemo(() => {
        const todos = query.data ?? [];
        const q = search?.trim().toLowerCase();
        if (!q) return todos;
        return todos.filter(
            (c) =>
                c.institucion.toLowerCase().includes(q) ||
                c.nombre.toLowerCase().includes(q),
        );
    }, [query.data, search]);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['apiClients'] });

    /** Rota la key: genera una nueva y la anterior queda inválida. */
    const rotar = useMutation({
        mutationFn: (id: number) => integrationsService.rotarKey(id),
        onSuccess: (res) => {
            invalidate();
            toast({
                title: 'API Key rotada',
                description: `${res.institucion}: la key anterior quedó inválida.`,
            });
        },
        onError: (err) => notifyApiError(err as ApiError, toast),
    });

    /** Revoca la key (desactiva). Acción destructiva: confirmar en UI antes. */
    const revocar = useMutation({
        mutationFn: (id: number) => integrationsService.revocarKey(id),
        onSuccess: (res) => {
            invalidate();
            toast({
                title: 'API Key revocada',
                description: `${res.institucion} ya no puede consumir la API.`,
            });
        },
        onError: (err) => notifyApiError(err as ApiError, toast),
    });

    /** Reactiva una key previamente revocada. */
    const reactivar = useMutation({
        mutationFn: (id: number) => integrationsService.reactivarKey(id),
        onSuccess: (res) => {
            invalidate();
            toast({
                title: 'API Key reactivada',
                description: `${res.institucion} vuelve a tener acceso.`,
            });
        },
        onError: (err) => notifyApiError(err as ApiError, toast),
    });

    return {
        apiClients,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isEmpty: !query.isLoading && apiClients.length === 0,
        isError: query.isError,
        error: query.error,
        rotar,
        revocar,
        reactivar,
    };
}
