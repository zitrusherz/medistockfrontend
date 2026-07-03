

// ─── Primitivos ───────────────────────────────────────────────────────────────

/** Identificador numérico de un recurso (PK). */
export type ID = number;

/** Cadena de fecha y hora en ISO 8601 (UTC). Ej: "2025-07-10T14:32:00Z". */
export type ISODateTime = string;

/** Cadena de fecha en formato "YYYY-MM-DD". */
export type ISODate = string;

/** Monto entero en pesos chilenos (CLP). */
export type CLP = number;

/** Valor que puede ser null. */
export type Nullable<T> = T | null;

// ─── Paginación ───────────────────────────────────────────────────────────────

/**
 * Respuesta paginada estándar de Django REST Framework.
 * Se usa solo en listados que tengan paginación configurada.
 */
export interface Paginated<T> {
  count: number;
  next: Nullable<string>;
  previous: Nullable<string>;
  results: T[];
}

// ─── Códigos HTTP ─────────────────────────────────────────────────────────────

/**
 * Códigos HTTP que la API utiliza explícitamente según la documentación.
 * Verificar si 205 (Reset Content) realmente aparece en algún endpoint
 * antes de usarlo; de lo contrario, eliminar para no confundir.
 */
export type HttpStatus =
  | 200  // OK
  | 201  // Created
  | 204  // No Content (ej. logout, delete)
  | 205  // Reset Content — REVISAR si la API lo usa
  | 400  // Bad Request (validación)
  | 401  // Unauthorized (token inválido/expirado)
  | 403  // Forbidden (sin permisos)
  | 404  // Not Found
  | 409  // Conflict (ej. stock insuficiente)
  | 502; // Bad Gateway (servicio externo caído: Webpay, courier)

// ─── Capa 1: Formas de error del servidor (JSON crudo) ───────────────────────

/**
 * Error con clave `detail` (típico de permisos, autenticación y 404 de DRF).
 * Ej: { detail: "No encontrado." }
 */
export interface ApiDetailError {
  detail: string;
}

/**
 * Error con clave `error` (usado por vistas custom del backend).
 * Ej: { error: "Stock insuficiente para el producto X." }
 */
export interface ApiMessageError {
  error: string;
}

/**
 * Error de validación de DRF (HTTP 400).
 * Cada clave corresponde a un campo y el valor es un arreglo de mensajes.
 * Claves especiales: `non_field_errors`, `detalles`, `stock`.
 * Ej: { nombre: ["Este campo es requerido."], precio: ["Debe ser mayor a 0."] }
 */
export type DRFValidationError = Record<string, string[]>;

/**
 * Unión de todas las formas de error que puede devolver la API.
 * Úsala en `toApiError()` para tipar el `error.response.data` de Axios.
 */
export type ApiError = ApiDetailError | ApiMessageError | DRFValidationError;

// ─── Capa 2: Error normalizado del frontend ───────────────────────────────────


export interface NormalizedError {
  /** Código HTTP. 0 si no hubo respuesta (error de red). */
  status: HttpStatus | 0;
  /**
   * Clave de error del backend (`data.code`, `data.error`) o `'unknown'`.
   * Útil para lógica condicional (ej. distinguir `'no_stock'` de `'invalid'`).
   */
  code: string;
  /** Mensaje listo para mostrar al usuario (ya traducido por `toApiError`). */
  message: string;
  /**
   * Presente solo cuando status === 400 y el backend devolvió un
   * `DRFValidationError` (errores por campo).
   * Lo leen los formularios para llamar a `form.setError(campo, { message })`.
   * `notifyApiError()` NO toastea estos errores — los deja al formulario.
   */
  fieldErrors?: DRFValidationError;
}

// ─── Type guards ─────────────────────────────────────────────────────────────

/** Discrimina si el cuerpo del error es un `ApiDetailError`. */
export const isApiDetailError = (e: unknown): e is ApiDetailError =>
  typeof e === 'object' && e !== null && 'detail' in e;

/** Discrimina si el cuerpo del error es un `ApiMessageError`. */
export const isApiMessageError = (e: unknown): e is ApiMessageError =>
  typeof e === 'object' && e !== null && 'error' in e;

/**
 * Discrimina si el cuerpo del error es un `DRFValidationError`.
 * Es verdadero cuando el objeto NO tiene `detail` ni `error`
 * (es decir, es un mapa de campos con errores).
 */
export const isDRFValidationError = (e: unknown): e is DRFValidationError =>
  typeof e === 'object' &&
  e !== null &&
  !('detail' in e) &&
  !('error' in e) &&
  Object.values(e as object).every(v => Array.isArray(v));


export const hasFieldErrors = (
  e: NormalizedError,
): e is NormalizedError & Required<Pick<NormalizedError, 'fieldErrors'>> =>
  e.status === 400 && e.fieldErrors !== undefined;