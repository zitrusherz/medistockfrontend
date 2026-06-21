// features/inventory/services/mappers/alertMapper.ts
// Adapter: traduce los DTO crudos de inventario al modelo de dominio de la UI.
//   Inventario → AlertaStock        (stock por lote+sucursal vs. umbral)
//   Lote       → AlertaVencimiento  (días-a-vencer desde la fecha de caducidad)

import type { Inventario, Lote } from '../../types';
import type { AlertaStock, AlertaVencimiento } from '../../types/alerts';

/**
 * Días enteros entre hoy (medianoche local) y una fecha ISO "YYYY-MM-DD".
 * Negativo = ya vencido. Se calcula desde la fecha (fuente única) en lugar de
 * confiar en `dias_para_vencer` del backend, que depende de cuándo se generó la
 * respuesta. Si la fecha no es parseable, devuelve NaN para poder caer al valor
 * del backend en el mapper.
 */
export const diasHasta = (fechaISO: string): number => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaISO ?? '');
    if (!m) return Number.NaN;
    const objetivo = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000);
};

export const toAlertaStock = (dto: Inventario): AlertaStock => {
    const stock = dto.stock_neto;
    const minimo = dto.stock_critico;
    return {
        id: dto.id,
        productoNombre: dto.lote.producto.nombre,
        productoSku: dto.lote.producto.sku,
        loteCodigo: dto.lote.codigo_lote,
        sucursalId: dto.sucursal,
        sucursalNombre: dto.sucursal_nombre,
        stock,
        minimo,
        faltante: Math.max(0, minimo - stock),
        agotado: stock === 0,
        // Confía en la bandera del backend, pero también la deriva por si llega
        // un registro sin la bandera calculada.
        critico: dto.alerta_stock_critico || stock <= minimo,
    };
};

export const toAlertaVencimiento = (dto: Lote): AlertaVencimiento => {
    const calculado = diasHasta(dto.fecha_vencimiento);
    const dias = Number.isNaN(calculado) ? dto.dias_para_vencer : calculado;
    return {
        id: dto.id,
        productoNombre: dto.producto.nombre,
        productoSku: dto.producto.sku,
        loteCodigo: dto.codigo_lote,
        marca: dto.producto.marca_nombre,
        fechaVencimiento: dto.fecha_vencimiento,
        diasParaVencer: dias,
        vencido: dias < 0,
        critico: dias <= 10,
        advertencia: dias > 10 && dias <= 25,
    };
};
