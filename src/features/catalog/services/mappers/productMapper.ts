

import type { Product, StockSucursal, Categoria, Marca } from '@/types/models';
import type {
    CatalogoProductoDTO,
    CategoriaEnProductoDTO,
    StockPorSucursalDTO,
    MarcaDTO,
    CategoriaDTO,
} from '../../types';

const toStockSucursal = (dto: StockPorSucursalDTO): StockSucursal => ({
    sucursalId: dto.sucursal_id,
    sucursalNombre: dto.sucursal_nombre,
    stock: dto.stock_neto,
});


const toCategoryName = (
    c: CategoriaEnProductoDTO | string | null | undefined,
): string => {
    if (c == null) return '';
    if (typeof c === 'string') return c;
    if (typeof c !== 'object') return '';

    // Shape real: { id, categoria: { id, nombre, ... } }
    const cat = (c as CategoriaEnProductoDTO).categoria;
    if (cat && typeof cat === 'object' && typeof cat.nombre === 'string' && cat.nombre.trim()) {
        return cat.nombre;
    }

    // Compat 1: { id, nombre } (si en algún momento el backend lo aplana)
    const flat = c as { nombre?: unknown };
    if (typeof flat.nombre === 'string' && flat.nombre.trim()) return flat.nombre;

    // Compat 2: { id, categoria: "string" } (shape antiguo)
    if (typeof cat === 'string' && (cat as string).trim()) return cat as string;

    return '';
};

export const toProduct = (dto: CatalogoProductoDTO): Product => {
    const stockBySucursal = (dto.stock_por_sucursal ?? []).map(toStockSucursal);

    return {
        id: dto.id,
        code: dto.sku,
        name: dto.nombre,
        brand: dto.marca?.nombre ?? '—',
        brandId: dto.marca?.id ?? null,
        // Filtramos vacíos para no pintar Badges en blanco.
        categories: (dto.categorias ?? [])
            .map(toCategoryName)
            .filter((s): s is string => s.length > 0),
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
        // El backend manda null cuando el producto aún no tiene foto cargada.
        imageUrl: dto.imagen_url ?? null,
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