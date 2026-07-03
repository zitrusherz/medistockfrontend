

import api from '@/lib/axios';
import type { Product, Categoria, Marca } from '@/types/models';
import type {
    CatalogoFiltros,
    CatalogoProductoDTO,
    CategoriaDTO,
    CategoriaAnidadaDTO,   // ← usado por el árbol de categorías
    CategoriaArbol,        // ← modelo de dominio (ver types/index.ts)
    MarcaDTO,
    SucursalDTO,
    Sucursal,
} from '../types';
import { toProduct, toCategoria, toMarca } from './mappers/productMapper';

/** Desenvuelve respuestas paginadas DRF ({results}) o arrays planos. */
const unwrap = <T>(data: { results?: T[] } | T[]): T[] =>
    Array.isArray(data) ? data : (data.results ?? []);


const esCategoriaOculta = (nombre: string): boolean => {
    const n = (nombre ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita acentos
        .toLowerCase()
        .trim();
    return n.includes('caja');
};

/**
 * Elimina parámetros vacíos antes de mandarlos como query string.
 * Genérico: recibe ya las claves snake_case que espera la API.
 */
const cleanParams = (
    obj: Record<string, string | number | undefined | null>,
): Record<string, string | number> =>
    Object.fromEntries(
        Object.entries(obj).filter(
            ([, v]) => v !== undefined && v !== '' && v !== null,
        ),
    ) as Record<string, string | number>;

/**
 * Adapter de petición: traduce los filtros camelCase del front a los nombres
 * snake_case que exige la API. El front nunca conoce `marca_id` y la API nunca
 * ve `marcaId`. Un solo punto de traducción, igual que en el response.
 */
const toQueryParams = (f: CatalogoFiltros): Record<string, string | number> =>
    cleanParams({
        marca_id: f.marca_id,
        categoria_id: f.categoria_id,
        sucursal_id: f.sucursal_id,   // ya viajaba al server; ahora la UI sí lo usa
    });

/**
 * Adapter de respuesta para sucursal. Convención: el service devuelve modelos,
 * nunca el DTO crudo.
 */
const toSucursal = (dto: SucursalDTO): Sucursal => ({
    id: dto.id,
    nombre: dto.nombre,
});

/**
 * Adapter de respuesta para el ÁRBOL de categorías (recursivo).
 * snake_case → camelCase, normaliza `subcategorias` a [] cuando viene ausente y
 * PODA las subcategorías ocultas (cajas) en cada nivel.
 */
const toCategoriaArbol = (dto: CategoriaAnidadaDTO): CategoriaArbol => ({
    id: dto.id,
    nombre: dto.nombre,
    activo: dto.activo,
    padre: dto.padre,
    imagenUrl: dto.imagen_url ?? null,
    subcategorias: (dto.subcategorias ?? [])
        .filter((s) => !esCategoriaOculta(s.nombre))
        .map(toCategoriaArbol),
});

export const catalogService = {
    /** GET /api/inventory/catalogo/?marca_id&categoria_id&sucursal_id  (público) */
    getCatalogo: async (filtros: CatalogoFiltros = {}): Promise<Product[]> => {
        const { data } = await api.get('/inventory/catalogo/', {
            params: toQueryParams(filtros),
        });
        return unwrap<CatalogoProductoDTO>(data).map(toProduct);
    },

    /** GET /api/inventory/catalogo-cajas/  (público, solo es_caja=true) */
    getCatalogoCajas: async (filtros: CatalogoFiltros = {}): Promise<Product[]> => {
        const { data } = await api.get('/inventory/catalogo-cajas/', {
            params: toQueryParams(filtros),
        });
        return unwrap<CatalogoProductoDTO>(data).map(toProduct);
    },

    /** GET /api/inventory/public/productos/{id}/  (público) */
    getProducto: async (id: string | number): Promise<Product> => {
        const { data } = await api.get<CatalogoProductoDTO>(
            `/inventory/public/productos/${id}/`,
        );
        return toProduct(data);
    },

    /**
     * GET /api/inventory/public/categorias/  (público) — lista plana para filtros.
     * Oculta las categorías internas (cajas).
     */
    getCategorias: async (): Promise<Categoria[]> => {
        const { data } = await api.get('/inventory/public/categorias/');
        return unwrap<CategoriaDTO>(data)
            .map(toCategoria)
            .filter((c) => !esCategoriaOculta(c.nombre));
    },


    getCategoriasArbol: async (): Promise<CategoriaArbol[]> => {
        const { data } = await api.get('/inventory/public/categorias/arbol/');
        return unwrap<CategoriaAnidadaDTO>(data)
            .filter((d) => !esCategoriaOculta(d.nombre))
            .map(toCategoriaArbol);
    },

    /** GET /api/inventory/public/marcas/  (público) */
    getMarcas: async (): Promise<Marca[]> => {
        const { data } = await api.get('/inventory/public/marcas/');
        return unwrap<MarcaDTO>(data).map(toMarca);
    },

    /**
     * GET /api/locations/sucursales/  (público)
     * SUPUESTO: la lista de sucursales cuelga de /locations/sucursales/.
     * Si en tu API el path es otro (p. ej. /inventory/sucursales/), cámbialo aquí.
     */
    getSucursales: async (): Promise<Sucursal[]> => {
        const { data } = await api.get('/locations/sucursales/');
        return unwrap<SucursalDTO>(data).map(toSucursal);
    },
};
