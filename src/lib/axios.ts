// src/lib/axios.ts
import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";


import type { DRFValidationError } from "@/types/api";


import { authStore, useAuthStore } from "@/store/authStore";

/* -------------------------------------------------------------------------- */
/*  ApiError — error normalizado que TODA la app consume                      */
/*                                                                            */
/*  Decisión de diseño: clase en lugar de interfaz pura.                      */
/*  Ventajas:                                                                 */
/*    · `instanceof ApiError` funciona en catch genéricos.                    */
/*    · Hereda de Error → stack trace, mensaje en console, etc.               */
/*    · Método fieldError(campo) como atajo para react-hook-form.             */
/*                                                                            */
/*  Nota sobre types/api.ts: la interfaz `NormalizedError` que definimos      */
/*  allí queda SUPERADA por esta clase. Puedes eliminarla de types/api.ts     */
/*  o dejarla como referencia documental; pero en el código usa ApiError.     */
/*  El tipo `DRFValidationError` de types/api.ts sí se reutiliza aquí.        */
/* -------------------------------------------------------------------------- */

// Alias local para legibilidad. Mismo shape que DRFValidationError.
export type FieldErrors = DRFValidationError;

export interface ApiErrorOptions {
    status: number;
    message: string;
    detail?: string;
    fieldErrors?: FieldErrors;
    isNetworkError?: boolean;
    raw?: unknown;
}

export class ApiError extends Error {
    status: number;
    detail?: string;
    fieldErrors?: FieldErrors;
    isNetworkError: boolean;
    raw?: unknown;

    constructor(opts: ApiErrorOptions) {
        super(opts.message);
        this.name = "ApiError";
        this.status = opts.status;
        this.detail = opts.detail;
        this.fieldErrors = opts.fieldErrors;
        this.isNetworkError = opts.isNetworkError ?? false;
        this.raw = opts.raw;
    }

    /** Primer mensaje de error para un campo concreto. Útil con react-hook-form. */
    fieldError(field: string): string | undefined {
        return this.fieldErrors?.[field]?.[0];
    }

    /** true si el error tiene errores de campo que el formulario debe pintar. */
    get hasFieldErrors(): boolean {
        return (
            this.status === 400 &&
            this.fieldErrors !== undefined &&
            Object.keys(this.fieldErrors).length > 0
        );
    }
}

/* -------------------------------------------------------------------------- */
/*  Helpers de extracción del cuerpo del backend                             */
/* -------------------------------------------------------------------------- */

function defaultMessageForStatus(status: number): string {
    switch (status) {
        case 400: return "Datos inválidos.";
        case 401: return "No autorizado.";
        case 403: return "No tienes permiso para esta acción.";
        case 404: return "Recurso no encontrado.";
        case 409: return "Conflicto con el estado actual.";
        case 500: return "Error interno del servidor.";
        case 502:
        case 503: return "Servicio no disponible.";
        default:  return "Ocurrió un error inesperado.";
    }
}

/* -------------------------------------------------------------------------- */
/*  Claves de error GLOBALES de DRF                                           */
/*                                                                            */
/*  `detail` y `non_field_errors` NO son campos del formulario: representan   */
/*  errores a nivel de request/serializer. Si se tratan como fieldErrors, el  */
/*  formulario intenta setError() sobre un campo inexistente Y notifyApiError */
/*  se silencia (porque hasFieldErrors pasa a true). Esa era la causa del     */
/*  registro que fallaba sin ningún aviso en pantalla. Las excluimos de los   */
/*  fieldErrors y las exponemos como mensaje global vía extractUserMessage.   */
/* -------------------------------------------------------------------------- */

const GLOBAL_ERROR_KEYS = new Set(["detail", "non_field_errors"]);

/**
 * Lee `data.detail` — presente en errores DRF estándar (401/403/404/etc.).
 * Solo para el campo `detail`.
 */
function extractDetail(data: unknown): string | undefined {
    if (data && typeof data === "object" && "detail" in data) {
        const d = (data as { detail: unknown }).detail;
        if (typeof d === "string") return d;
    }
    return undefined;
}

