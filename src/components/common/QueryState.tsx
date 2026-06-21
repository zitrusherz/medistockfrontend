// src/components/common/QueryState.tsx
// T5.1 / M12 — Estado unificado de carga / vacío / error para CUALQUIER vista con datos.
// Centraliza los tres estados de una query para no repetir el patrón en cada pantalla.
//
// Compatible con dos formas:
//   · UseQueryResult de React Query (expone isPending/isError/error/refetch).
//   · Hooks propios estilo useCatalogo ({ isLoading, isError, isEmpty, error }).
//
// Uso típico (envuelve la lista, no la página entera):
//
//   const q = useTodosPedidos();
//   <QueryState
//     query={q}
//     loading={<Table loading loadingRows={6}>…cabeceras…</Table>}
//     empty={<EmptyState title="No hay pedidos" action={<Button as={Link} to="/catalogo">Ir al catálogo</Button>} />}
//   >
//     <OrdersTable pedidos={q.data} />
//   </QueryState>
//
// Regla M12: el loading es SKELETON (forma del contenido), nunca un spinner a
// pantalla completa; el error trae mensaje traducido + botón "Reintentar" (refetch).

import type { ReactNode } from "react"
import { ApiError } from "@/lib/axios"
import { apiErrorMessage } from "@/utils/notifyApiError"
import { Alert, Button, Skeleton } from "@/components/ui"

/**
 * Forma mínima que QueryState necesita leer. Es un subconjunto de UseQueryResult,
 * por lo que un resultado de React Query encaja sin adaptarlo; y los hooks propios
 * (que exponen isLoading/isEmpty) también.
 */
export interface QueryLike {
    isLoading?: boolean
    isPending?: boolean
    isFetching?: boolean
    isError?: boolean
    error?: unknown
    /** Algunos hooks (useCatalogo) ya calculan el vacío. */
    isEmpty?: boolean
    refetch?: () => unknown
}

interface QueryStateProps {
    query: QueryLike
    /** Contenido cuando hay datos. */
    children: ReactNode
    /** Bloque de "sin datos". Recomendado: <EmptyState .../>. */
    empty?: ReactNode
    /** Skeleton de carga propio (tabla o cards). Si no se pasa, usa líneas genéricas. */
    loading?: ReactNode
    /** Si el hook no expone isEmpty, pásalo aquí (ej. data.length === 0). */
    isEmpty?: boolean
    /** Título del bloque de error. */
    errorTitle?: string
}

export function QueryState({
    query,
    children,
    empty,
    loading,
    isEmpty,
    errorTitle = "No pudimos cargar la información",
}: QueryStateProps) {
    // isPending (RQ v5) o isLoading (hooks propios). isFetching NO dispara skeleton:
    // con keepPreviousData queremos refetch sin parpadeo (M12).
    const cargando = query.isPending ?? query.isLoading ?? false
    const conError = query.isError ?? false
    const vacio = isEmpty ?? query.isEmpty ?? false

    // 1) Carga inicial → skeleton.
    if (cargando) {
        return <>{loading ?? <Skeleton variant="text" lines={5} />}</>
    }

    // 2) Error → mensaje ya traducido (misma fuente que el toast: M15) + reintentar.
    if (conError) {
        const mensaje =
            query.error instanceof ApiError
                ? apiErrorMessage(query.error)
                : "Ocurrió un error inesperado. Intenta nuevamente."
        return (
            <Alert variant="error" title={errorTitle}>
                <p>{mensaje}</p>
                {query.refetch && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => query.refetch?.()}
                    >
                        Reintentar
                    </Button>
                )}
            </Alert>
        )
    }

    // 3) Vacío → mensaje amable + acción (lo define el consumidor con `empty`).
    if (vacio) {
        return (
            <>
                {empty ?? (
                    <p className="py-12 text-center text-sm text-text-muted">
                        No hay información para mostrar.
                    </p>
                )}
            </>
        )
    }

    // 4) Con datos.
    return <>{children}</>
}
