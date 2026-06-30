// src/utils/prefetchRegistro.ts
import { queryClient } from "@/lib/queryClient"
import { regionesQueryKey } from "@/features/locations/hooks/useRegionesConComunas"
import { locationsService } from "@/features/locations/services/locationsService"

/**
 * Precarga "por intención" la pantalla /registro.
 *
 * Dispara EN PARALELO las dos esperas que hacen lento el primer render:
 *   1) el chunk lazy de `CrearCuenta` (mismo import que usa router/index.tsx),
 *   2) la query de regiones+comunas que `RegisterForm` pide al montar.
 *
 * Llamar en mouseenter/focus del trigger "Mi cuenta" o del link "Crear una
 * cuenta": al hacer click ya está casi todo en caché → sin spinner perceptible.
 * Idempotente: corre una sola vez por sesión de pestaña.
 */
let prefetched = false

export function prefetchRegistro(): void {
    if (prefetched) return
    prefetched = true

    // 1) Calienta el chunk lazy. Mismo specifier que en router/index.tsx, así
    //    Vite/Rollup reusan el módulo (no genera un segundo chunk).
    void import("@/pages/public/CrearCuenta")

    // 2) Calienta regiones+comunas con los MISMOS params del hook → cache hit.
    void queryClient.prefetchQuery({
        queryKey: regionesQueryKey,
        queryFn: () => locationsService.getRegionesConComunas(),
        staleTime: 1000 * 60 * 60,
    })
}
