import { Link } from 'react-router';

/**
 * TwoUp — dos bloques promocionales. Portado de la maqueta (`TwoUp` + `PromoBlock`).
 * CTAs al catálogo.
 */
interface PromoBlockProps {
  title: string;
  accent: string;
  gradient: string;
}

function PromoBlock({ title, accent, gradient }: PromoBlockProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-card ring-1 ring-gold-400/40 ${gradient} p-8 sm:p-10 min-h-[150px] flex flex-col justify-center`}
    >
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-gold-300/10" />
      <div className="absolute right-16 -top-12 w-40 h-40 rounded-full bg-white/5" />
      <h3 className="relative font-display font-semibold text-white text-[30px] sm:text-[38px] tracking-tight leading-none">
        {title} <span className="text-gold-gradient font-bold italic">{accent}</span>
      </h3>
      <Link
        to="/catalogo"
        className="relative mt-5 self-start bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[14px] px-6 py-2.5 rounded-md transition-colors"
      >
        Comprar ahora
      </Link>
    </div>
  );
}

export function TwoUp() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 mt-5 grid md:grid-cols-2 gap-5">
      <PromoBlock
        title="PROVEEDOR"
        accent="DESTACADO"
        gradient="bg-gradient-to-br from-plum-800 to-grape-600"
      />
      <PromoBlock
        title="OFERTAS"
        accent="ESPECIALES"
        gradient="bg-gradient-to-br from-plum-700 to-azure-700"
      />
    </section>
  );
}
