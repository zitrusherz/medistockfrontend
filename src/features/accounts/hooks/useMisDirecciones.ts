

import { useQuery } from '@tanstack/react-query';
import { accountsService } from '../services/accountsService';

export function useMisDirecciones() {
    return useQuery({
        queryKey: ['accounts', 'mis-direcciones'],
        queryFn: () => accountsService.getMisDirecciones(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
