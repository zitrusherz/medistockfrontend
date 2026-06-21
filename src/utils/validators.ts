
// ─── RUT chileno ───────────────────────────────────────────────────────────

/** Deja solo dígitos y K, en mayúscula. "12.345.678-5" -> "123456785". */
export function cleanRut(rut: string): string {
    return rut.replace(/[^0-9kK]/g, "").toUpperCase()
}

/**
 * Calcula el dígito verificador (módulo 11) a partir del cuerpo numérico.
 * Recorre el cuerpo de derecha a izquierda multiplicando por la serie
 * 2,3,4,5,6,7 (que se repite). Devuelve "0"-"9" o "K".
 */
function computeDv(body: string): string {
    let sum = 0
    let multiplier = 2

    for (let i = body.length - 1; i >= 0; i--) {
        sum += Number(body[i]) * multiplier
        multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const remainder = 11 - (sum % 11)
    if (remainder === 11) return "0"
    if (remainder === 10) return "K"
    return String(remainder)
}

/**
 * Valida un RUT completo: separa cuerpo y dígito verificador, comprueba que el
 * cuerpo sea numérico y que el DV coincida con el calculado.
 */
export function isValidRut(rut: string): boolean {
    const clean = cleanRut(rut)
    if (clean.length < 2) return false

    const body = clean.slice(0, -1)
    const dv = clean.slice(-1)

    if (!/^\d+$/.test(body)) return false // el cuerpo solo puede tener dígitos

    return computeDv(body) === dv
}

/**
 * Da formato visual: "123456785" -> "12.345.678-5".
 * Útil para mostrar o para reformatear mientras el usuario escribe.
 */
export function formatRut(rut: string): string {
    const clean = cleanRut(rut)
    if (clean.length < 2) return clean

    const body = clean.slice(0, -1)
    const dv = clean.slice(-1)
    const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

    return `${withDots}-${dv}`
}

// ─── Otros validadores comunes ───────────────────────────────────────────────

/**
 * Validación pragmática de email. Para certeza real (que la casilla exista) el
 * único método fiable es enviar un correo de confirmación.
 */
export function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Contraseña razonable: mínimo 8 caracteres, con al menos una letra y un número. */
export function isStrongPassword(value: string): boolean {
    return value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value)
}

/**
 * Teléfono móvil chileno. Acepta con o sin +56 y con espacios/guiones:
 * "+56912345678", "912345678", "+56 9 1234 5678".
 */
export function isPhoneCL(value: string): boolean {
    const digits = value.replace(/[^\d]/g, "")
    // 9XXXXXXXX (9 dígitos) o 569XXXXXXXX (con prefijo país).
    return /^(56)?9\d{8}$/.test(digits)
}

/** Cadena no vacía (ignora espacios). */
export function isNotEmpty(value: string): boolean {
    return value.trim().length > 0
}