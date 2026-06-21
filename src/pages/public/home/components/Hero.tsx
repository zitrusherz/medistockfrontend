import { Link } from 'react-router';
import { MediaThumb } from './MediaThumb';
import { ArrowIcon } from './icons';

/**
 * Hero — tesis de la landing. Portado de la maqueta (`Hero`).
 * Ambos CTA llevan al catálogo.
 */
export function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 mt-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-plum-800 via-plum-700 to-grape-700 shadow-lift ring-1 ring-gold-400/40">
        {/* halos decorativos */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="absolute left-1/3 -bottom-20 w-72 h-72 rounded-full bg-grape-500/30 blur-3xl" />

        <div className="grid lg:grid-cols-2 items-center">
          <div className="relative z-10 p-8 sm:p-12 lg:p-14">
            <span className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] text-gold-300 mb-4">
              <span className="h-px w-7 bg-gold-400" /> ABASTECE TU CENTRO DE SALUD
            </span>
            <h1 className="font-display font-bold text-white text-[46px] sm:text-[60px] leading-[0.95] tracking-tight">
              Todo lo clínico,
              <span className="block text-gold-gradient italic">en un solo lugar.</span>
            </h1>
            <div className="mt-5 h-[2px] w-40 gold-rule rounded-full" />
            <p className="mt-5 text-[16px] text-grape-100/85 max-w-md">
              Equipos, insumos, laboratorio y farmacia con despacho el mismo día y
              precios negociados para tu institución.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="flex items-center gap-2 bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-6 py-3 rounded-lg shadow-lift transition-colors"
              >
                Comprar ahora <ArrowIcon />
              </Link>
              <Link
                to="/catalogo"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-[15px] px-6 py-3 rounded-lg ring-1 ring-gold-300/50 transition-colors"
              >
                Ver catálogo
              </Link>
            </div>
          </div>

          <div className="relative h-full min-h-[260px] p-6 lg:p-8">
            <MediaThumb
              alt="Insumos médicos y personal clínico"
              label="Imagen hero — insumos médicos / personal clínico"
              className="relative w-full h-full min-h-[240px] bg-white/5 border-gold-300/30"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
