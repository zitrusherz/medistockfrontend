// src/features/catalog/types/index.ts
// Contratos del feature catálogo: DTOs (forma cruda de la API) + filtros.
// Los modelos de dominio (Product, Categoria, Marca) viven en @/types/models.

/** Marca tal como la devuelve la API (anidada o como recurso propio). */
export interface MarcaDTO {
  id: number;
  nombre: string;
  activo: boolean;
  /** Presente en el catálogo público; opcional para no romper otros endpoints. */
  imagen_url?: string | null;
}

/** Categoría tal como la devuelve la API (recurso /public/categorias/). */
export interface CategoriaDTO {
  id: number;
  nombre: string;
  activo: boolean;
}

/**
 * Categoría tal como viene anidada DENTRO de la relación producto-categoría.
 * Es el modelo completo, con jerarquía (padre / subcategorias).
 */
export interface CategoriaAnidadaDTO {
  id: number;
  nombre: string;
  activo: boolean;
  padre: number | null;
  /** Si en algún momento el backend la expande, son del mismo shape. */
  subcategorias: CategoriaAnidadaDTO[];
  imagen_url: string | null;
}

/**
 * Lo que el backend mete en `producto.categorias[]`.
 *
 * REALIDAD: no es la categoría directa; es la fila de la TABLA INTERMEDIA
 * producto-categoría. Tiene su propio `id` (id de la relación) y un campo
 * `categoria` que envuelve la categoría real.
 *
 *   { id: 80, categoria: { id: 15, nombre: "...", padre, subcategorias, ... } }
 *
 * El mapper extrae `c.categoria.nombre` y descarta el resto.
 */
export interface CategoriaEnProductoDTO {
  id: number;
  categoria: CategoriaAnidadaDTO;
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
  /** Filas de la tabla intermedia producto-categoría con la categoría anidada. */
  categorias: CategoriaEnProductoDTO[];
  /** El endpoint de detalle no siempre lo trae; el de catálogo sí. */
  stock_por_sucursal?: StockPorSucursalDTO[];
  imagen_url?: string | null;        // URL absoluta servida por el backend (media/); null o ausente si no tiene foto
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