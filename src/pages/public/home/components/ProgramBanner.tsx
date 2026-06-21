import { Link } from 'react-router';
import { ShieldIcon } from './icons';

/**
 * ProgramBanner — banner del programa de vacunas. Portado de la maqueta
 * (`ProgramBanner`). CTA al catálogo.
 */
export function ProgramBanner() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 mt-5 mb-10">
      <div className="relative overflow-hidden rounded-2xl shadow-lift ring-1 ring-gold-400/50 bg-gradient-to-r from-plum-800 via-plum-700 to-grape-600 px-8 py-10 sm:py-12">
        <div className="absolute -right-20 -bottom-24 w-80 h-80 rounded-full bg-gold-400/10" />
        <div className="absolute inset-x-0 top-0 h-[3px] gold-rule" />
        <div className="relative grid md:grid-cols-[auto_1fr] items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <span className="text-gold-300">
              <ShieldIcon />
            </span>
            <div className="leading-tight">
              <span className="block text-[11px] font-bold tracking-[0.2em] text-gold-300">
                GARANTÍA 2026
              </span>
              <span className="block font-display font-bold text-3xl">Sin preocupaciones</span>
            </div>
          </div>
          <div className="text-white md:border-l md:border-gold-300/30 md:pl-8">
            <h2 className="font-display font-bold text-[34px] sm:text-[46px] leading-none tracking-tight">
              Programa de <span className="text-gold-gradient italic">vacunas</span>
            </h2>
            <p className="mt-2 text-[16px] text-grape-100">
              Porque muchos confían en ti… tú puedes confiar en nosotros.
            </p>
            <Link
              to="/catalogo"
              className="inline-block mt-5 bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[14px] px-6 py-2.5 rounded-md transition-colors"
            >
              Inscríbete al programa
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
