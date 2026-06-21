import { Link } from 'react-router';
import { MediaThumb } from './MediaThumb';

/**
 * WidePromo — banner ancho promocional. Portado de la maqueta (`WidePromo`).
 * CTA al catálogo.
 */
export function WidePromo() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 mt-5">
      <div className="relative overflow-hidden rounded-2xl shadow-card">
        <div className="h-1.5 gold-rule" />
        <div className="relative bg-grape-50 px-6 py-10 sm:py-12 flex flex-col items-center text-center">
          <MediaThumb
            alt="Bodegón de insumos"
            label="bodegón insumos"
            className="absolute left-0 top-0 bottom-0 w-40 hidden md:flex rounded-none border-0"
          />
          <MediaThumb
            alt="Bodegón de insumos"
            label="bodegón insumos"
            className="absolute right-0 top-0 bottom-0 w-40 hidden md:flex rounded-none border-0"
          />
          <span className="text-[12px] font-bold tracking-[0.24em] text-gold-600">
            MEDISTOCK · SELECCIÓN PREMIUM
          </span>
          <h2 className="mt-2 font-display font-bold text-plum-700 text-[30px] sm:text-[42px] tracking-tight max-w-2xl leading-tight">
            Productos confiables. Selección increíble. Valor inigualable.
          </h2>
          <div className="mt-4 h-[2px] w-28 gold-rule rounded-full" />
          <Link
            to="/catalogo"
            className="mt-5 bg-plum-700 hover:bg-plum-800 text-white font-bold text-[15px] px-8 py-3 rounded-lg ring-1 ring-gold-400/60 transition-colors"
          >
            COMPRAR AHORA
          </Link>
        </div>
      </div>
    </section>
  );
}
