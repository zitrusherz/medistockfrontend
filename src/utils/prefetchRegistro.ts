// src/utils/prefetchRegistro.ts
import { queryClient } from "@/lib/queryClient"
import { regionesQueryKey } from "@/features/locations/hooks/useRegionesConComunas"
import { locationsService } from "@/features/locations/services/locationsService"


let prefetched = false

export function prefetchRegistro(): void {
    if (prefetched) return
    prefetched = true


    void import("@/pages/public/CrearCuenta")

    // 2) Calienta regiones+comunas con los MISMOS params del hook → cache hit.
    void queryClient.prefetchQuery({
        queryKey: regionesQueryKey,
        queryFn: () => locationsService.getRegionesConComunas(),
        staleTime: 1000 * 60 * 60,
    })
}
