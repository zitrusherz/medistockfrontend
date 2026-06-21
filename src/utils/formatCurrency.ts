

export const formatCLP = (value: number): string => {
    if (!Number.isFinite(value)) return '$0'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(value)
}