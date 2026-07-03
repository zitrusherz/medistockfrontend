import { Link } from 'react-router';
import { MediaThumb } from './MediaThumb';
import type { FeaturedProduct } from '../types';


interface FeaturedGridProps {
  items: FeaturedProduct[];
  loading?: boolean;
  /** nº de skeletons mientras carga (debe coincidir con el corte de Home) */
  skeletonCount?: number;
}

function FeaturedCard({ product }: { product: FeaturedProduct }) {
  const href = `/producto/${product.codigo}`;
  return (
    <div className="group bg-white rounded-xl shadow-card overflow-hidden flex flex-col hover:shadow-lift transition-all hover:ring-1 hover:ring-gold-300 border-t-2 border-transparent hover:border-gold-400">
      <Link to={href} className="p-4 block">
        <MediaThumb
          src={product.imagenUrl}
          alt={product.nombre}
          label="Foto producto"
          className="h-44 w-full"
        />
      </Link>
      <div className="px-4 pb-2 flex-1">
        <span className="text-[11.5px] font-bold tracking-[0.12em] text-gold-600">
          {product.marca}
        </span>
        <Link
          to={href}
          className="mt-1 block text-[15px] font-semibold text-ink leading-snug hover:text-plum-700"
        >
          {product.nombre}
        </Link>
      </div>
      <Link
        to={href}
        className="m-3 mt-2 text-center bg-plum-700 hover:bg-plum-800 text-white text-[13.5px] font-bold py-2.5 rounded-lg ring-1 ring-gold-400/40 transition-colors"
      >
        Ver producto
      </Link>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col">
      <div className="p-4">
        <div className="h-44 rounded-lg bg-grape-100 animate-pulse" />
      </div>
      <div className="px-4 pb-2 flex-1 space-y-2">
        <div className="h-3 w-16 rounded bg-grape-100 animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-grape-100 animate-pulse" />
      </div>
      <div className="m-3 mt-2 h-10 rounded-lg bg-grape-100 animate-pulse" />
    </div>
  );
}

export function FeaturedGrid({ items, loading = false, skeletonCount = 4 }: FeaturedGridProps) {
  // Sin datos y sin carga: no dejamos una caja blanca vacía.
  if (!loading && items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-5 mt-5">
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => <CardSkeleton key={i} />)
            : items.map((p) => <FeaturedCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
