

type DateInput = string | number | Date

/**
 * Convierte la entrada a Date de forma segura.
 * - Para strings "YYYY-MM-DD" (solo fecha) la construye en horario LOCAL para
 *   evitar el desfase de un día que ocurre al interpretarlas como UTC.
 * - Devuelve null si no se puede parsear.
 */
function toDate(value: DateInput | null | undefined): Date | null {
    if (value === null || value === undefined || value === "") return null

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value
    }

    if (typeof value === "number") {
        const d = new Date(value)
        return Number.isNaN(d.getTime()) ? null : d
    }

    // string: detectar "solo fecha" para no aplicar zona horaria.
    const onlyDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (onlyDate) {
        const [, y, m, d] = onlyDate
        return new Date(Number(y), Number(m) - 1, Number(d))
    }

    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
}

/** "02-06-2026". Vacío si la fecha no es válida. */
export function formatDate(value: DateInput | null | undefined): string {
    const d = toDate(value)
    if (!d) return ""
    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d)
}

/** "02-06-2026 14:30". Vacío si la fecha no es válida. */
export function formatDateTime(value: DateInput | null | undefined): string {
    const d = toDate(value)
    if (!d) return ""
    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(d)
}

/** "14:30". Vacío si la fecha no es válida. */
export function formatTime(value: DateInput | null | undefined): string {
    const d = toDate(value)
    if (!d) return ""
    return new Intl.DateTimeFormat("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(d)
}