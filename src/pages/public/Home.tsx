// src/pages/public/Home.tsx
import { useMemo } from 'react';
import { useCatalogo } from '@/features/catalog/hooks/useCatalogo.ts';
import { useCategoriasArbol } from '@/features/catalog/hooks/useCategoriasArbol.ts';
import {
  Hero,
  TrustBar,
  FeaturedGrid,
  WidePromo,
  Categories,
  TwoUp,
  ProgramBanner,
} from './home/components';
import type { FeaturedProduct, CategoryCard } from './home/types';

/**
 * Home — landing pública. Capa de página (Layered): orquesta los datos vía
 * hooks (`useCatalogo`, `useCategoriasArbol`), los mapea a view-models y los pasa
 * a secciones presentacionales. Una página nunca llama axios.
 *
 * - Destacados: primeros N de `getCatalogo()`.
 * - Categorías: `getCategoriasArbol()` — el endpoint ÁRBOL es el único que trae
 *   `imagen_url`; el endpoint plano (`/public/categorias/`) NO, por eso antes las
 *   cards salían siempre con el placeholder rayado. El service ya oculta "cajas".
 * - Degradación elegante (M12): si destacados/categorías fallan o vienen vacíos,
 *   esas secciones simplemente no se renderizan.
 *
 * El chrome (TopBar/Header/Footer) lo aporta el shell público (PublicLayout), no
 * la página; aquí solo viven las secciones de contenido.
 */

const FEATURED_TOTAL = 8; // 4 arriba + 4 abajo

type Raw = Record<string, unknown>;

/** Normaliza la respuesta a array, venga plana o como wrapper DRF {results}. */
function asList(data: unknown): Raw[] {
  if (Array.isArray(data)) return data as Raw[];
  if (data && typeof data === 'object') {
    const d = data as Raw;
    for (const key of ['results', 'productos', 'categorias', 'items'] as const) {
      if (Array.isArray(d[key])) return d[key] as Raw[];
    }
  }
  return [];
}

/** Lee el primer campo no vacío entre varias claves; soporta valores anidados {nombre}. */
function firstString(obj: Raw, keys: string[]): string {
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === 'string' && val.trim()) return val;
    if (typeof val === 'number') return String(val);
    if (val && typeof val === 'object' && 'nombre' in (val as Raw)) {
      const n = (val as Raw).nombre;
      if (typeof n === 'string' && n.trim()) return n;
    }
  }
  return '';
}

function firstUrl(obj: Raw, keys: string[]): string | null {
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === 'string' && val.trim()) return val;
  }
  return null;
}

function toFeatured(p: Raw): FeaturedProduct {
  const codigo = firstString(p, ['codigo', 'code', 'codigo_producto', 'sku']);
  return {
    id: (p.id as number | string) ?? codigo,
    codigo,
    nombre: firstString(p, ['nombre', 'name', 'titulo']),
    marca: firstString(p, ['marca', 'brand', 'marca_nombre']),
    imagenUrl: firstUrl(p, ['imageUrl', 'imagenUrl', 'imagen', 'imagen_url', 'image', 'thumbnail']),
  };
}

function toCategoryCard(c: Raw): CategoryCard {
  const id = (c.id as number | string) ?? firstString(c, ['slug', 'nombre']);
  return {
    id,
    nombre: firstString(c, ['nombre', 'name', 'titulo']),
    slug: firstString(c, ['slug', 'codigo']) || String(id),
    // `useCategoriasArbol` ya entrega camelCase (`imagenUrl`); dejamos las demás
    // claves por compat si algún día cambia la fuente.
    imagenUrl: firstUrl(c, ['imagenUrl', 'imagen', 'imagen_url', 'image']),
  };
}

export default function Home() {
  // Si tu `useCatalogo` no acepta argumentos, llama `useCatalogo()` sin el objeto.
  // Interfaz del hook: { productos, isLoading, isFetching, isEmpty, isError }.
  const catalogo = useCatalogo({});
  const categorias = useCategoriasArbol();

  const featured = useMemo<FeaturedProduct[]>(
      () => asList(catalogo.productos).slice(0, FEATURED_TOTAL).map(toFeatured),
      [catalogo.productos],
  );

  const cats = useMemo<CategoryCard[]>(
      () => asList(categorias.data).map(toCategoryCard),
      [categorias.data],
  );

  const featuredTop = featured.slice(0, 4);
  const featuredBottom = featured.slice(4, 8);
  const featuredLoading = catalogo.isLoading;

  return (
      <>
        <TrustBar />
        <Hero />
        <FeaturedGrid items={featuredTop} loading={featuredLoading} skeletonCount={4} />
        <WidePromo />
        <Categories items={cats} loading={categorias.isLoading} skeletonCount={5} />
        <TwoUp />
        <FeaturedGrid items={featuredBottom} loading={featuredLoading} skeletonCount={4} />
        <ProgramBanner />
      </>
  );
}
