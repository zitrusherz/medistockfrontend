

export interface CsvColumn<T> {
    /** Clave del objeto, o función para valores derivados. */
    key: keyof T | ((row: T) => unknown)
    /** Encabezado de la columna. Por defecto, el nombre de la clave. */
    header?: string
    /** Formatea el valor de la celda (ej. moneda, fecha). */
    format?: (value: unknown, row: T) => string
}

export interface CsvOptions<T> {
    /** Columnas a exportar. Si se omite, se usan las claves del primer objeto. */
    columns?: CsvColumn<T>[]
    /** Separador de campos. Por defecto ';' (compatible con Excel es-CL). */
    delimiter?: string
    /** Fin de línea. Por defecto '\r\n' (estándar CSV / Excel). */
    eol?: string
    /** Antepone BOM UTF-8 al descargar. Por defecto true. (Solo lo usa downloadCSV.) */
    includeBom?: boolean
    /** Neutraliza celdas que parezcan fórmulas de Excel. Por defecto true. */
    sanitizeFormulas?: boolean
}

const DEFAULT_DELIMITER = ";"
const DEFAULT_EOL = "\r\n"


function escapeCell(value: unknown, delimiter: string, sanitizeFormulas: boolean): string {
    if (value === null || value === undefined) return ""

    let s = String(value)


    if (sanitizeFormulas && /^[=+\-@\t\r]/.test(s)) {
        s = `'${s}`
    }

    if (
        s.includes(delimiter) ||
        s.includes('"') ||
        s.includes("\n") ||
        s.includes("\r")
    ) {
        s = `"${s.replace(/"/g, '""')}"`
    }

    return s
}

function headerLabel<T>(col: CsvColumn<T>): string {
    if (col.header !== undefined) return col.header
    return typeof col.key === "function" ? "" : String(col.key)
}

/**
 * Construye la cadena CSV (sin BOM). Útil si necesitas el texto para enviar a
 * un servidor en vez de descargarlo.
 */
export function toCSV<T extends object>(rows: T[], options: CsvOptions<T> = {}): string {
    const delimiter = options.delimiter ?? DEFAULT_DELIMITER
    const eol = options.eol ?? DEFAULT_EOL
    const sanitize = options.sanitizeFormulas ?? true

    const first = rows[0]
    const columns: CsvColumn<T>[] =
        options.columns ??
        (first
            ? (Object.keys(first) as (keyof T)[]).map((k) => ({ key: k }))
            : [])

    if (columns.length === 0) return ""

    const headerLine = columns
        .map((c) => escapeCell(headerLabel(c), delimiter, sanitize))
        .join(delimiter)

    const dataLines = rows.map((row) =>
        columns
            .map((c) => {
                const raw =
                    typeof c.key === "function" ? c.key(row) : (row[c.key] as unknown)
                const cell = c.format ? c.format(raw, row) : raw
                return escapeCell(cell, delimiter, sanitize)
            })
            .join(delimiter)
    )

    return [headerLine, ...dataLines].join(eol)
}

/**
 * Genera el CSV y dispara la descarga en el navegador.
 * `filename` puede ir con o sin la extensión .csv.
 */
export function downloadCSV<T extends object>(
    filename: string,
    rows: T[],
    options: CsvOptions<T> = {}
): void {
    const csv = toCSV(rows, options)
    const content = options.includeBom === false ? csv : `\uFEFF${csv}`

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url) // liberar el object URL tras la descarga
}