// features/catalog/types/index.ts
// Contratos del feature catálogo: DTOs (forma cruda de la API) + filtros.
// Los modelos de dominio (Product, Categoria, Marca) viven en @/types/models.

/** Marca tal como la devuelve la API (anidada o como recurso propio). */
export interface MarcaDTO {
  id: number;
  nombre: string;
  activo: boolean;
}

/** Categoría tal como la devuelve la API. */
export interface CategoriaDTO {
  id: number;
  nombre: string;
  activo: boolean;
}

/** Stock por sucursal en el endpoint de catálogo público. */
export interface StockPorSucursalDTO {
  sucursal_id: number;
  sucursal_nombre: string;
  stock_neto: number;
}

/**
 * Producto del CATÁLOGO público.
 * GET /api/inventory/catalogo/  y  /catalogo-cajas/
 * Ojo: difiere del producto "admin" (este trae precio_con_iva y stock_por_sucursal).
 */
export interface CatalogoProductoDTO {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  valor_unitario: number;            // neto CLP
  precio_con_iva: number;            // con IVA CLP
  marca: MarcaDTO | null;
  unidad_medida: string;
  largo_mm: number | null;
  ancho_mm: number | null;
  alto_mm: number | null;
  peso_mg: number | null;
  volumen_ml: number | null;
  requiere_control_vencimiento: boolean;
  registro_sanitario: string | null;
  activo: boolean;
  es_caja: boolean;
  categorias: string[];              // en catálogo vienen como nombres
  stock_por_sucursal: StockPorSucursalDTO[];
}

/** Filtros aceptados por el endpoint de catálogo. */
export interface CatalogoFiltros {
  marca_id?: number | string;
  categoria_id?: number | string;
  sucursal_id?: number | string;
  search?: string;
}

/** Sucursal cruda de la API de locations. */
export interface SucursalDTO {
  id: number;
  nombre: string;
  comuna?: string | null;
  activo?: boolean;
}

/** Modelo de dominio (idealmente vive en @/types/models junto a Categoria/Marca). */
export interface Sucursal {
  id: number;
  nombre: string;
}