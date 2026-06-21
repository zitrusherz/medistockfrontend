import { Suspense, type ReactElement } from "react"
import { Spinner } from "@/components/ui"

/**
 * Helpers de Suspense para el router.
 *
 * Viven en su PROPIO archivo (no en router/index.tsx) por la regla
 * `react-refresh/only-export-components`: index.tsx exporta `router` y
 * `homeByRole` (que NO son componentes), así que no puede además contener
 * definiciones de componentes como estas sin romper el Fast Refresh. Aquí el
 * archivo exporta únicamente componentes → la regla queda satisfecha.
 */

/** Fallback de carga a pantalla completa mientras se resuelve un chunk lazy. */
export const Fallback = () => (
    <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
    </div>
)

/** Envuelve un elemento (página lazy) en Suspense con el fallback compartido. */
export const S = (el: ReactElement) => (
    <Suspense fallback={<Fallback />}>{el}</Suspense>
)
