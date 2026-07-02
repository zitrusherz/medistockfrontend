// src/features/logistics/hooks/useCotizacionEnvio.ts
// Custom Hook + Observer (React Query) — cotización de envío EN EL CHECKOUT.
//
// Qué hace:
//  1. Determina las sucursales "candidatas": las que tienen stock suficiente para
//     TODAS las líneas del carrito (usa stock_por_sucursal del catálogo cacheado).
//  2. Lanza una cotización por cada sucursal candidata (en paralelo), pasando SOLO
//     producto_id + cantidad (el backend arma la caja óptima y calcula medidas/peso).
//  3. Junta los servicios y, por cada serviceTypeCode, se queda con la sucursal más
//     barata. Devuelve las opciones ordenadas de menor a mayor precio.
//
// No hay mock: usa logisticsService.cotizarProductos → backend real.
// Contrato del endpoint: docs/COTIZACION_ENVIO_CHECKOUT.md.

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logisticsService } from '../services/logisticsService';
import { useCartItems } from '@/features/cart/hooks/useCart';
import { useCatalogLookup } from '@/features/cart/hooks/useCatalogLookup';

/** Una opción de envío ya resuelta (servicio + sucursal más barata que lo ofrece). */
export interface OpcionEnvio {
    serviceTypeCode: number;
    serviceDescription: string;
    deliveryType: number;
    value: number; // CLP entero
    sucursalId: number;
    sucursalNombre: string;
}

/** Parsea un valor CLP que puede venir como string ("3990") a número entero. */
const toCLP = (v: string | number): number => {
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d]/g, ''));
    return Number.isFinite(n) ? n : 0;
};

export function useCotizacionEnvio(countyCode: string | null) {
    const items = useCartItems();
    const { productos: catalogo, isLoading: cargandoCatalogo } = useCatalogLookup();

    // Índice code → Product (para leer stock_por_sucursal de cada línea).
    const byCode = useMemo(
        () => new Map(catalogo.map((p) => [p.code, p])),
        [catalogo],
    );

    // Sucursales candidatas para el ORIGEN del despacho: las que tienen stock
    // (aunque sea parcial) de ALGÚN producto del carrito. El backend cotiza el
    // carrito completo desde el origen indicado (arma caja/medidas/peso con los
    // productos_ids) y NO exige que ese local tenga todo el stock. Cotizamos desde
    // cada candidata y elegimos la más barata. (Antes se exigía cubrir TODO el
    // carrito en un solo local, lo que dejaba cero candidatas y "envío pendiente"
    // cuando el stock estaba repartido entre locales.)
    const { candidatas, mejorSucursal, sinCobertura } = useMemo(() => {
        if (!items.length || !catalogo.length) {
            return {
                candidatas: [] as { id: number; nombre: string }[],
                mejorSucursal: null as { id: number; nombre: string } | null,
                sinCobertura: false,
            };
        }
        const sucs = new Map<number, string>();
        for (const it of items) {
            const p = byCode.get(it.code);
            if (!p) continue;
            for (const s of p.stockBySucursal) {
                if (s.stock > 0) sucs.set(s.sucursalId, s.sucursalNombre);
            }
        }
        // Puntaje de cobertura por local: cuántas unidades del carrito puede cubrir.
        const scored = [...sucs.entries()].map(([id, nombre]) => {
            let score = 0;
            for (const it of items) {
                const p = byCode.get(it.code);
                const st = p?.stockBySucursal.find((s) => s.sucursalId === id)?.stock ?? 0;
                score += Math.min(st, it.quantity);
            }
            return { id, nombre, score };
        });
        const candidatas = scored.map(({ id, nombre }) => ({ id, nombre }));
        const mejorSucursal = scored.length
            ? (() => {
                  const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
                  return { id: best.id, nombre: best.nombre };
              })()
            : null;
        return { candidatas, mejorSucursal, sinCobertura: candidatas.length === 0 };
    }, [items, catalogo, byCode]);

    // Payload de productos: arreglo PLANO de IDs; la cantidad se expresa repitiendo
    // el id (ej: [12,12,15]). El backend calcula caja/medidas/peso desde los IDs.
    const productosIds: number[] = useMemo(
        () => items.flatMap((it) => Array.from({ length: it.quantity }, () => it.productId)),
        [items],
    );

    const enabled = Boolean(countyCode && candidatas.length && productosIds.length);

    const query = useQuery({
        queryKey: [
            'cotizacion-checkout',
            countyCode,
            candidatas.map((c) => c.id).join(','),
            productosIds.join(','),
        ],
        enabled,
        staleTime: 5 * 60_000,
        retry: 0,
        queryFn: async (): Promise<OpcionEnvio[]> => {
            const results = await Promise.all(
                candidatas.map(async (suc) => {
                    try {
                        const r = await logisticsService.cotizarProductos({
                            county_code_destino: countyCode!,
                            sucursal_id: suc.id,
                            productos_ids: productosIds,
                        });
                        return (r.servicios_disponibles ?? []).map<OpcionEnvio>((s) => ({
                            serviceTypeCode: s.serviceTypeCode,
                            serviceDescription: s.serviceDescription,
                            deliveryType: s.deliveryType,
                            value: toCLP(s.serviceValue),
                            sucursalId: suc.id,
                            sucursalNombre: suc.nombre,
                        }));
                    } catch {
                        // Una sucursal que falle (p. ej. producto sin medidas) no debe
                        // tumbar al resto. Si TODAS fallan → opciones vacías → "pendiente".
                        return [] as OpcionEnvio[];
                    }
                }),
            );
            const all = results.flat().filter((o) => o.value > 0);
            // Por serviceTypeCode, la sucursal más barata.
            const best = new Map<number, OpcionEnvio>();
            for (const o of all) {
                const cur = best.get(o.serviceTypeCode);
                if (!cur || o.value < cur.value) best.set(o.serviceTypeCode, o);
            }
            return [...best.values()].sort((a, b) => a.value - b.value);
        },
    });

    return {
        opciones: query.data ?? [],
        isLoading: cargandoCatalogo || (enabled && query.isLoading),
        isFetching: query.isFetching,
        isError: query.isError,
        /** county resuelto pero ningún local tiene stock de nada del carrito. */
        sinCobertura: Boolean(countyCode) && items.length > 0 && sinCobertura,
        hasCounty: Boolean(countyCode),
        /** Local con MÁS cobertura de stock del carrito. Sirve como origen del
         *  pedido cuando no hay cotización (pendiente/manual). null si no hay stock. */
        mejorSucursal,
    };
}
