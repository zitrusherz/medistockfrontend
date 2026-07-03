

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
