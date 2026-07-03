

/** Alerta de stock (derivada de un registro de Inventario = lote + sucursal). */
export interface AlertaStock {
    /** id del registro de inventario. */
    id: number;
    productoNombre: string;
    productoSku: string;
    loteCodigo: string;
    sucursalId: number;
    sucursalNombre: string;
    /** stock_neto. */
    stock: number;
    /** stock_critico (umbral mínimo configurado). */
    minimo: number;
    /** Unidades que faltan para alcanzar el mínimo (0 si está por encima). */
    faltante: number;
    agotado: boolean;
    critico: boolean;
}

/** Alerta de vencimiento (derivada de un Lote). */
export interface AlertaVencimiento {
    /** id del lote. */
    id: number;
    productoNombre: string;
    productoSku: string;
    loteCodigo: string;
    marca: string;
    /** ISO date "YYYY-MM-DD". */
    fechaVencimiento: string;
    /** Días desde hoy hasta el vencimiento (negativo = ya vencido). */
    diasParaVencer: number;
    vencido: boolean;
    /** ≤ 10 días (incluye vencidos). */
    critico: boolean;
    /** Entre 11 y 25 días. */
    advertencia: boolean;
}
