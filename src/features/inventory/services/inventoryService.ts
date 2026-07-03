

import api from '@/lib/axios';
import type { Paginated } from '@/types/api';
import type {
    Inventario,
    Lote,
    IngresarProductoRequest,
    IngresarProductoResponse,
} from '../types';
import type { AlertaStock, AlertaVencimiento } from '../types/alerts';
import { toAlertaStock, toAlertaVencimiento } from './mappers/alertMapper';


import { toProduct } from '@/features/catalog/services/mappers/productMapper';
import type {
    CatalogoProductoDTO,
    CatalogoFiltros,
    SucursalDTO,
    Sucursal,
} from '@/features/catalog/types';
import type { Product, Marca, Categoria } from '@/types/models';

/** Tolera arreglo plano o sobre DRF paginado. */
function unwrapList<T>(data: T[] | Paginated<T>): T[] {
    return Array.isArray(data) ? data : data.results;
}

/**
 * Quita params vacíos antes del query string.
 * Acepta `object` (no `Record<...>`) para tolerar interfaces sin index
 * signature, como `CatalogoFiltros`. El cast interno es seguro: solo leemos.
 */
function cleanParams(obj: object): Record<string, string | number | boolean> {
    return Object.fromEntries(
        Object.entries(obj as Record<string, unknown>).filter(
            ([, v]) => v !== undefined && v !== '' && v !== null,
        ),
    ) as Record<string, string | number | boolean>;
}

/** Filtros opcionales del listado de lotes (deben calzar con el FilterSet del backend). */
export interface LoteQuery {
    producto_id?: number | string;
    sucursal?: number | string;
    activo?: boolean;
}

/** Filtros opcionales del listado de inventarios. */
export interface InventarioQuery {
    sucursal?: number | string;
    producto_id?: number | string;
    activo?: boolean;
}

/* --- getters crudos (contrato de la API, snake_case) ---------------------- */

/** GET /api/inventory/lotes/ — lotes con producto, vencimiento y días para vencer. */
async function fetchLotes(params?: LoteQuery): Promise<Lote[]> {
    const { data } = await api.get<Lote[] | Paginated<Lote>>('/inventory/lotes/', {
        params,
    });
    return unwrapList(data);
}

/** GET /api/inventory/inventarios/ — stock por lote+sucursal (con el lote anidado). */
async function fetchInventarios(params?: InventarioQuery): Promise<Inventario[]> {
    const { data } = await api.get<Inventario[] | Paginated<Inventario>>('/inventory/inventarios/', {
        params,
    });
    return unwrapList(data);
}

/* --- helpers de T4.2 ------------------------------------------------------ */


function buildIngresoFormData(
    body: IngresarProductoRequest,
    imagen?: File | null,
): FormData {
    const fd = new FormData();

    const put = (key: string, value: unknown) => {
        if (value !== undefined && value !== null && value !== '') {
            fd.append(key, String(value));
        }
    };

    put('sku', body.sku);
    put('nombre', body.nombre);
    put('descripcion', body.descripcion);
    put('valor_unitario', body.valor_unitario);
    put('marca_id', body.marca_id);
    put('unidad_medida', body.unidad_medida);
    put('requiere_control_vencimiento', body.requiere_control_vencimiento);
    put('registro_sanitario', body.registro_sanitario);
    put('es_caja', body.es_caja);
    put('largo_mm', body.largo_mm);
    put('ancho_mm', body.ancho_mm);
    put('alto_mm', body.alto_mm);
    put('peso_mg', body.peso_mg);
    put('volumen_ml', body.volumen_ml);

    (body.categoria_ids ?? []).forEach((id) => fd.append('categoria_ids', String(id)));

    // Lote + stock inicial
    put('codigo_lote', body.codigo_lote);
    put('fecha_elaboracion', body.fecha_elaboracion);
    put('fecha_vencimiento', body.fecha_vencimiento);
    put('sucursal_id', body.sucursal_id);
    put('cantidad', body.cantidad);
    put('stock_critico', body.stock_critico);
    put('motivo', body.motivo);
    put('observacion', body.observacion);

    if (imagen) fd.append('imagen', imagen);

    return fd;
}

export const inventoryService = {
    // ── crudos ────────────────────────────────────────────────────────────
    getLotes: fetchLotes,
    getInventarios: fetchInventarios,

    // ── de dominio (Adapter aplicado): alertas de logística (T3.6) ──────────
    /** Alertas de stock por sucursal (Inventario → AlertaStock). */
    async getAlertasStock(params?: InventarioQuery): Promise<AlertaStock[]> {
        const inventarios = await fetchInventarios(params);
        return inventarios.map(toAlertaStock);
    },

    /** Alertas de vencimiento por lote (Lote → AlertaVencimiento). */
    async getAlertasVencimiento(params?: LoteQuery): Promise<AlertaVencimiento[]> {
        const lotes = await fetchLotes(params);
        return lotes.map(toAlertaVencimiento);
    },

    // ── T4.2: catálogo admin + alta de producto ────────────────────────────


    async getProductosCatalogo(filtros: CatalogoFiltros = {}): Promise<Product[]> {
        const { data } = await api.get<CatalogoProductoDTO[] | Paginated<CatalogoProductoDTO>>(
            '/inventory/catalogo/',
            { params: cleanParams(filtros) },
        );
        return unwrapList(data).map(toProduct);
    },

    /** GET /inventory/marcas/ — para poblar el <select> de marca del alta. */
    async getMarcas(): Promise<Marca[]> {
        const { data } = await api.get<Marca[] | Paginated<Marca>>('/inventory/marcas/');
        return unwrapList(data);
    },

    /** GET /inventory/categorias/ — para poblar el <select> de categoría del alta. */
    async getCategorias(): Promise<Categoria[]> {
        const { data } = await api.get<Categoria[] | Paginated<Categoria>>('/inventory/categorias/');
        return unwrapList(data);
    },

    /**
     * GET /locations/sucursales/ — sucursales activas para el stock inicial.
     * Conveniencia de lectura para el alta. (Podría migrarse a locationsService;
     * se deja aquí para mantener el feature autocontenido.)
     */
    async getSucursales(): Promise<Sucursal[]> {
        const { data } = await api.get<SucursalDTO[] | Paginated<SucursalDTO>>('/locations/sucursales/');
        return unwrapList(data)
            .filter((s) => s.activo !== false)
            .map((s) => ({ id: s.id, nombre: s.nombre }));
    },

    /**
     * POST /inventory/ingresar-producto/ — alta combinada (producto + lote + stock)
     * en una sola llamada. Multipart porque incluye imagen.
     */
    async ingresarProducto(
        body: IngresarProductoRequest,
        imagen?: File | null,
    ): Promise<IngresarProductoResponse> {
        const fd = buildIngresoFormData(body, imagen);
        const { data } = await api.post<IngresarProductoResponse>(
            '/inventory/ingresar-producto/',
            fd,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return data;
    },
};
