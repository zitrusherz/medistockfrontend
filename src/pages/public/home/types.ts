/**
 * View-models locales de la Landing.
 *
 * Las secciones de la home son presentacionales: reciben estos shapes ya
 * resueltos desde `Home.tsx`. Así el acoplamiento con la forma exacta del
 * modelo de la API (campos del mapper `toProduct` / categorías) vive en UN
 * solo lugar (el mapeo dentro de `Home.tsx`), no esparcido por cada sección.
 */

export interface FeaturedProduct {
  id: number | string;
  /** código de producto — usado en la ruta /producto/:code */
  codigo: string;
  nombre: string;
  marca: string;
  imagenUrl: string | null;
}

export interface CategoryCard {
  id: number | string;
  nombre: string;
  /** slug o id usado como filtro en /catalogo?categoria=... */
  slug: string;
  imagenUrl: string | null;
}
