// features/catalog/services/mappers/productMapper.ts
// Adapter: traduce el DTO crudo de la API al modelo de dominio que usa la UI.
// Regla de oro: el frontend elige sus propios nombres; si la API cambia un campo,
// SOLO cambia este archivo.

import type { Product, StockSucursal, Categoria, Marca } from '@/types/models';import type {
    CatalogoProductoDTO,
    StockPorSucursalDTO,
    MarcaDTO,
    CategoriaDTO,
} from '../../types';

const toStockSucursal = (dto: StockPorSucursalDTO): StockSucursal => ({
    sucursalId: dto.sucursal_id,
    sucursalNombre: dto.sucursal_nombre,
    stock: dto.stock_neto,
});



export const toProduct = (dto: CatalogoProductoDTO): Product => {
    const stockBySucursal = (dto.stock_por_sucursal ?? []).map(toStockSucursal);

    return {
        id: dto.id,
        code: dto.sku,
        name: dto.nombre,
        brand: dto.marca?.nombre ?? '—',
        brandId: dto.marca?.id ?? null,
        categories: dto.categorias ?? [],
        unit: dto.unidad_medida,
        description: dto.descripcion ?? '',
        registroSanitario: dto.registro_sanitario ?? null,
        requiereControlVencimiento: dto.requiere_control_vencimiento,
        esCaja: dto.es_caja,
        activo: dto.activo,
        priceNeto: dto.valor_unitario,
        priceIva: dto.precio_con_iva,
        stockBySucursal,
        // Campo derivado: suma de todo el stock (útil para badge global M3).
        stockTotal: stockBySucursal.reduce((acc, s) => acc + s.stock, 0),
    };
};

export const toMarca = (dto: MarcaDTO): Marca => ({
    id: dto.id,
    nombre: dto.nombre,
    activo: dto.activo,
});

export const toCategoria = (dto: CategoriaDTO): Categoria => ({
    id: dto.id,
    nombre: dto.nombre,
    activo: dto.activo,
});

// --------------------------------------------------------------------------


