

import type { ApiError } from "@/lib/axios";
import type { ToastContextValue } from "@/components/ui/toastContext";

export type ToastFn = ToastContextValue["toast"];

/* -------------------------------------------------------------------------- */
/*  Mensajes por código HTTP — copy de USUARIO (es-CL).                       */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*  apiErrorMessage — texto de usuario para un ApiError (NUEVO en T5.1).      */
/*                                                                            */
/*  Prioridad:                                                                */
/*    1. red caída            → STATUS_MESSAGES[0]                            */
/*    2. código con copy fijo → STATUS_MESSAGES[status]                      */
/*    3. mensaje del backend  → error.message (ya normalizado por toApiError) */
/* -------------------------------------------------------------------------- */

const NETWORK_MESSAGE = "Sin conexión. Revisa tu red e intenta de nuevo.";

const STATUS_MESSAGES: Record<number, string> = {
    0:   NETWORK_MESSAGE,
    401: "Tu sesión expiró. Inicia sesión nuevamente.",
    403: "No tienes permisos para realizar esta acción.",
    404: "El recurso solicitado no existe.",
    409: "El stock puede haber cambiado. Revisa tu carrito antes de continuar.",
    500: "Error interno del servidor. Intenta más tarde.",
    502: "Un servicio externo no responde (pago o courier). Intenta en unos segundos.",
    503: "Servicio no disponible temporalmente.",
};

export const apiErrorMessage = (error: ApiError): string => {
    if (error.isNetworkError) return NETWORK_MESSAGE;
    return STATUS_MESSAGES[error.status] ?? error.message;
};
/* -------------------------------------------------------------------------- */
/*  notifyApiError — toast para todo lo que NO sea 400-con-campos.            */
/*                                                                            */
/*  ApiError                                                                  */
/*   ├─ 400 con fieldErrors  →  NO se toastea (lo pinta el formulario).       */
/*   └─ cualquier otro error →  TOAST con apiErrorMessage().                  */
/* -------------------------------------------------------------------------- */

export const notifyApiError = (error: ApiError, toast: ToastFn): void => {
    // 400 con errores de campo → el formulario los maneja, aquí no hacemos nada.
    if (error.hasFieldErrors) return;

    toast({
        title: error.isNetworkError ? "Sin conexión" : "Error",
        description: apiErrorMessage(error),
        variant: "destructive",
    });
};

/* -------------------------------------------------------------------------- */
/*  useHandleFieldErrors — helper para formularios con react-hook-form        */
/*  Complemento de notifyApiError: aplica los fieldErrors del 400 al form.    */
/* -------------------------------------------------------------------------- */

import type { UseFormSetError, FieldValues, Path } from "react-hook-form";

/**
 * Aplica los `fieldErrors` de un `ApiError` 400 sobre un formulario RHF.
 * @returns `true` si había fieldErrors y se aplicaron; `false` en caso contrario.
 */
export const applyFieldErrors = <T extends FieldValues>(
    error: ApiError,
    setError: UseFormSetError<T>,
): boolean => {
    if (!error.hasFieldErrors) return false;

    Object.entries(error.fieldErrors!).forEach(([field, msgs]) => {
        setError(field as Path<T>, {
            type: "server",
            message: msgs[0],
        });
    });

    return true;
};

/* -------------------------------------------------------------------------- */
/*  makeFormErrorHandler — onError listo para pegar en useMutation con form.  */
/* -------------------------------------------------------------------------- */

export const makeFormErrorHandler =
    <T extends FieldValues>(
        setError: UseFormSetError<T>,
        toast: ToastFn,
    ) =>
        (err: unknown): void => {
            // import { ApiError } from '@/lib/axios'; en el archivo que use esto.
            const apiErr = err as ApiError;
            const applied = applyFieldErrors(apiErr, setError);
            if (!applied) notifyApiError(apiErr, toast);
        };