/**
 * Lee `non_field_errors` — validación a nivel de serializer (DRF), no asociada
 * a un campo concreto. Puede venir como arreglo de strings o como string.
 */
function extractNonFieldError(data: unknown): string | undefined {
    if (data && typeof data === "object" && "non_field_errors" in data) {
        const v = (data as { non_field_errors: unknown }).non_field_errors;
        if (Array.isArray(v) && typeof v[0] === "string") return v[0];
        if (typeof v === "string") return v;
    }
    return undefined;
}

/**
 * Lee `data.error` — presente en vistas custom del backend.
 * Ej: { error: "Stock insuficiente para el producto X." }
 *
 * FIX: sin este helper, los errores con clave `error` caían al mensaje
 * por defecto en vez de mostrar el texto real del backend.
 */
function extractErrorKey(data: unknown): string | undefined {
    if (data && typeof data === "object" && "error" in data) {
        const e = (data as { error: unknown }).error;
        if (typeof e === "string") return e;
    }
    return undefined;
}

/**
 * Mensaje legible del backend: prueba `detail`, luego `non_field_errors`,
 * luego `error`. Úsalo en todos los paths que NO son 400-con-campos.
 */
function extractUserMessage(data: unknown): string | undefined {
    return (
        extractDetail(data) ??
        extractNonFieldError(data) ??
        extractErrorKey(data)
    );
}

/**
 * Convierte cualquier valor simple de DRF en una lista de mensajes.
 * DRF suele mandar strings dentro de arrays, pero también puede devolver
 * números, booleans o ErrorDetail; por eso normalizamos con String().
 */
function toMessageList(value: unknown): string[] | null {
    if (typeof value === "string") return [value];

    if (Array.isArray(value)) {
        const messages = value
            .filter((item) => item !== null && item !== undefined)
            .map(String)
            .filter(Boolean);

        return messages.length > 0 ? messages : null;
    }

    return null;
}


function flattenFieldErrors(
    data: unknown,
    result: FieldErrors,
    prefix = "",
): void {
    if (!data || typeof data !== "object") return;

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        // detail / non_field_errors en raíz son errores globales, no de campo.
        if (!prefix && GLOBAL_ERROR_KEYS.has(key)) continue;

        const path = prefix ? `${prefix}.${key}` : key;
        const messages = toMessageList(value);

        if (messages) {
            result[path] = messages;
            continue;
        }

        if (value && typeof value === "object" && !Array.isArray(value)) {
            flattenFieldErrors(value, result, path);
        }
    }
}

/**
 * Normaliza el cuerpo de un 400 a FieldErrors { campo: string[] }.
 * Soporta errores planos y anidados de DRF.
 */
function extractFieldErrors(data: unknown): FieldErrors {
    const result: FieldErrors = {};
    flattenFieldErrors(data, result);
    return result;
}

function firstFieldMessage(fieldErrors: FieldErrors): string | undefined {
    return Object.values(fieldErrors)[0]?.[0];
}

/* -------------------------------------------------------------------------- */
/*  toApiError — FACTORY (patrón Factory)                                     */
/*  Convierte CUALQUIER error en un ApiError consistente.                     */
/* -------------------------------------------------------------------------- */

export function toApiError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
        const response = error.response;

        // Sin respuesta = red caída / timeout / CORS / servidor apagado.
        if (!response) {
            return new ApiError({
                status: 0,
                message: "No se pudo conectar con el servidor.",
                isNetworkError: true,
                raw: error,
            });
        }

        const { status, data } = response;

        // 400 → intentar leer errores por campo primero.
        if (status === 400) {
            const fieldErrors = extractFieldErrors(data);
            const hasFields = Object.keys(fieldErrors).length > 0;


            const message =
                (hasFields && firstFieldMessage(fieldErrors)) ||
                extractUserMessage(data) ||
                defaultMessageForStatus(400);

            return new ApiError({
                status,
                message,
                fieldErrors: hasFields ? fieldErrors : undefined,
                detail: extractDetail(data),
                raw: data,
            });
        }


        const message = extractUserMessage(data) ?? defaultMessageForStatus(status);
        return new ApiError({
            status,
            message,
            detail: extractDetail(data),
            raw: data,
        });
    }

    // No es de axios (error de código, throw manual, etc.).
    return new ApiError({
        status: 0,
        message: error instanceof Error ? error.message : "Error desconocido.",
        raw: error,
    });
}

