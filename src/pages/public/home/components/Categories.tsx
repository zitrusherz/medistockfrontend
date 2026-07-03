// src/pages/public/home/components/Categories.tsx
import { Link } from 'react-router';
import { MediaThumb } from './MediaThumb';
import type { CategoryCard } from '../types';


interface CategoriesProps {
  items: CategoryCard[];
  loading?: boolean;
  skeletonCount?: number;
}

function CategorySkeleton() {
  return (
    <div className="text-center">
      <div className="aspect-square w-full rounded-lg bg-grape-100 animate-pulse" />
      <div className="mt-3 h-3.5 w-2/3 mx-auto rounded bg-grape-100 animate-pulse" />
    </div>
  );
}

export function Categories({ items, loading = false, skeletonCount = 5 }: CategoriesProps) {
  if (!loading && items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-5 mt-5">
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display font-bold text-plum-700 text-[26px]">Categorías populares</h2>
          <span className="flex-1 h-px gold-rule" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => <CategorySkeleton key={i} />)
            : items.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categorias/${cat.id}`}
                  className="group cursor-pointer text-center"
                >
                  <MediaThumb
                    src={cat.imagenUrl}
                    alt={cat.nombre}
                    label={cat.nombre}
                    className="aspect-square w-full group-hover:border-gold-400 transition-colors"
                  />
                  <p className="mt-3 text-[13.5px] font-semibold text-plum-700 group-hover:text-gold-600 transition-colors">
                    {cat.nombre}
                  </p>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
