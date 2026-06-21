import { QueryClient } from "@tanstack/react-query"

/**
 * QueryClient global (Singleton).
 *
 * `refetchOnWindowFocus: false` — clave para el bug de la landing:
 *   React Query, por defecto, vuelve a pedir los datos CADA VEZ que el usuario
 *   regresa a la pestaña/ventana. Como las secciones de la home se ocultan
 *   cuando no hay datos (`return null`), ese refetch hacía que "de un momento a
 *   otro" la sección se vaciara y desapareciera. Apagándolo, los datos ya
 *   cargados se quedan estables mientras navegas.
 *
 * `staleTime` 60s + `retry: 1` se conservan tal cual los tenías.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})