/* -------------------------------------------------------------------------- */
/*  Instancia única de axios — SINGLETON                                      */
/* -------------------------------------------------------------------------- */

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://98.95.174.251/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/* -------------------------------------------------------------------------- */
/*  Interceptores — DECORATOR + CHAIN OF RESPONSIBILITY (T1.3)                */
/*                                                                            */
/*  Decisión: todo vive en este archivo (DoD: destino lib/axios.ts).         */
/*  El ciclo lib/axios → store/authStore → authService → lib/axios se rompe   */
/*  con un import() DINÁMICO de authService dentro del handler de 401.        */
/*  authStore SÍ se importa estático arriba: sus getters síncronos no tocan   */
/*  api en su inicialización, así que no hay riesgo de `api` undefined.       */
/* -------------------------------------------------------------------------- */

/* --- Cola de refresh: un solo refresh para N peticiones concurrentes ------ */

let isRefreshing = false;

type QueueEntry = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};
let failedQueue: QueueEntry[] = [];

/** Vacía la cola: con token → reintenta todas; con error → rechaza todas. */
function processQueue(error: unknown, token: string | null): void {
    failedQueue.forEach(({ resolve, reject }) => {
        if (token) resolve(token);
        else reject(error);
    });
    failedQueue = [];
}

/** Logout local + redirección dura a login. Se usa cuando no hay recuperación. */
function forceLogout(): void {
    authStore.logout();
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
}

// Extiende la config para marcar reintentos sin usar `any`.
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/* --- REQUEST: inyecta Authorization (Decorator) --------------------------- */

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = authStore.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(toApiError(error)),
);

/* --- RESPONSE: éxito | 401-con-refresh | otros (Chain of Responsibility) -- */

api.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error) => {
        // Si no es de axios o no tiene config/response → normaliza y sal.
        if (!axios.isAxiosError(error) || !error.config || !error.response) {
            return Promise.reject(toApiError(error));
        }

        const originalRequest = error.config as RetryableConfig;
        const status = error.response.status;

        // Eslabón: solo nos interesa el 401. El resto pasa a toApiError.
        if (status !== 401) {
            return Promise.reject(toApiError(error));
        }

        // No intentar refresh sobre el propio refresh, el login, ni un reintento.
        const url = originalRequest.url ?? "";
        const isRefreshEndpoint = url.includes("/accounts/login/refresh/");
        const isLoginEndpoint = url.includes("/accounts/login/") && !isRefreshEndpoint;


        if (isRefreshEndpoint || isLoginEndpoint || originalRequest._retry) {

            if (!isLoginEndpoint) forceLogout();
            return Promise.reject(toApiError(error));
        }

        // Si ya hay un refresh en curso, encola y espera el nuevo token.
        if (isRefreshing) {

            originalRequest._retry = true;
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(toApiError(err)));
        }

        // Primer 401: lanzar el refresh.
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = authStore.getRefreshToken();
        if (!refreshToken) {
            processQueue(error, null);
            isRefreshing = false;
            forceLogout();
            return Promise.reject(toApiError(error));
        }

        try {
            // Import dinámico: rompe el ciclo de módulos en tiempo de carga.
            const { authService } = await import(
                "@/features/auth/services/authService"
                );
            const { access: newToken } = await authService.refresh(refreshToken);


            useAuthStore.getState().setTokens(newToken, refreshToken);

            // Despertar a los que esperaban.
            processQueue(null, newToken);

            // Reintentar el request original.
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            forceLogout();
            return Promise.reject(toApiError(refreshError));
        } finally {
            isRefreshing = false;
        }
    },
);

export default api;
