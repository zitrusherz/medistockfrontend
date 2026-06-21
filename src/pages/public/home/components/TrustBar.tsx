import { AccuracyIcon, TruckIcon, BoxesIcon } from './icons';

/**
 * TrustBar — barra de confianza. Portada de la maqueta (`TrustBar`).
 * Cifras de marketing estáticas (no provienen de la API).
 */
const ITEMS = [
  { Icon: AccuracyIcon, strong: '99,9%', text: 'PRECISIÓN EN PEDIDOS' },
  { Icon: TruckIcon, strong: '94%', text: 'DE PEDIDOS ENVIADOS EL MISMO DÍA' },
  { Icon: BoxesIcon, strong: '190.000', text: 'PRODUCTOS MÉDICOS EN UN SOLO LUGAR' },
];

export function TrustBar() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 mt-5">
      <div className="bg-white rounded-xl shadow-card ring-gold grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-grape-100 overflow-hidden">
        {ITEMS.map(({ Icon, strong, text }) => (
          <div key={text} className="flex items-center justify-center gap-3 py-4 px-4 text-center">
            <span className="text-gold-500">
              <Icon />
            </span>
            <p className="text-[14px] font-semibold text-plum-700">
              <span className="text-gold-gradient font-extrabold">{strong}</span> {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
