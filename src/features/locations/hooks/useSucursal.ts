import { useQuery } from '@tanstack/react-query';
import { locationsService } from '../services/locationsService';

/**
 * Carga una sucursal por su ID. `enabled` evita la llamada hasta tener un id.
 * Lo consumirá el checkout (T2.8) para mostrar/validar la sucursal de despacho.
 */
export function useSucursal(id: number | null | undefined) {
    return useQuery({
        queryKey: ['locations', 'sucursal', id],
        queryFn: () => locationsService.getSucursal(id as number),
        enabled: id != null,
        staleTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
}
