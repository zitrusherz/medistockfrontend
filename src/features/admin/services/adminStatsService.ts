

import api from '@/lib/axios';
import {
    toVentaCategoria,
    toCotizacionesResumen,
    type VentaCategoria,
    type VentaCategoriaDTO,
    type CotizacionesResumen,
    type CotizacionesResumenDTO,
} from '../types';

const unwrap = <T>(data: { results?: T[] } | T[]): T[] =>
    Array.isArray(data) ? data : (data.results ?? []);

export interface RangoFechas {
    /** 'YYYY-MM-DD' inclusive. */
    desde?: string;
    /** 'YYYY-MM-DD' inclusive. */
    hasta?: string;
}

export const adminStatsService = {
    /** GET /payments/stats/ventas-por-categoria/ */
    async ventasPorCategoria(rango: RangoFechas = {}): Promise<VentaCategoria[]> {
        const { data } = await api.get<
            VentaCategoriaDTO[] | { results?: VentaCategoriaDTO[] }
        >('/payments/stats/ventas-por-categoria/', {
            params: { desde: rango.desde, hasta: rango.hasta },
        });
        return unwrap(data).map(toVentaCategoria);
    },

    /** GET /orders/cotizaciones/resumen/  (forma genérica; ver contrato). */
    async cotizacionesResumen(): Promise<CotizacionesResumen> {
        const { data } = await api.get<CotizacionesResumenDTO>(
            '/orders/cotizaciones/resumen/',
        );
        return toCotizacionesResumen(data);
    },
};
